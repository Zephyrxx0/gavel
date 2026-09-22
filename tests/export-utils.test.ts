import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  STATUTORY_DISCLAIMER_HEADER,
  sanitizeFilename,
  downloadFile,
  copyToClipboard,
  formatDocumentMarkdown,
  formatDocumentPlainText,
  formatSituationMarkdown,
  formatSituationPlainText,
  formatComparisonMarkdown,
  formatComparisonPlainText,
} from '@/lib/export-utils';
import type { DocumentAnalysis } from '@/lib/schemas/document';
import type { SituationAnalysis } from '@/lib/schemas/situation';
import type { Comparison } from '@/lib/schemas/comparison';

const sampleDocumentAnalysis: DocumentAnalysis = {
  documentType: 'Commercial Lease Agreement',
  parties: ['Apex Properties Ltd', 'Zenith Retailers Inc'],
  summary: 'A standard five-year commercial lease with strict rent escalation clauses.',
  clauses: [
    {
      id: 'c1',
      title: 'Automatic Rent Escalation',
      originalText: 'Rent shall increase automatically by 15% each calendar year without notice.',
      simplified: 'Rent goes up by 15% every single year automatically.',
      risk: 'high',
      riskReason: '15% compounding annual increase significantly exceeds commercial inflation averages.',
      obligation: 'user',
    },
    {
      id: 'c2',
      title: 'Maintenance Liability',
      originalText: 'Tenant is liable for structural maintenance of HVAC and roof systems.',
      simplified: 'Tenant is responsible for fixing the building roof and AC units.',
      risk: 'caution',
      riskReason: 'Structural roof repairs are normally landlord obligations in triple net leases.',
      obligation: 'user',
    },
    {
      id: 'c3',
      title: 'Permitted Use',
      originalText: 'Premises shall be used exclusively for general retail operations.',
      simplified: 'The store can only be used for standard retail sales.',
      risk: 'standard',
      riskReason: 'Standard commercial use restriction.',
      obligation: 'mutual',
    },
  ],
  checklist: [
    {
      id: 'a1',
      timing: 'immediate',
      actionType: 'refuse',
      description: 'Request removal of the 15% annual rent compounding clause.',
      relatedClauseId: 'c1',
    },
    {
      id: 'a2',
      timing: 'before_signing',
      actionType: 'negotiate',
      description: 'Cap HVAC maintenance responsibility to routine filter servicing only.',
      relatedClauseId: 'c2',
    },
  ],
  lawyerQuestions: [
    {
      id: 'q1',
      question: 'Is a 15% mandatory escalation customary for retail spaces in this commercial zone?',
      context: 'Clause c1 mandates 15% compounding increases annually.',
      relatedClauseId: 'c1',
    },
  ],
};

const sampleSituationAnalysis: SituationAnalysis = {
  disputeCategory: 'tenancy',
  summary: 'Tenant faced with unexpected eviction notice alleging non-payment despite timely bank transfers.',
  rights: [
    {
      title: 'Right to Procedural Notice',
      explanation: 'Landlords cannot initiate summary dispossession without statutory written cure periods.',
      statuteReference: 'Transfer of Property Act, Section 106',
    },
  ],
  roadmap: [
    {
      step: 'Compile Bank Transfer Receipts',
      description: 'Gather certified bank statements demonstrating zero arrears.',
      urgency: 'immediate',
      doableWithoutLawyer: true,
    },
    {
      step: 'Draft Formal Reply to Notice',
      description: 'Issue formal written contest citing transfer confirmation numbers.',
      urgency: 'within-7-days',
      doableWithoutLawyer: false,
    },
  ],
  documentsToGather: [
    {
      document: 'Bank Transfer Receipts for past 12 months',
      why: 'Conclusive documentary evidence rebutting allegation of rent default.',
    },
  ],
  whenToCallLawyer: [
    'If the landlord files an ejectment petition before the Rent Controller.',
  ],
  deadlineFlags: [
    'Statutory notice requires response within 15 days of service.',
  ],
  estimatedTimeline: 'Typically 1–3 months via formal response; up to 12 months if litigated.',
};

