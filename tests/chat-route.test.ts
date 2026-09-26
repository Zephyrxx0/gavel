import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';
import { streamText, convertToModelMessages } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { buildChatSystemPrompt } from '@/lib/prompts/chat';

vi.mock('ai', () => ({
  streamText: vi.fn(),
  convertToModelMessages: vi.fn(async (msgs) => msgs),
}));

const mockModel = 'mocked-gemini-model';
const mockGoogle = vi.fn(() => mockModel);

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => mockGoogle),
}));

function createChatRequest(body?: unknown, rawJson?: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawJson !== undefined ? rawJson : JSON.stringify(body),
  });
}

describe('Streaming Chat Route Handler (/api/chat)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-gemini-key-123' };
  });

  it('rejects requests when Gemini API key is missing (500 CONFIG_ERROR)', async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const req = createChatRequest({
      messages: [{ id: '1', role: 'user', content: 'What are the termination terms?' }],
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('CONFIG_ERROR');
    expect(body.message).toContain('API key is not configured');
  });

  it('rejects malformed JSON payload (400 INVALID_REQUEST)', async () => {
    const req = createChatRequest(undefined, 'invalid-json-{');
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('INVALID_REQUEST');
    expect(body.message).toContain('Malformed JSON payload');
  });

  it('rejects missing or empty messages array (400 INVALID_REQUEST)', async () => {
    const reqEmpty = createChatRequest({ messages: [] });
    const resEmpty = await POST(reqEmpty);
    const bodyEmpty = await resEmpty.json();

    expect(resEmpty.status).toBe(400);
    expect(bodyEmpty.error).toBe('INVALID_REQUEST');

    const reqMissing = createChatRequest({});
    const resMissing = await POST(reqMissing);
    const bodyMissing = await resMissing.json();

    expect(resMissing.status).toBe(400);
    expect(bodyMissing.error).toBe('INVALID_REQUEST');
  });

  it('buildChatSystemPrompt enforces non-UPL directives, omission rules, and bracketed citations', () => {
    const prompt = buildChatSystemPrompt({
      mode: 'document',
      sourceText: 'The tenant must pay rent on the 1st of each month.',
      analysisJson: JSON.stringify({ summary: 'Standard Lease' }),
      documentType: 'Residential Lease',
      parties: ['Landlord Acme', 'Tenant Jane'],
    });

    expect(prompt).toContain('MANDATORY LEGAL COMPLIANCE & NON-UPL DIRECTIVES (ADVOCATES ACT, 1961)');
    expect(prompt).toContain('NEVER give prescriptive legal advice');
    expect(prompt).toContain('STRICT EPISTEMIC OMISSION RULE:');
    expect(prompt).toContain('This document does not address [topic]');
    expect(prompt).toContain('CITATION SYNTAX & FORMATTING:');
    expect(prompt).toContain('[Clause 4.2: Termination for Cause]');
    expect(prompt).toContain('Residential Lease');
    expect(prompt).toContain('Landlord Acme, Tenant Jane');
    expect(prompt).toContain('The tenant must pay rent on the 1st of each month.');
  });

  it('truncates oversized source text in system prompt at 50,000 characters', () => {
    const hugeText = 'A'.repeat(60000);
    const prompt = buildChatSystemPrompt({
      mode: 'document',
      sourceText: hugeText,
    });

    expect(prompt).toContain('[NOTICE: Source text was truncated at 50,000 characters for token safety.]');
    expect(prompt.length).toBeLessThan(60000);
  });

  it('successfully streams chat response with SSE headers', async () => {
    const mockToUIMessageStreamResponse = vi.fn(
      () =>
        new Response('data: [{"type":"text-delta","textDelta":"Hello"}]\n\n', {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        })
    );

    (streamText as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      toUIMessageStreamResponse: mockToUIMessageStreamResponse,
    });

    const req = createChatRequest({
      messages: [{ id: '1', role: 'user', content: 'What is the liability cap?' }],
      context: {
        mode: 'document',
        text: 'Clause 12: Total liability is capped at $10,000.',
        analysis: { documentType: 'Service Agreement' },
      },
    });

    const res = await POST(req);

    expect(mockGoogle).toHaveBeenCalledWith('gemini-2.5-flash');
    expect(streamText).toHaveBeenCalled();
    const streamCallArgs = (streamText as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(streamCallArgs.system).toContain('Total liability is capped at $10,000');
    expect(mockToUIMessageStreamResponse).toHaveBeenCalled();

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
  });

  it('handles runtime failure in streamText gracefully (500 CHAT_FAILED)', async () => {
    (streamText as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('Gemini rate limit exceeded');
    });

    const req = createChatRequest({
      messages: [{ id: '1', role: 'user', content: 'Hello' }],
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('CHAT_FAILED');
    expect(body.message).toContain('Gemini rate limit exceeded');
  });
});
