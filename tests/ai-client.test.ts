import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGeminiModel, createConfigErrorResponse } from '@/lib/ai';

// Mock @ai-sdk/google
const mockModel = 'mocked-gemini-model-instance';
const mockGoogle = vi.fn(() => mockModel);

vi.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: vi.fn(() => mockGoogle),
}));

describe('AI Client Helper (lib/ai.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createConfigErrorResponse', () => {
    it('returns a standard 500 CONFIG_ERROR response', async () => {
      const response = createConfigErrorResponse();
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('CONFIG_ERROR');
      expect(body.message).toContain('Gemini API key is not configured');
    });
  });

  describe('getGeminiModel', () => {
    it('returns null when no Gemini API key is configured', () => {
      delete process.env.GEMINI_API_KEY;
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      const model = getGeminiModel();
      expect(model).toBeNull();
    });

    it('instantiates Gemini 2.5 Flash model when GEMINI_API_KEY is present', () => {
      process.env.GEMINI_API_KEY = 'test-key-abc-123';

      const model = getGeminiModel();
      expect(model).toBe(mockModel);
      expect(mockGoogle).toHaveBeenCalledWith('gemini-2.5-flash');
    });

    it('supports GOOGLE_GENERATIVE_AI_API_KEY fallback', () => {
      delete process.env.GEMINI_API_KEY;
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'fallback-key-xyz-789';

      const model = getGeminiModel();
      expect(model).toBe(mockModel);
      expect(mockGoogle).toHaveBeenCalledWith('gemini-2.5-flash');
    });
  });
});
