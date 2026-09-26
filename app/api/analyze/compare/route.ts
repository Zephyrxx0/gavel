/**
 * @file route.ts
 * @description API Route Handler for dual-contract diffing and comparative legal intelligence.
 *
 * Implements adaptive comparison strategies:
 * 1. Two-pass extraction pipeline for massive contracts (>80,000 characters) to avoid context bloat.
 * 2. Single-pass atomic comparison for standard textual agreements (<80,000 characters).
 * 3. Multimodal vision comparison for scanned or photographed document versions.
 *
 * Enforces structured output conformity using Gemini via Vercel AI SDK `generateObject`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { getGeminiModel, createConfigErrorResponse } from '@/lib/ai';
import { ComparisonSchema, Pass1ExtractionSchema } from '@/lib/schemas/comparison';
import {
  COMPARISON_SYSTEM_PROMPT,
  buildComparisonPrompt,
  PASS1_SYSTEM_PROMPT,
  buildPass1UserPrompt,
} from '@/lib/prompts/comparison';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Character count threshold triggering two-pass clause summarization */
const TWO_PASS_THRESHOLD = 80_000;

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image'; image: string };

interface MultimodalCompareParams {
  docA?: unknown;
  docB?: unknown;
  labelA: string;
  labelB: string;
  imageA?: unknown;
  mimeTypeA?: unknown;
  imageB?: unknown;
  mimeTypeB?: unknown;
}

/**
 * Two-pass extraction pipeline for massive contracts (>80k chars).
 * Extracts key legal clauses concurrently in Pass 1, then performs structured diffing in Pass 2.
 */
async function compareTwoPass(
  model: Parameters<typeof generateObject>[0]['model'],
  docA: string,
  docB: string,
  labelA: string,
  labelB: string
) {
  const [extractA, extractB] = await Promise.all([
    generateObject({
      model,
      schema: Pass1ExtractionSchema,
      system: PASS1_SYSTEM_PROMPT,
      prompt: buildPass1UserPrompt(docA, labelA),
    }),
    generateObject({
      model,
      schema: Pass1ExtractionSchema,
      system: PASS1_SYSTEM_PROMPT,
      prompt: buildPass1UserPrompt(docB, labelB),
    }),
  ]);

  const formattedA = extractA.object.clauses
    .map((c) => `[${c.category}]: ${c.excerpt}`)
    .join('\n\n');
  const formattedB = extractB.object.clauses
    .map((c) => `[${c.category}]: ${c.excerpt}`)
    .join('\n\n');

  return generateObject({
    model,
    schema: ComparisonSchema,
    system: COMPARISON_SYSTEM_PROMPT,
    prompt: buildComparisonPrompt(formattedA, formattedB, labelA, labelB),
  });
}

// 2. Single-pass text extraction for standard agreements
async function compareSinglePass(
  model: Parameters<typeof generateObject>[0]['model'],
  docA: string,
  docB: string,
  labelA: string,
  labelB: string
) {
  return generateObject({
    model,
    schema: ComparisonSchema,
    system: COMPARISON_SYSTEM_PROMPT,
    prompt: buildComparisonPrompt(docA, docB, labelA, labelB),
  });
}

