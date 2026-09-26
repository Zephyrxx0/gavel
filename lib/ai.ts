/**
 * @file ai.ts
 * @description Centralized AI model orchestration and configuration helper.
 *
 * Configures the Google Generative AI (Gemini 2.5 Flash) provider for structured legal analysis
 * (via Vercel AI SDK generateObject) and conversational legal guidance (via streamText).
 * Normalizes environment variable key resolution between `GEMINI_API_KEY` and
 * `GOOGLE_GENERATIVE_AI_API_KEY` to ensure zero runtime misconfigurations across deployments.
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

/** Default model selected for legal comprehension, fast inference, and structured schema conformity */
const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

/**
 * Resolves the active Gemini API key from environment variables.
 * Checks GEMINI_API_KEY first, followed by GOOGLE_GENERATIVE_AI_API_KEY fallback.
 *
 * @returns The resolved API key string, or undefined if unconfigured.
 */
function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

/**
 * Creates a standardized 500 JSON error response when AI credentials are missing.
 *
 * @returns NextResponse with a structured CONFIG_ERROR payload.
 */
export function createConfigErrorResponse() {
  return NextResponse.json(
    { error: 'CONFIG_ERROR', message: 'Gemini API key is not configured.' },
    { status: 500 }
  );
}

/**
 * Instantiates and returns a Google Generative AI language model instance.
 *
 * @returns Initialized Gemini LanguageModel instance, or null if API key is not set.
 */
export function getGeminiModel() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  const google = createGoogleGenerativeAI({ apiKey });
  return google(GEMINI_MODEL_NAME);
}
