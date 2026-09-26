import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { getGeminiModel, createConfigErrorResponse } from '@/lib/ai';
import { SituationAnalysisSchema } from '@/lib/schemas/situation';
import { SITUATION_SYSTEM_PROMPT, buildSituationUserPrompt } from '@/lib/prompts/situation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function countWords(str: string): number {
  return str.trim() ? str.trim().split(/\s+/).filter(Boolean).length : 0;
}

export async function POST(req: NextRequest) {
  try {
    const model = getGeminiModel();
    if (!model) {
      return createConfigErrorResponse();
    }

    let body: { description?: unknown; category?: unknown };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const { description, category } = body || {};

    if (typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Dispute description is required.' },
        { status: 400 }
      );
    }

    const trimmed = description.trim();
    const words = countWords(trimmed);

    if (words < 20 && trimmed.length < 50) {
      return NextResponse.json(
        { error: 'EMPTY_TEXT', message: 'Dispute description must be at least 20 words or 50 characters.' },
        { status: 400 }
      );
    }

    const categoryHint = typeof category === 'string' && category ? category : undefined;

    const analysisResult = await generateObject({
      model,
      schema: SituationAnalysisSchema,
      system: SITUATION_SYSTEM_PROMPT,
      prompt: buildSituationUserPrompt(trimmed, categoryHint),
    });

    return NextResponse.json({
      success: true,
      data: analysisResult.object,
    });
  } catch (error: unknown) {
    console.error('Error analyzing situation:', error);
    return NextResponse.json(
      {
        error: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to complete AI situation analysis.',
      },
      { status: 500 }
    );
  }
}