// 3. Multimodal image pair or hybrid text+image extraction
async function compareMultimodal(
  model: Parameters<typeof generateObject>[0]['model'],
  params: MultimodalCompareParams
) {
  const { docA, docB, labelA, labelB, imageA, mimeTypeA, imageB, mimeTypeB } = params;
  const contentParts: ContentPart[] = [
    {
      type: 'text',
      text: `Compare the following two legal documents (${labelA} vs ${labelB}):`,
    },
  ];

  if (typeof imageA === 'string' && imageA.length > 0) {
    const mimeA = typeof mimeTypeA === 'string' && mimeTypeA ? mimeTypeA : 'image/jpeg';
    contentParts.push(
      { type: 'text', text: `=== ${labelA} (Image) ===` },
      { type: 'image', image: `data:${mimeA};base64,${imageA}` }
    );
  } else if (typeof docA === 'string') {
    contentParts.push({ type: 'text', text: `<doc_a_to_compare label="${labelA}">\n${docA}\n</doc_a_to_compare>` });
  }

  if (typeof imageB === 'string' && imageB.length > 0) {
    const mimeB = typeof mimeTypeB === 'string' && mimeTypeB ? mimeTypeB : 'image/jpeg';
    contentParts.push(
      { type: 'text', text: `=== ${labelB} (Image) ===` },
      { type: 'image', image: `data:${mimeB};base64,${imageB}` }
    );
  } else if (typeof docB === 'string') {
    contentParts.push({ type: 'text', text: `<doc_b_to_compare label="${labelB}">\n${docB}\n</doc_b_to_compare>` });
  }

  return generateObject({
    model,
    schema: ComparisonSchema,
    system: COMPARISON_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: contentParts }],
  });
}

export async function POST(req: NextRequest) {
  try {
    const model = getGeminiModel();
    if (!model) {
      return createConfigErrorResponse();
    }

    let body: {
      docA?: unknown;
      docB?: unknown;
      labelA?: unknown;
      labelB?: unknown;
      imageA?: unknown;
      mimeTypeA?: unknown;
      imageB?: unknown;
      mimeTypeB?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const {
      docA,
      docB,
      labelA: rawLabelA,
      labelB: rawLabelB,
      imageA,
      mimeTypeA,
      imageB,
      mimeTypeB,
    } = body || {};

    const labelA = typeof rawLabelA === 'string' && rawLabelA.trim() ? rawLabelA.trim() : 'Document A';
    const labelB = typeof rawLabelB === 'string' && rawLabelB.trim() ? rawLabelB.trim() : 'Document B';

    const hasDocA = (typeof docA === 'string' && docA.trim().length > 0) || (typeof imageA === 'string' && imageA.length > 0);
    const hasDocB = (typeof docB === 'string' && docB.trim().length > 0) || (typeof imageB === 'string' && imageB.length > 0);

    if (!hasDocA || !hasDocB) {
      return NextResponse.json(
        {
          error: 'BOTH_DOCUMENTS_REQUIRED',
          message: 'Both Document A and Document B must be provided for comparison.',
        },
        { status: 400 }
      );
    }

    // If text documents, enforce minimum length of 30 characters
    if (typeof docA === 'string' && docA.trim().length < 30) {
      return NextResponse.json(
        { error: 'DOCUMENT_TOO_SHORT', message: `${labelA} must contain at least 30 characters.` },
        { status: 400 }
      );
    }
    if (typeof docB === 'string' && docB.trim().length < 30) {
      return NextResponse.json(
        { error: 'DOCUMENT_TOO_SHORT', message: `${labelB} must contain at least 30 characters.` },
        { status: 400 }
      );
    }

    const isTextPair = typeof docA === 'string' && typeof docB === 'string';
    const combinedLength = isTextPair ? docA.length + docB.length : 0;
    const isLargeDoc = isTextPair && combinedLength > TWO_PASS_THRESHOLD;

    let comparisonResult;

    if (isLargeDoc) {
      comparisonResult = await compareTwoPass(model, docA as string, docB as string, labelA, labelB);
    } else if (isTextPair) {
      comparisonResult = await compareSinglePass(model, docA as string, docB as string, labelA, labelB);
    } else {
      comparisonResult = await compareMultimodal(model, {
        docA,
        docB,
        labelA,
        labelB,
        imageA,
        mimeTypeA,
        imageB,
        mimeTypeB,
      });
    }

    return NextResponse.json({
      success: true,
      data: comparisonResult.object,
      isLargeDoc,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'Comparison analysis failed.',
      },
      { status: 500 }
    );
  }
}
