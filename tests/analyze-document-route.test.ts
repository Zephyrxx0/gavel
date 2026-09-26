import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/analyze/document/route';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { DocumentAnalysisSchema } from '@/lib/schemas/document';
import { DOCUMENT_SYSTEM_PROMPT, buildDocumentUserPrompt } from '@/lib/prompts/document';

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

const mockModel = 'mocked-gemini-model';
const mockGoogle = vi.fn(() => mockModel);

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => mockGoogle),
}));

function createAnalyzeRequest(body?: unknown, rawJson?: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/analyze/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawJson !== undefined ? rawJson : JSON.stringify(body),
  });
}

describe('Analyze Document Route Handler (/api/analyze/document)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-gemini-key-123' };
  });

  it('rejects requests when Gemini API key is missing (500 CONFIG_ERROR)', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const req = createAnalyzeRequest({ text: 'Valid legal agreement with sufficient length to analyze.' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('CONFIG_ERROR');
    expect(body.message).toContain('API key is not configured');
  });

  it('rejects malformed JSON payload (400 INVALID_REQUEST)', async () => {
    const req = createAnalyzeRequest(undefined, 'invalid-json-{');
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  it('rejects empty payloads missing both text and imageBase64 (400 INVALID_REQUEST)', async () => {
    const req = createAnalyzeRequest({});
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  it('rejects text payloads under 30 characters (400 EMPTY_TEXT)', async () => {
    const req = createAnalyzeRequest({ text: 'Too short agreement' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('EMPTY_TEXT');
  });

  it('successfully analyzes valid text document via generateObject (200)', async () => {
    const mockAnalysis = {
      documentType: 'Non-Disclosure Agreement',
      parties: ['Company A', 'Recipient B'],
      summary: 'Standard bilateral non-disclosure agreement protecting proprietary technical information.',
      clauses: [
        {
          id: 'clause-1',
          title: 'Confidentiality Period',
          originalText: 'Confidential information shall be protected for 5 years.',
          simplified: 'The duty of secrecy lasts for five years from the date of disclosure.',
          risk: 'standard',
          riskReason: 'Five-year confidentiality window is customary in technology agreements.',
          obligation: 'mutual',
        },
      ],
      checklist: [
        {
          id: 'item-1',
          timing: 'before_signing',
          actionType: 'verify',
          description: 'Verify definition of proprietary information aligns with shared trade secrets.',
          relatedClauseId: 'clause-1',
        },
      ],
      lawyerQuestions: [
        {
          id: 'q-1',
          question: 'Does the five-year survival period create unreasonable post-employment tail risk?',
          context: 'Clause 1 binds recipient for 5 years across all technical categories.',
          relatedClauseId: 'clause-1',
        },
      ],
    };

    vi.mocked(generateObject).mockResolvedValueOnce({
      object: mockAnalysis,
    } as any);

    const docText = 'This Non-Disclosure Agreement is entered into by Company A and Recipient B regarding proprietary trade secrets.';
    const req = createAnalyzeRequest({ text: docText });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.documentType).toBe('Non-Disclosure Agreement');
    expect(body.data.clauses).toHaveLength(1);
    expect(body.data.checklist).toHaveLength(1);
    expect(body.data.lawyerQuestions).toHaveLength(1);

    expect(mockGoogle).toHaveBeenCalledWith('gemini-2.5-flash');
    expect(generateObject).toHaveBeenCalledWith({
      model: 'mocked-gemini-model',
      schema: DocumentAnalysisSchema,
      system: DOCUMENT_SYSTEM_PROMPT,
      prompt: buildDocumentUserPrompt(docText),
    });
  });

  it('successfully analyzes multimodal base64 image document via generateObject (200)', async () => {
    const mockAnalysis = {
      documentType: 'Residential Lease Agreement',
      parties: ['John Doe (Landlord)', 'Jane Smith (Tenant)'],
      summary: 'Residential lease agreement with automatic renewal terms and security deposit withholding provisions.',
      clauses: [
        {
          id: 'clause-1',
          title: 'Security Deposit Forfeiture',
          originalText: 'Landlord may retain full deposit upon any breach without itemized proof.',
          simplified: 'The landlord can keep your entire deposit without providing an itemized list of deductions.',
          risk: 'high',
          riskReason: 'Unilateral deposit forfeiture contradicts standard statutory tenancy protection practices.',
          obligation: 'counterparty',
        },
      ],
      checklist: [
        {
          id: 'item-1',
          timing: 'before_signing',
          actionType: 'negotiate',
          description: 'Request statutory itemized deduction requirement with a 14-day turnaround.',
          relatedClauseId: 'clause-1',
        },
      ],
      lawyerQuestions: [
        {
          id: 'q-1',
          question: 'Is unilateral deposit forfeiture enforceable under local tenancy regulations?',
          context: 'Clause 1 allows immediate total retention without inspection reports.',
          relatedClauseId: 'clause-1',
        },
      ],
    };

    vi.mocked(generateObject).mockResolvedValueOnce({
      object: mockAnalysis,
    } as any);

    const req = createAnalyzeRequest({
      imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      mimeType: 'image/png',
      fileName: 'lease-scan.png',
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.documentType).toBe('Residential Lease Agreement');
    expect(body.data.clauses[0].risk).toBe('high');

    expect(generateObject).toHaveBeenCalledWith({
      model: 'mocked-gemini-model',
      schema: DocumentAnalysisSchema,
      system: DOCUMENT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze the attached legal document image and extract the complete structured analysis:',
            },
            {
              type: 'image',
              image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
            },
          ],
        },
      ],
    });
  });

  it('handles AI inference errors gracefully (500 ANALYSIS_FAILED)', async () => {
    vi.mocked(generateObject).mockRejectedValueOnce(new Error('Gemini rate limit exceeded'));

    const req = createAnalyzeRequest({
      text: 'This is a sufficiently long legal document text that triggers an AI inference exception.',
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('ANALYSIS_FAILED');
    expect(body.message).toContain('Gemini rate limit exceeded');
  });
});

