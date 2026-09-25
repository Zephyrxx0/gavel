import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ExecutiveSummaryCard } from '@/components/decoder/ExecutiveSummaryCard';
import { ClauseCard } from '@/components/decoder/ClauseCard';
import { RiskScorecard } from '@/components/decoder/RiskScorecard';
import { ActionChecklist } from '@/components/decoder/ActionChecklist';
import { LawyerPrepGuide } from '@/components/decoder/LawyerPrepGuide';
import { StickyNav } from '@/components/decoder/StickyNav';
import { AnalysisProgress } from '@/components/decoder/AnalysisProgress';
import { AnalysisErrorCard } from '@/components/decoder/AnalysisErrorCard';
import { Clause, ActionItem, LawyerQuestion } from '@/lib/schemas/document';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('Decoder Components Test Suite (Wave 2: DECODE-02..05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ExecutiveSummaryCard (Layer 1)', () => {
    it('renders document classification badge and summary text', () => {
      const html = renderToString(
        React.createElement(ExecutiveSummaryCard, {
          documentType: 'Commercial Lease Agreement',
          parties: ['Alpha Realty LLC', 'Beta Retailers Inc.'],
          summary: 'A 3-year commercial property lease for retail operations.',
        })
      );

      expect(html).toContain('Commercial Lease Agreement');
      expect(html).toContain('Executive Brief');
      expect(html).toContain('A 3-year commercial property lease for retail operations.');
      expect(html).toContain('Alpha Realty LLC');
      expect(html).toContain('Beta Retailers Inc.');
      expect(html).toContain('id="summary-section"');
    });

    it('renders fallback copy when parties array is empty', () => {
      const html = renderToString(
        React.createElement(ExecutiveSummaryCard, {
          documentType: 'Non-Disclosure Agreement',
          parties: [],
          summary: 'Mutual confidentiality obligations.',
        })
      );

      expect(html).toContain('Signatory entities not explicitly declared in source text');
    });

    it('renders default document type when none is provided', () => {
      const html = renderToString(
        React.createElement(ExecutiveSummaryCard, {
          documentType: '',
          parties: ['Entity A'],
          summary: 'Standard summary.',
        })
      );

      expect(html).toContain('Legal Document');
    });
  });

  describe('ClauseCard (Layer 2)', () => {
    const mockHighRiskClause: Clause = {
      id: 'c-1',
      title: 'Uncapped Indemnification',
      originalText: 'Party B shall indemnify Party A against all claims without limit.',
      simplified: 'You must pay for any lawsuits against Party A with no maximum dollar cap.',
      risk: 'high',
      riskReason: 'Uncapped indemnification exposes signer to unlimited financial exposure.',
      obligation: 'user',
    };

    const mockCautionClause: Clause = {
      id: 'c-2',
      title: 'Short Notice Termination',
      originalText: 'Party A may terminate upon 48 hours notice.',
      simplified: 'Party A can end the agreement on 2 days notice.',
      risk: 'caution',
      riskReason: '48-hour termination period is unusually brief for commercial arrangements.',
      obligation: 'counterparty',
    };

    const mockStandardClause: Clause = {
      id: 'c-3',
      title: 'Severability',
      originalText: 'If any provision is deemed unenforceable, remaining terms survive.',
      simplified: 'Invalid provisions do not void the remainder of the contract.',
      risk: 'standard',
      riskReason: 'Standard boilerplate severability clause.',
      obligation: 'mutual',
    };

    it('renders high-risk styling with crimson border and Duty: User obligation', () => {
      const html = renderToString(React.createElement(ClauseCard, { clause: mockHighRiskClause, defaultOpen: true }));

      expect(html).toContain('id="clause-c-1"');
      expect(html).toContain('Uncapped Indemnification');
      expect(html).toContain('High Risk');
      expect(html).toContain('border-red-500/80');
      expect(html).toContain('bg-red-950/20');
      expect(html).toContain('Duty: User');
      expect(html).toContain('Analysis Rationale:');
      expect(html).toContain('Party B shall indemnify Party A against all claims without limit.');
      expect(html).toContain('Show verbatim source text');
    });

    it('renders caution styling with amber border and Duty: Counterparty obligation', () => {
      const html = renderToString(React.createElement(ClauseCard, { clause: mockCautionClause }));

      expect(html).toContain('id="clause-c-2"');
      expect(html).toContain('Short Notice Termination');
      expect(html).toContain('Caution');
      expect(html).toContain('border-amber-500/60');
      expect(html).toContain('Duty: Counterparty');
    });

    it('renders standard styling with emerald border and Duty: Mutual obligation', () => {
      const html = renderToString(React.createElement(ClauseCard, { clause: mockStandardClause }));

      expect(html).toContain('id="clause-c-3"');
      expect(html).toContain('Severability');
      expect(html).toContain('Standard');
      expect(html).toContain('border-emerald-500/50');
      expect(html).toContain('Duty: Mutual');
    });
  });

  describe('RiskScorecard (Layer 2 Container)', () => {
    const clauses: Clause[] = [
      {
        id: 'clause-std',
        title: 'Governing Law',
        originalText: 'Laws of State X apply.',
        simplified: 'State X laws govern this contract.',
        risk: 'standard',
        riskReason: 'Customary governing law clause.',
        obligation: 'none',
      },
      {
        id: 'clause-high',
        title: 'Unlimited Liability',
        originalText: 'Signer is liable for all incidental damages.',
        simplified: 'You are liable for all incidental losses.',
        risk: 'high',
        riskReason: 'Severe unilateral liability allocation.',
        obligation: 'user',
      },
      {
        id: 'clause-caution',
        title: 'Restrictive Covenant',
        originalText: 'No competing within 50 miles for 2 years.',
        simplified: 'You cannot operate a similar business within 50 miles.',
        risk: 'caution',
        riskReason: 'Broad geographic restriction.',
        obligation: 'user',
      },
    ];

    it('sorts clauses high-risk first regardless of input order', () => {
      const html = renderToString(React.createElement(RiskScorecard, { clauses }));

      expect(html).toContain('id="risks-section"');
      expect(html).toContain('Risk Scorecard');

      // Verify clause-high appears before clause-caution and clause-std in the rendered HTML
      const highIndex = html.indexOf('clause-clause-high');
      const cautionIndex = html.indexOf('clause-clause-caution');
      const stdIndex = html.indexOf('clause-clause-std');

      expect(highIndex).toBeGreaterThan(-1);
      expect(cautionIndex).toBeGreaterThan(highIndex);
      expect(stdIndex).toBeGreaterThan(cautionIndex);
    });

    it('renders filter chip counts accurately', () => {
      const html = renderToString(React.createElement(RiskScorecard, { clauses }));

      expect(html).toContain('All Clauses (3)');
      expect(html).toContain('🔴 High Risk (1)');
      expect(html).toContain('🟡 Caution (1)');
      expect(html).toContain('🟢 Standard (1)');
    });

    it('displays documented empty state when clauses array is empty', () => {
      const html = renderToString(React.createElement(RiskScorecard, { clauses: [] }));

      expect(html).toContain('No clauses match the selected risk tier');
      expect(html).toContain("Switch filter to &#x27;All Clauses&#x27; to review all analyzed sections of this document.");
      expect(html).toContain('Reset to All Clauses');
    });
  });

  describe('ActionChecklist (Layer 3)', () => {
    const mockChecklist: ActionItem[] = [
      {
        id: 'action-1',
        timing: 'immediate',
        actionType: 'refuse',
        description: 'Refuse unilateral automatic renewal provision in Section 12.',
        relatedClauseId: 'c-1',
      },
      {
        id: 'action-2',
        timing: 'before_signing',
        actionType: 'negotiate',
        description: 'Propose 30-day cure period for non-material breaches.',
        relatedClauseId: 'c-2',
      },
      {
        id: 'action-3',
        timing: 'after_signing',
        actionType: 'verify',
        description: 'Calendar certificate of insurance submission deadline within 14 days.',
      },
    ];

    it('categorizes action items into Immediate, Before Signing, and After Signing groups', () => {
      const html = renderToString(
        React.createElement(ActionChecklist, {
          checklist: mockChecklist,
        })
      );

      expect(html).toContain('id="checklist-section"');
      expect(html).toContain('Actionable Checklist');
      expect(html).toContain('Immediate Operational Priorities');
      expect(html).toContain('Action Required Before Signing');
      expect(html).toContain('Post-Execution Compliance &amp; Monitoring');
      expect(html).toContain('Refuse unilateral automatic renewal provision in Section 12.');
      expect(html).toContain('Propose 30-day cure period for non-material breaches.');
      expect(html).toContain('Calendar certificate of insurance submission deadline within 14 days.');
      expect(html).toContain('Re: c-1');
      expect(html).toContain('Re: c-2');
    });

    it('displays empty state placeholder when a timing group contains 0 items', () => {
      const onlyImmediate: ActionItem[] = [
        {
          id: 'action-1',
          timing: 'immediate',
          actionType: 'verify',
          description: 'Immediate step only.',
        },
      ];

      const html = renderToString(
        React.createElement(ActionChecklist, {
          checklist: onlyImmediate,
        })
      );

      expect(html).toContain('No before signing action items identified');
      expect(html).toContain('No after signing action items identified');
    });

    it('renders semantic action pills for negotiate, verify, refuse, accept', () => {
      const allActionTypes: ActionItem[] = [
        { id: '1', timing: 'immediate', actionType: 'negotiate', description: 'Step' },
        { id: '2', timing: 'immediate', actionType: 'verify', description: 'Step' },
        { id: '3', timing: 'immediate', actionType: 'refuse', description: 'Step' },
        { id: '4', timing: 'immediate', actionType: 'accept', description: 'Step' },
      ];

      const html = renderToString(
        React.createElement(ActionChecklist, {
          checklist: allActionTypes,
        })
      );

      expect(html).toContain('border-purple-500/40');
      expect(html).toContain('border-amber-500/40');
      expect(html).toContain('border-red-500/40');
      expect(html).toContain('border-emerald-500/40');
    });
  });

  describe('LawyerPrepGuide (Layer 4)', () => {
    const mockQuestions: LawyerQuestion[] = [
      {
        id: 'q-1',
        question: 'Is the uncapped indemnification in Clause 4 enforceable under local commercial statutes?',
        context: 'Signer is subject to unlimited third-party claims without contributory negligence defenses.',
        relatedClauseId: 'clause-4',
      },
      {
        id: 'q-2',
        question: 'Can the non-solicitation duration be narrowed from 36 months to 12 months?',
        context: 'A 3-year non-solicitation window significantly impairs regional business operations.',
      },
    ];

    it('renders question cards with Q1, Q2 badges, titles, and strategic context panels', () => {
      const html = renderToString(
        React.createElement(LawyerPrepGuide, {
          lawyerQuestions: mockQuestions,
        })
      );

      expect(html).toContain('id="lawyer-prep-section"');
      expect(html).toContain('Lawyer Preparation Guide');
      expect(html).toContain('Q1');
      expect(html).toContain('Q2');
      expect(html).toContain('Is the uncapped indemnification in Clause 4 enforceable under local commercial statutes?');
      expect(html).toContain('Strategic Context');
      expect(html).toContain('Signer is subject to unlimited third-party claims without contributory negligence defenses.');
      expect(html).toContain('Copy Question');
      expect(html).toContain('Re: clause-4');
    });
  });

  describe('StickyNav', () => {
    it('renders navigation bar with section items, counters, and reset trigger', () => {
      const html = renderToString(
        React.createElement(StickyNav, {
          activeSection: 'risks-section',
          onNavigate: vi.fn(),
          onReset: vi.fn(),
          counts: { risks: 5, checklist: 4, lawyerQuestions: 7 },
        })
      );

      expect(html).toContain('Summary');
      expect(html).toContain('Risks');
      expect(html).toContain('5');
      expect(html).toContain('Checklist');
      expect(html).toContain('4');
      expect(html).toContain('Lawyer Prep');
      expect(html).toContain('7');
      expect(html).toContain('Analyze Another Document');
    });
  });

  describe('AnalysisProgress', () => {
    it('renders analyzing document title and milestone stages', () => {
      const html = renderToString(React.createElement(AnalysisProgress));

      expect(html).toContain('Analyzing Legal Document');
      expect(html).toContain('Elapsed time:');
      expect(html).toContain('Deconstructing document structure &amp; contracting parties...');
      expect(html).toContain('Evaluating clause risks &amp; obligation asymmetry...');
      expect(html).toContain('Formulating actionable checklist &amp; counsel prep guide...');
      expect(html).toContain('Zero-retention volatile processing in progress');
    });
  });

  describe('AnalysisErrorCard', () => {
    it('renders error message, retry trigger, and adjust input trigger', () => {
      const html = renderToString(
        React.createElement(AnalysisErrorCard, {
          errorMessage: 'Anthropic rate limit reached',
          onRetry: vi.fn(),
          onAdjustInput: vi.fn(),
        })
      );

      expect(html).toContain('Analysis Encountered an Issue');
      expect(html).toContain('Anthropic rate limit reached');
      expect(html).toContain('Your document was processed ephemerally and has been cleared from volatile memory.');
      expect(html).toContain('Adjust Input Text');
      expect(html).toContain('Retry Analysis');
    });
  });

  describe('UploadedDocumentCard', () => {
    it('renders document details, thumbnail elements, and action buttons for PDF', async () => {
      const { UploadedDocumentCard } = await import('@/components/decoder/UploadedDocumentCard');
      const html = renderToString(
        React.createElement(UploadedDocumentCard, {
          uploadedDoc: {
            fileName: 'residential-lease-agreement.pdf',
            sizeBytes: 1048576,
            wordCount: 1500,
            mimeType: 'application/pdf',
            isImage: false,
            text: 'This Residential Lease Agreement is entered into on January 1, 2025 between Landlord and Tenant.',
          },
          fileObjectUrl: 'blob:http://localhost:3000/test-pdf-uuid',
        })
      );

      expect(html).toContain('residential-lease-agreement.pdf');
      expect(html).toContain('Source Agreement');
      expect(html).toContain('Zero-Disk Vault');
      expect(html).toContain('PDF Document');
      expect(html).toContain('words');
      expect(html).toContain('Open Document');
      expect(html).toContain('Read Text');
    });

    it('renders document thumbnail and details for manual text', async () => {
      const { UploadedDocumentCard } = await import('@/components/decoder/UploadedDocumentCard');
      const html = renderToString(
        React.createElement(UploadedDocumentCard, {
          uploadedDoc: null,
          manualText: 'The Contractor shall deliver the deliverables within 30 days of signing this agreement.',
        })
      );

      expect(html).toContain('Pasted Legal Text');
      expect(html).toContain('Manual Paste');
      expect(html).toContain('Open Document');
    });
  });
});
