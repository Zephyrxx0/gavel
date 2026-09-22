import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { DocumentAnalysisSchema } from '@/lib/schemas/document';
import { DOCUMENT_SYSTEM_PROMPT, buildDocumentUserPrompt } from '@/lib/prompts/document';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'CONFIG_ERROR', message: 'Anthropic API key is not configured.' },
        { status: 500 }
      );
    }

    let body: { text?: unknown; imageBase64?: unknown; mimeType?: unknown; fileName?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const { text, imageBase64, mimeType } = body || {};

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Either document text or image data is required.' },
        { status: 400 }
      );
    }

    const model = anthropic('claude-3-5-sonnet-20241022');
    let analysisResult;

    if (typeof imageBase64 === 'string' && imageBase64.length > 0) {
      const mime = typeof mimeType === 'string' && mimeType ? mimeType : 'image/jpeg';
      analysisResult = await generateObject({
        model,
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
                image: `data:${mime};base64,${imageBase64}`,
              },
            ],
          },
        ],
      });
    } else {
      if (typeof text !== 'string' || text.trim().length < 30) {
        return NextResponse.json(
          { error: 'EMPTY_TEXT', message: 'Document text must be at least 30 characters.' },
          { status: 400 }
        );
      }

      analysisResult = await generateObject({
        model,
        schema: DocumentAnalysisSchema,
        system: DOCUMENT_SYSTEM_PROMPT,
        prompt: buildDocumentUserPrompt(text),
      });
    }

    return NextResponse.json({
      success: true,
      data: analysisResult.object,
    });
  } catch (error: unknown) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      {
        error: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to complete AI document analysis.',
      },
      { status: 500 }
    );
  }
}
