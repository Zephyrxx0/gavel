import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/analyze/compare/route';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  COMPARISON_SYSTEM_PROMPT,
  buildComparisonPrompt,
  PASS1_SYSTEM_PROMPT,
  buildPass1UserPrompt,
} from '@/lib/prompts/comparison';
import { ComparisonSchema } from '@/lib/schemas/comparison';

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => 'mocked-claude-model'),
}));

function createCompareRequest(body?: unknown, rawJson?: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/analyze/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: rawJson !== undefined ? rawJson : JSON.stringify(body),
  });
}

const mockComparisonResult = {
  favorabilityVerdict: 'docA',
  verdictRationale: 'Document A provides mutual indemnification and clearer notice terms.',
  favorabilityMetrics: {
    clausesFavoringDocA: 2,
    clausesFavoringDocB: 0,
    criticalInconsistencies: 0,
  },
  differences: [
    {
      category: 'Indemnification',
      textDocA: 'Each party indemnifies the other.',
      textDocB: 'Vendor indemnifies client only.',
      favors: 'docA',
      riskRating: 'standard',
      notes: 'Bilateral risk allocation.',
    },
  ],
  inconsistencies: [],
  negotiationGuide: {
    pushBack: [
      {
        clauseTitle: 'Unilateral Indemnity',
        rationale: 'Shifts risk disproportionately.',
      },
    ],
    acceptAsIs: [],
    flagForLawyer: [],
    recommendation: 'Seek bilateral indemnification terms.',
  },
};

describe('Comparison Prompt Module (lib/prompts/comparison.ts)', () => {
  it('enforces non-UPL boundaries and Advocates Act 1961 directives', () => {
    expect(COMPARISON_SYSTEM_PROMPT).toContain('NON-NEGOTIABLE LEGAL BOUNDARIES');
    expect(COMPARISON_SYSTEM_PROMPT).toContain('Advocates Act 1961 §§ 29 & 33');
    expect(COMPARISON_SYSTEM_PROMPT).toContain('DO NOT use prescriptive directives');
    expect(COMPARISON_SYSTEM_PROMPT).toContain('FAVORABILITY VERDICT CRITERIA');
  });

  it('enforces XML containment tags for both documents', () => {
    expect(COMPARISON_SYSTEM_PROMPT).toContain('<doc_a_to_compare>');
    expect(COMPARISON_SYSTEM_PROMPT).toContain('<doc_b_to_compare>');
    const prompt = buildComparisonPrompt('Doc A content', 'Doc B content', 'Original', 'Revised');
    expect(prompt).toContain('<doc_a_to_compare label="Original">');
    expect(prompt).toContain('Doc A content');
    expect(prompt).toContain('<doc_b_to_compare label="Revised">');
    expect(prompt).toContain('Doc B content');
  });

  it('exports Pass 1 prompts for large document extraction', () => {
    expect(PASS1_SYSTEM_PROMPT).toContain('Gavel\'s Legal Clause Extractor');
    expect(PASS1_SYSTEM_PROMPT).toContain('7 core legal domains');
    const pass1Prompt = buildPass1UserPrompt('Contract clause sample', 'Draft A');
    expect(pass1Prompt).toContain('<doc_to_extract label="Draft A">');
    expect(pass1Prompt).toContain('Contract clause sample');
  });
});

describe('Compare API Route (app/api/analyze/compare/route.ts)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-api-key' };
  });

  it('returns 500 CONFIG_ERROR when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = createCompareRequest({
      docA: 'Valid document text with sufficient length for testing.',
      docB: 'Another valid document text with sufficient length for testing.',
    });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('CONFIG_ERROR');
  });

  it('returns 400 INVALID_REQUEST on malformed JSON body', async () => {
    const req = createCompareRequest(undefined, 'invalid-json{');
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('INVALID_REQUEST');
  });

  it('returns 400 BOTH_DOCUMENTS_REQUIRED when only one document is provided', async () => {
    const req = createCompareRequest({
      docA: 'Valid document text with sufficient length for testing.',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('BOTH_DOCUMENTS_REQUIRED');
  });

  it('returns 400 DOCUMENT_TOO_SHORT when text is under 30 characters', async () => {
    const req = createCompareRequest({
      docA: 'Short text',
      docB: 'Valid document text with sufficient length for testing.',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('DOCUMENT_TOO_SHORT');
  });

  it('executes single-pass comparison when combined text <= 80,000 characters', async () => {
    vi.mocked(generateObject).mockResolvedValueOnce({
      object: mockComparisonResult,
    } as any);

    const docA = 'This is the original service agreement clause establishing liability of $10,000.';
    const docB = 'This is the revised service agreement clause establishing liability of $50,000.';

    const req = createCompareRequest({ docA, docB, labelA: 'Offer 1', labelB: 'Offer 2' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.isLargeDoc).toBe(false);
    expect(data.data.favorabilityVerdict).toBe('docA');

    // Should only call generateObject ONCE for single-pass
    expect(generateObject).toHaveBeenCalledTimes(1);
    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        schema: ComparisonSchema,
        system: COMPARISON_SYSTEM_PROMPT,
      })
    );
  });

  it('executes concurrent two-pass comparison when combined text > 80,000 characters', async () => {
    // Generate large docs exceeding 80,000 chars combined
    const docA = 'Contract A standard clause line text for padding. '.repeat(900); // ~45,000 chars
    const docB = 'Contract B revised clause line text for padding. '.repeat(900); // ~44,100 chars

    // Mock Pass 1 extraction for Doc A and Doc B
    vi.mocked(generateObject)
      .mockResolvedValueOnce({
        object: { clauses: [{ category: 'Liability', excerpt: 'Liability cap $10,000' }] },
      } as any)
      .mockResolvedValueOnce({
        object: { clauses: [{ category: 'Liability', excerpt: 'Liability cap $50,000' }] },
      } as any)
      // Mock Pass 2 synthesis
      .mockResolvedValueOnce({
        object: mockComparisonResult,
      } as any);

    const req = createCompareRequest({ docA, docB, labelA: 'V1', labelB: 'V2' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.isLargeDoc).toBe(true);
    expect(data.data.favorabilityVerdict).toBe('docA');

    // Should call generateObject THREE times (2 concurrent Pass 1 + 1 Pass 2)
    expect(generateObject).toHaveBeenCalledTimes(3);
  });

  it('supports image pair payloads via multimodal messages', async () => {
    vi.mocked(generateObject).mockResolvedValueOnce({
      object: mockComparisonResult,
    } as any);

    const req = createCompareRequest({
      imageA: 'base64-doc-a',
      mimeTypeA: 'image/png',
      imageB: 'base64-doc-b',
      mimeTypeB: 'image/jpeg',
      labelA: 'Scan 1',
      labelB: 'Scan 2',
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(generateObject).toHaveBeenCalledTimes(1);
    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.any(Array),
      })
    );
  });
});

