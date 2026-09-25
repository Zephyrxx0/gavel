import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/route';
import { UploadResponseSchema } from '@/lib/schemas/upload';

// Mock pdf-parse
const mockPdfParse = vi.fn();
vi.mock('pdf-parse', () => ({
  default: (...args: unknown[]) => mockPdfParse(...args),
}));
vi.mock('pdf-parse/lib/pdf-parse.js', () => ({
  default: (...args: unknown[]) => mockPdfParse(...args),
}));

// Mock mammoth
const mockExtractRawText = vi.fn();
vi.mock('mammoth', () => ({
  default: {
    extractRawText: (...args: unknown[]) => mockExtractRawText(...args),
  },
}));

function createUploadRequest(file?: File): NextRequest {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  return new NextRequest('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });
}

describe('Upload Route Handler (/api/upload)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects requests with missing or non-file payload (400 INVALID_REQUEST)', async () => {
    const req = createUploadRequest(); // no file appended
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('INVALID_REQUEST');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('rejects files exceeding the 10MB ceiling (413 PAYLOAD_TOO_LARGE)', async () => {
    const oversizedBuffer = new Uint8Array(10 * 1024 * 1024 + 10);
    const oversizedFile = new File([oversizedBuffer], 'large.pdf', { type: 'application/pdf' });

    const req = createUploadRequest(oversizedFile);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(413);
    expect(body.success).toBe(false);
    expect(body.error).toBe('PAYLOAD_TOO_LARGE');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('rejects unsupported file formats (415 UNSUPPORTED_TYPE)', async () => {
    const invalidFile = new File(['malicious executable'], 'malware.exe', {
      type: 'application/x-msdownload',
    });

    const req = createUploadRequest(invalidFile);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(415);
    expect(body.success).toBe(false);
    expect(body.error).toBe('UNSUPPORTED_TYPE');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('extracts and cleans text from valid PDF files', async () => {
    const validLegalText =
      'This Residential Tenancy Agreement is entered into between Landlord and Tenant with all statutory rights preserved.';
    mockPdfParse.mockResolvedValueOnce({ text: validLegalText });

    const pdfFile = new File(['dummy pdf binary content'], 'lease.pdf', {
      type: 'application/pdf',
    });

    const req = createUploadRequest(pdfFile);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
    expect(body.data.text).toContain('Residential Tenancy Agreement');
    expect(body.data.isImage).toBe(false);
    expect(body.data.wordCount).toBeGreaterThan(5);
    expect(body.data.fileName).toBe('lease.pdf');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('handles encrypted / password-protected PDF files (422 PASSWORD_PROTECTED)', async () => {
    mockPdfParse.mockRejectedValueOnce(new Error('Password required to decrypt PDF file'));

    const encryptedPdf = new File(['encrypted pdf binary'], 'secure.pdf', {
      type: 'application/pdf',
    });

    const req = createUploadRequest(encryptedPdf);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toBe('PASSWORD_PROTECTED');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('handles corrupt PDF files (422 CORRUPT_FILE)', async () => {
    mockPdfParse.mockRejectedValueOnce(new Error('Invalid XRef table or damaged stream'));

    const corruptPdf = new File(['corrupt binary data'], 'broken.pdf', {
      type: 'application/pdf',
    });

    const req = createUploadRequest(corruptPdf);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toBe('CORRUPT_FILE');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('rejects PDF documents yielding fewer than 50 characters (422 EMPTY_TEXT)', async () => {
    mockPdfParse.mockResolvedValueOnce({ text: 'Scanned image only' }); // only 18 chars

    const scannedPdf = new File(['scanned binary'], 'scanned.pdf', {
      type: 'application/pdf',
    });

    const req = createUploadRequest(scannedPdf);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toBe('EMPTY_TEXT');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('extracts and cleans text from valid DOCX files', async () => {
    const validDocxText =
      'Employment Agreement between Acme Corp and Employee detailing confidentiality covenants and non-compete terms.';
    mockExtractRawText.mockResolvedValueOnce({ value: validDocxText });

    const docxFile = new File(['docx binary content'], 'contract.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const req = createUploadRequest(docxFile);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.text).toContain('Employment Agreement between Acme Corp');
    expect(body.data.isImage).toBe(false);
    expect(body.data.fileName).toBe('contract.docx');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('handles corrupt DOCX files (422 CORRUPT_FILE)', async () => {
    mockExtractRawText.mockRejectedValueOnce(new Error('Invalid zip structure'));

    const corruptDocx = new File(['not a zip archive'], 'broken.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const req = createUploadRequest(corruptDocx);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toBe('CORRUPT_FILE');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('rejects DOCX documents yielding fewer than 50 characters (422 EMPTY_TEXT)', async () => {
    mockExtractRawText.mockResolvedValueOnce({ value: 'Short header' }); // 12 chars

    const emptyDocx = new File(['docx binary'], 'empty.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const req = createUploadRequest(emptyDocx);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.success).toBe(false);
    expect(body.error).toBe('EMPTY_TEXT');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('converts JPG image files to base64 payload blocks for vision models', async () => {
    const rawImageBytes = 'pretend-image-binary-bytes-data-stream';
    const expectedBase64 = Buffer.from(rawImageBytes).toString('base64');

    const imageFile = new File([rawImageBytes], 'notice.jpg', {
      type: 'image/jpeg',
    });

    const req = createUploadRequest(imageFile);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.isImage).toBe(true);
    expect(body.data.rawBase64).toBe(expectedBase64);
    expect(body.data.mimeType).toBe('image/jpeg');
    expect(body.data.wordCount).toBe(0);
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });

  it('converts PNG image files to base64 payload blocks for vision models', async () => {
    const rawImageBytes = 'png-binary-stream-sample';
    const expectedBase64 = Buffer.from(rawImageBytes).toString('base64');

    const pngFile = new File([rawImageBytes], 'photo.png', {
      type: 'image/png',
    });

    const req = createUploadRequest(pngFile);
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.isImage).toBe(true);
    expect(body.data.rawBase64).toBe(expectedBase64);
    expect(body.data.mimeType).toBe('image/png');
    expect(UploadResponseSchema.safeParse(body).success).toBe(true);
  });
});
