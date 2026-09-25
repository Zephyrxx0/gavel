import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveSessionAnalysis,
  loadSessionAnalysis,
  clearSessionAnalysis,
  SESSION_KEYS,
} from '@/lib/session-vault';

class MockSessionStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

describe('Session Vault Unit Tests', () => {
  let mockStorage: MockSessionStorage;

  beforeEach(() => {
    mockStorage = new MockSessionStorage();
    (global as unknown as { window: { sessionStorage: Storage } }).window = {
      sessionStorage: mockStorage,
    };
  });

  it('saves and loads session data correctly', () => {
    const data = {
      testField: 'legal-analysis-content',
      score: 95,
      clauses: ['clause-1', 'clause-2'],
    };

    saveSessionAnalysis(SESSION_KEYS.DOCUMENT, data);
    const loaded = loadSessionAnalysis<typeof data>(SESSION_KEYS.DOCUMENT);

    expect(loaded).toEqual(data);
  });

  it('clears session analysis when requested', () => {
    const data = { sample: 'review-data' };
    saveSessionAnalysis(SESSION_KEYS.COMPARE, data);

    expect(loadSessionAnalysis(SESSION_KEYS.COMPARE)).toEqual(data);

    clearSessionAnalysis(SESSION_KEYS.COMPARE);

    expect(loadSessionAnalysis(SESSION_KEYS.COMPARE)).toBeNull();
  });

  it('returns null for non-existent session keys', () => {
    const loaded = loadSessionAnalysis('non-existent-key');
    expect(loaded).toBeNull();
  });

  it('gracefully handles JSON parse errors', () => {
    window.sessionStorage.setItem('corrupt-key', 'not-valid-json{');
    const loaded = loadSessionAnalysis('corrupt-key');
    expect(loaded).toBeNull();
  });

  it('falls back to saving without large rawBase64 when quota is exceeded', () => {
    const dataWithImage = {
      uploadedDoc: {
        fileName: 'contract.png',
        rawBase64: 'very-large-base64-payload',
        wordCount: 500,
      },
      analysisData: { summary: 'Contract analysis' },
    };

    // Mock setItem to throw once on first call, succeed on second (fallback)
    let callCount = 0;
    const originalSetItem = window.sessionStorage.setItem.bind(window.sessionStorage);
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation((key, val) => {
      callCount++;
      if (callCount === 1) {
        throw new Error('QuotaExceededError');
      }
      return originalSetItem(key, val);
    });

    saveSessionAnalysis(SESSION_KEYS.DOCUMENT, dataWithImage);

    const loaded = loadSessionAnalysis<typeof dataWithImage>(SESSION_KEYS.DOCUMENT);
    expect(loaded).toBeDefined();
    expect(loaded?.uploadedDoc.fileName).toBe('contract.png');
    expect(loaded?.uploadedDoc.rawBase64).toBeUndefined();
    expect(loaded?.analysisData.summary).toBe('Contract analysis');
  });
});
