import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

export function createConfigErrorResponse() {
  return NextResponse.json(
    { error: 'CONFIG_ERROR', message: 'Gemini API key is not configured.' },
    { status: 500 }
  );
}

export function getGeminiModel() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  const google = createGoogleGenerativeAI({ apiKey });
  return google(GEMINI_MODEL_NAME);
}
