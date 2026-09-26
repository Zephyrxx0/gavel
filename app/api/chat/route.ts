/**
 * @file route.ts
 * @description API Route Handler for interactive conversational Q&A on active legal contexts.
 *
 * Streams token-by-token responses using Gemini via Vercel AI SDK `streamText`.
 * Injects contextually grounded system prompts referencing the active document,
 * dispute situation, or comparison scorecards with strict legal compliance boundaries
 * (prohibiting prescriptive legal advice while offering objective informational guidance).
 */

import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { getGeminiModel, createConfigErrorResponse } from '@/lib/ai';
import { buildChatSystemPrompt, type ChatPromptOptions } from '@/lib/prompts/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface ChatContextPayload {
  mode?: 'document' | 'situation' | 'compare';
  text?: string;
  analysis?: unknown;
  documentType?: string;
  parties?: string[];
}

export async function POST(req: NextRequest) {
  try {
    const model = getGeminiModel();
    if (!model) {
      return createConfigErrorResponse();
    }

    let body: { messages?: UIMessage[]; context?: ChatContextPayload };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const { messages, context } = body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Messages array is required.' },
        { status: 400 }
      );
    }

    const mode = context?.mode || 'document';
    const sourceText = typeof context?.text === 'string' ? context.text : undefined;
    const documentType = typeof context?.documentType === 'string' ? context.documentType : undefined;
    const parties = Array.isArray(context?.parties) ? context.parties : undefined;

    let analysisJson: string | undefined = undefined;
    if (context?.analysis) {
      analysisJson =
        typeof context.analysis === 'string'
          ? context.analysis
          : JSON.stringify(context.analysis);
    }

    const promptOptions: ChatPromptOptions = {
      mode,
      sourceText,
      analysisJson,
      documentType,
      parties,
    };

    const systemPrompt = buildChatSystemPrompt(promptOptions);
    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    return NextResponse.json(
      {
        error: 'CHAT_FAILED',
        message: error instanceof Error ? error.message : 'Chat streaming failed.',
      },
      { status: 500 }
    );
  }
}