const sampleComparison: Comparison = {
  favorabilityVerdict: 'docB',
  verdictRationale: 'Document B limits liability to fees paid and eliminates unilateral penalty provisions.',
  favorabilityMetrics: {
    clausesFavoringDocA: 1,
    clausesFavoringDocB: 4,
    criticalInconsistencies: 1,
  },
  clauseDifferences: [
    {
      category: 'Limitation of Liability',
      textDocA: 'Vendor liability is unlimited for indirect damages.',
      textDocB: 'Liability is capped at 12 months of fees paid.',
      favors: 'docB',
      riskRating: 'high',
      notes: 'Doc B protects the user from catastrophic uncapped indemnity exposure.',
    },
  ],
  inconsistencies: [
    {
      clauseTitle: 'Termination Period',
      description: 'Doc A specifies 30 days notice while Doc B specifies immediate termination on convenience.',
      severity: 'critical',
    },
  ],
  negotiationGuide: {
    pushBack: [
      {
        clauseTitle: 'Immediate Termination',
        rationale: 'Immediate termination without cause disrupts ongoing business operations.',
        suggestedAlternative: 'Standard 30-day prior written notice required for termination for convenience.',
      },
    ],
    acceptAsIs: [
      {
        clauseTitle: '12-Month Liability Cap',
        rationale: 'Fair and customary bilateral liability limitation.',
      },
    ],
    flagForLawyer: [
      {
        clauseTitle: 'Jurisdiction & Governing Law',
        rationale: 'Check enforcement feasibility in foreign jurisdiction.',
      },
    ],
    recommendation: 'Adopt Document B as baseline but insist on 30-day termination cure periods.',
  },
};

