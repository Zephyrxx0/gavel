import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { cleanText, countWords } from '@/lib/text-utils';
import { UploadResponseSchema } from '@/lib/schemas/upload';

/**
 * Enforce Node.js runtime for volatile Buffer operations.
 * Next.js edge runtime lacks Buffer and stream implementations required by pdf-parse.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Maximum file size ceiling: 10MB across all formats */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

type ParseResult =
  | { success: true; text: string }
  | { success: false; error: 'PASSWORD_PROTECTED' | 'CORRUPT_FILE'; message: string };

/**
 * Extracts raw textual content from an in-memory PDF Buffer.
 * Detects password protection, encryption, and structural corruption.
 */
async function extractPdfText(buffer: Buffer): Promise<ParseResult> {
  try {
    const parsed = await pdfParse(buffer);
    return { success: true, text: parsed.text || '' };
  } catch (err: unknown) {
    console.error('[/api/upload] PDF parse failure:', err);
    const errorMsg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
      return {
        success: false,
        error: 'PASSWORD_PROTECTED',
        message: 'The PDF document is encrypted or password-protected.',
      };
    }
    return {
      success: false,
      error: 'CORRUPT_FILE',
      message: 'Unable to parse PDF content. The file may be corrupt.',
    };
  }
}

/**
 * Extracts raw text from an in-memory DOCX Buffer using mammoth.
 * Strips XML and style artifacts while preserving paragraph structure.
 */
async function extractDocxText(buffer: Buffer): Promise<ParseResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return { success: true, text: result.value || '' };
  } catch (err: unknown) {
    console.error('[/api/upload] DOCX parse failure:', err);
    return {
      success: false,
      error: 'CORRUPT_FILE',
      message: 'Unable to parse DOCX content. The file may be corrupt.',
    };
  }
}

/**
 * Document Intake API Route (/api/upload)
 * 
 * Ephemeral document ingestion endpoint:
 * - Processes PDF, DOCX, JPG, and PNG files entirely in volatile RAM (zero disk writes).
 * - Enforces 10MB upload ceiling.
 * - Cleans and normalizes text for downstream Gemini LLM reasoning.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    // 1. Validate payload presence and type
    if (!file || !(file instanceof File)) {
      const errorPayload = {
        success: false,
        error: 'INVALID_REQUEST' as const,
        message: 'No valid file provided.',
      };
      return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 400 });
    }

    // 2. Enforce strict size threshold (10MB)
    if (file.size > MAX_FILE_SIZE) {
      const errorPayload = {
        success: false,
        error: 'PAYLOAD_TOO_LARGE' as const,
        message: 'File size exceeds maximum allowable limit of 10MB.',
      };
      return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';
    let isImage = false;
    let rawBase64: string | undefined = undefined;

    const mimeType = file.type || '';
    const fileName = (file.name || '').toLowerCase();

    const isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf');
    const isDocx =
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx');
    const isJpg = mimeType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg');
    const isPng = mimeType === 'image/png' || fileName.endsWith('.png');

    // 3. Dispatch format-specific in-memory extraction
    if (isPdf) {
      const result = await extractPdfText(buffer);
      if (!result.success) {
        return NextResponse.json(UploadResponseSchema.parse(result), { status: 422 });
      }
      extractedText = result.text;
    } else if (isDocx) {
      const result = await extractDocxText(buffer);
      if (!result.success) {
        return NextResponse.json(UploadResponseSchema.parse(result), { status: 422 });
      }
      extractedText = result.text;
    } else if (isJpg || isPng) {
      isImage = true;
      rawBase64 = buffer.toString('base64');
    } else {
      const errorPayload = {
        success: false,
        error: 'UNSUPPORTED_TYPE' as const,
        message: 'Unsupported file type. Only PDF, DOCX, JPG, and PNG files are accepted.',
      };
      return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 415 });
    }

    // 4. Validate textual content threshold (PDF / DOCX)
    if (!isImage) {
      const sanitized = cleanText(extractedText);
      if (sanitized.length < 30) {
        const errorPayload = {
          success: false,
          error: 'EMPTY_TEXT' as const,
          message: 'Document yielded fewer than 30 characters of readable text. The document may be scanned or empty.',
        };
        return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 422 });
      }

      const responsePayload = {
        success: true,
        data: {
          text: sanitized,
          isImage: false,
          mimeType: mimeType || (isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
          fileName: file.name,
          sizeBytes: file.size,
          wordCount: countWords(sanitized),
        },
      };

      return NextResponse.json(UploadResponseSchema.parse(responsePayload));
    }

    // 5. Image payload response for multimodal vision reasoning
    const imagePayload = {
      success: true,
      data: {
        text: '',
        isImage: true,
        rawBase64,
        mimeType: mimeType || (isPng ? 'image/png' : 'image/jpeg'),
        fileName: file.name,
        sizeBytes: file.size,
        wordCount: 0,
      },
    };

    return NextResponse.json(UploadResponseSchema.parse(imagePayload));
  } catch (error) {
    console.error('Upload route processing error:', error);
    const errorPayload = {
      success: false,
      error: 'INTERNAL_ERROR' as const,
      message: 'An unexpected internal error occurred during file processing.',
    };
    return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 500 });
  }
}
