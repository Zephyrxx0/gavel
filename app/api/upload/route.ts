import { NextRequest, NextResponse } from 'next/server';
// @ts-expect-error - Direct lib import bypasses debug runner in pdf-parse/index.js
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import { cleanText, countWords } from '@/lib/text-utils';
import { UploadResponseSchema } from '@/lib/schemas/upload';

// Enforce Node.js runtime for volatile Buffer operations
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      const errorPayload = {
        success: false,
        error: 'INVALID_REQUEST' as const,
        message: 'No valid file provided.',
      };
      return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 400 });
    }

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

    // 1. PDF Extraction
    if (isPdf) {
      try {
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text || '';
      } catch (err: unknown) {
        const errorMsg = (err instanceof Error ? err.message : String(err)).toLowerCase();
        if (errorMsg.includes('password') || errorMsg.includes('encrypted')) {
          const errorPayload = {
            success: false,
            error: 'PASSWORD_PROTECTED' as const,
            message: 'The PDF document is encrypted or password-protected.',
          };
          return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 422 });
        }
        const errorPayload = {
          success: false,
          error: 'CORRUPT_FILE' as const,
          message: 'Unable to parse PDF content. The file may be corrupt.',
        };
        return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 422 });
      }
    }
    // 2. DOCX Extraction
    else if (isDocx) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch {
        const errorPayload = {
          success: false,
          error: 'CORRUPT_FILE' as const,
          message: 'Unable to parse DOCX content. The file may be corrupt.',
        };
        return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 422 });
      }
    }
    // 3. Image Conversion (JPG / PNG for Multimodal Vision)
    else if (isJpg || isPng) {
      isImage = true;
      rawBase64 = buffer.toString('base64');
    }
    // 4. Unsupported Format
    else {
      const errorPayload = {
        success: false,
        error: 'UNSUPPORTED_TYPE' as const,
        message: 'Unsupported file type. Only PDF, DOCX, JPG, and PNG files are accepted.',
      };
      return NextResponse.json(UploadResponseSchema.parse(errorPayload), { status: 415 });
    }

    // For text formats (PDF/DOCX), clean and validate minimum length
    if (!isImage) {
      const sanitized = cleanText(extractedText);
      if (sanitized.length < 50) {
        const errorPayload = {
          success: false,
          error: 'EMPTY_TEXT' as const,
          message: 'Document yielded fewer than 50 characters of readable text. The document may be scanned or empty.',
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

    // Image payload response
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