describe('Universal Export Utilities (lib/export-utils.ts)', () => {
  it('STATUTORY_DISCLAIMER_HEADER references Advocates Act, 1961 and non-UPL notice', () => {
    expect(STATUTORY_DISCLAIMER_HEADER).toContain('Advocates Act, 1961');
    expect(STATUTORY_DISCLAIMER_HEADER).toContain('GAVEL LEGAL INTELLIGENCE REPORT');
    expect(STATUTORY_DISCLAIMER_HEADER).toContain('NOT a law firm, advocate, or licensed legal practitioner');
  });

  describe('Mode 1: Document Decoder Formatters', () => {
    it('formatDocumentMarkdown produces complete markdown with disclaimers, scorecards, and checklist', () => {
      const md = formatDocumentMarkdown(sampleDocumentAnalysis, 'lease-contract.pdf');

      expect(md).toContain(STATUTORY_DISCLAIMER_HEADER);
      expect(md).toContain('# Document Analysis Report: Commercial Lease Agreement');
      expect(md).toContain('**Original File:** lease-contract.pdf');
      expect(md).toContain('Apex Properties Ltd, Zenith Retailers Inc');
      expect(md).toContain('## Executive Summary');
      expect(md).toContain('A standard five-year commercial lease');
      expect(md).toContain('### 🔴 High Risk Clauses (1)');
      expect(md).toContain('Automatic Rent Escalation');
      expect(md).toContain('15% compounding annual increase');
      expect(md).toContain('Rent shall increase automatically');
      expect(md).toContain('### 🟡 Caution Clauses (1)');
      expect(md).toContain('### 🟢 Standard Clauses (1)');
      expect(md).toContain('### Immediate Actions');
      expect(md).toContain('[REFUSE]');
      expect(md).toContain('## Questions for Your Legal Counsel');
      expect(md).toContain('Is a 15% mandatory escalation customary');
    });

    it('formatDocumentPlainText produces clean ASCII text representation', () => {
      const txt = formatDocumentPlainText(sampleDocumentAnalysis, 'lease-contract.pdf');

      expect(txt).toContain('DOCUMENT ANALYSIS REPORT: COMMERCIAL LEASE AGREEMENT');
      expect(txt).toContain('Original File: lease-contract.pdf');
      expect(txt).toContain('EXECUTIVE SUMMARY:');
      expect(txt).toContain('[HIGH] Automatic Rent Escalation');
      expect(txt).toContain('QUESTIONS FOR YOUR LEGAL COUNSEL:');
    });
  });

  describe('Mode 2: Situation Navigator Formatters', () => {
    it('formatSituationMarkdown produces complete situation dossier with deadline warnings', () => {
      const md = formatSituationMarkdown(sampleSituationAnalysis, 'Landlord locked the premises.');

      expect(md).toContain(STATUTORY_DISCLAIMER_HEADER);
      expect(md).toContain('# Situation Navigation Dossier: TENANCY');
      expect(md).toContain('TIME-SENSITIVE DEADLINE WARNINGS:');
      expect(md).toContain('Statutory notice requires response within 15 days of service');
      expect(md).toContain('## User Situation Background');
      expect(md).toContain('Landlord locked the premises.');
      expect(md).toContain('## Your Statutory Rights & Protections');
      expect(md).toContain('Transfer of Property Act, Section 106');
      expect(md).toContain('Compile Bank Transfer Receipts 🟢 (Doable without attorney)');
      expect(md).toContain('## Documents & Evidence to Gather');
      expect(md).toContain('Bank Transfer Receipts for past 12 months');
    });

    it('formatSituationPlainText produces clean ASCII text representation', () => {
      const txt = formatSituationPlainText(sampleSituationAnalysis);

      expect(txt).toContain('SITUATION NAVIGATION DOSSIER: TENANCY');
      expect(txt).toContain('URGENT DEADLINES / STATUTE OF LIMITATIONS');
      expect(txt).toContain('STATUTORY RIGHTS:');
      expect(txt).toContain('NEXT STEPS ROADMAP:');
      expect(txt).toContain('DOCUMENTS & EVIDENCE TO GATHER:');
    });
  });

  describe('Mode 3: Document Comparison Formatters', () => {
    it('formatComparisonMarkdown produces comprehensive comparison report with differences and negotiation guide', () => {
      const md = formatComparisonMarkdown(sampleComparison, 'Old Agreement', 'New Proposal');

      expect(md).toContain(STATUTORY_DISCLAIMER_HEADER);
      expect(md).toContain('# Document Comparison Dossier: Old Agreement vs New Proposal');
      expect(md).toContain('**Overall Favorability:** DOCB');
      expect(md).toContain('Clauses Favoring Old Agreement: 1');
      expect(md).toContain('Clauses Favoring New Proposal: 4');
      expect(md).toContain('## Inconsistencies & Contradictions');
      expect(md).toContain('[CRITICAL] Termination Period');
      expect(md).toContain('## Side-by-Side Differences');
      expect(md).toContain('Limitation of Liability (Risk: HIGH | Favors: New Proposal)');
      expect(md).toContain('## Negotiation Guide');
      expect(md).toContain('### Push Back On');
      expect(md).toContain('Immediate Termination');
    });

    it('formatComparisonPlainText produces clean ASCII text representation', () => {
      const txt = formatComparisonPlainText(sampleComparison, 'Doc A', 'Doc B');

      expect(txt).toContain('DOCUMENT COMPARISON DOSSIER: DOC A VS DOC B');
      expect(txt).toContain('Overall Verdict: DOCB');
      expect(txt).toContain('INCONSISTENCIES:');
      expect(txt).toContain('DIFFERENCES:');
      expect(txt).toContain('NEGOTIATION GUIDE:');
    });
  });

  describe('Filename Sanitization & Download Helpers', () => {
    it('sanitizeFilename strips dangerous path separators and special characters', () => {
      expect(sanitizeFilename('../../etc/passwd')).toBe('etc-passwd');
      expect(sanitizeFilename('my legal report (2026): final/v1*')).toBe('my-legal-report-2026-final-v1');
      expect(sanitizeFilename('')).toBe('dossier');
    });

    describe('Browser DOM mock tests', () => {
      let appendChildSpy: ReturnType<typeof vi.fn>;
      let removeChildSpy: ReturnType<typeof vi.fn>;
      let clickSpy: ReturnType<typeof vi.fn>;

      beforeEach(() => {
        clickSpy = vi.fn();
        appendChildSpy = vi.fn();
        removeChildSpy = vi.fn();

        (global as unknown as { window: unknown }).window = {};
        (global as unknown as { document: unknown }).document = {
          body: {
            appendChild: appendChildSpy,
            removeChild: removeChildSpy,
          },
          createElement: vi.fn(() => ({
            click: clickSpy,
            href: '',
            download: '',
          })),
        };
        (global as unknown as { URL: unknown }).URL = {
          createObjectURL: vi.fn(() => 'blob:http://localhost:3000/mock-uuid'),
          revokeObjectURL: vi.fn(),
        };
        (global as unknown as { Blob: unknown }).Blob = class MockBlob {
          constructor(public parts: unknown[], public options: unknown) {}
        };
      });

      afterEach(() => {
        delete (global as unknown as { window?: unknown }).window;
        delete (global as unknown as { document?: unknown }).document;
        delete (global as unknown as { URL?: unknown }).URL;
        delete (global as unknown as { Blob?: unknown }).Blob;
        delete (global as unknown as { navigator?: unknown }).navigator;
      });

      it('downloadFile triggers anchor click and revokes object URL in browser', () => {
        downloadFile('# Sample Content', 'test-doc.md', 'text/markdown');

        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(appendChildSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(removeChildSpy).toHaveBeenCalled();
        expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost:3000/mock-uuid');
      });

      it('copyToClipboard copies to navigator.clipboard if available', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        (global as unknown as { navigator: unknown }).navigator = {
          clipboard: {
            writeText: writeTextMock,
          },
        };

        const res = await copyToClipboard('Sample Markdown Text');

        expect(writeTextMock).toHaveBeenCalledWith('Sample Markdown Text');
        expect(res).toBe(true);
      });
    });
  });
});
