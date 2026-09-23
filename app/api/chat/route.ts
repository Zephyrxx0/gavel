import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
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
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'CONFIG_ERROR', message: 'Gemini API key is not configured.' },
        { status: 500 }
      );
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
          : JSON.stringify(context.analysis, null, 2);
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

    const google = createGoogleGenerativeAI({ apiKey });
    const model = google('gemini-2.5-flash');

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
