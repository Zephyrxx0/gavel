import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DeadlineAlertBanner } from '@/components/situation/DeadlineAlertBanner';
import { SituationSummaryCard } from '@/components/situation/SituationSummaryCard';
import { RightsAccordion } from '@/components/situation/RightsAccordion';
import { NextStepsRoadmap } from '@/components/situation/NextStepsRoadmap';
import { EvidenceChecklist } from '@/components/situation/EvidenceChecklist';
import { CounselTriggersCard } from '@/components/situation/CounselTriggersCard';
import { SituationStickyNav } from '@/components/situation/SituationStickyNav';
import { SituationErrorCard } from '@/components/situation/SituationErrorCard';
import HomePage from '@/app/page';

describe('Situation Navigator Component Test Suite (Wave 2: SIT-02..07)', () => {
  describe('DeadlineAlertBanner (SIT-07, D-10)', () => {
    it('renders alert cards when deadlines exist', () => {
      const html = renderToString(
        React.createElement(DeadlineAlertBanner, {
          deadlineFlags: ['21-day statutory notice deadline', '3-year contract limitation window'],
        })
      );
      expect(html).toContain('id="deadline-section"');
      expect(html).toContain('Critical Time-Sensitive Deadlines Detected');
      expect(html).toContain('21-day statutory notice deadline');
      expect(html).toContain('3-year contract limitation window');
      expect(html).toContain('Statutory limitation periods and notice windows are strictly enforced.');
    });

    it('returns null and renders nothing when deadlineFlags is empty or undefined', () => {
      const htmlEmpty = renderToString(React.createElement(DeadlineAlertBanner, { deadlineFlags: [] }));
      expect(htmlEmpty).toBe('');

      const htmlUndefined = renderToString(
        React.createElement(DeadlineAlertBanner, { deadlineFlags: undefined as unknown as string[] })
      );
      expect(htmlUndefined).toBe('');
    });
  });

  describe('SituationSummaryCard (SIT-02, SIT-03, SIT-06, D-07, D-14, D-16)', () => {
    it('renders verified category badge, summary narrative, and estimated timeline', () => {
      const html = renderToString(
        React.createElement(SituationSummaryCard, {
          summary: 'Landlord withholding security deposit without itemization.',
          disputeCategory: 'tenancy',
          estimatedTimeline: 'Typically 1–3 months via demand letter',
          onChangeCategory: vi.fn(),
        })
      );
      expect(html).toContain('id="summary-section"');
      expect(html).toContain('Verified: Tenancy Dispute');
      expect(html).toContain('Landlord withholding security deposit without itemization.');
      expect(html).toContain('Resolution Horizon');
      expect(html).toContain('Typically 1–3 months via demand letter');
      expect(html).toContain('Change Domain');
      expect(html).toContain('Educational &amp; Informational Analysis · Not Formal Legal Counsel');
    });

    it('renders without change button when onChangeCategory is not provided', () => {
      const html = renderToString(
        React.createElement(SituationSummaryCard, {
          summary: 'General civil breach summary.',
          disputeCategory: 'civil',
          estimatedTimeline: '6–12 months in court',
        })
      );
      expect(html).toContain('Verified: Civil Dispute');
      expect(html).not.toContain('Change Domain');
    });
  });

  describe('RightsAccordion (SIT-04, D-11)', () => {
    const mockRights = [
      {
        title: 'Right to Itemized Deductions',
        explanation: 'Landlords are legally required to provide an itemized statement within 21 days.',
        statuteReference: 'Cal. Civ. Code § 1950.5(g)(2)',
      },
      {
        title: 'Protection from Retaliation',
        explanation: 'Landlord may not issue retaliatory eviction notices following habitability complaints.',
        statuteReference: 'Cal. Civ. Code § 1942.5',
      },
    ];

    it('renders statutory citation badge, titles, and explanations', () => {
      const html = renderToString(
        React.createElement(RightsAccordion, {
          rights: mockRights,
        })
      );

      expect(html).toContain('id="rights-section"');
      expect(html).toContain('Your Statutory Rights');
      expect(html).toContain('Right to Itemized Deductions');
      expect(html).toContain('Cal. Civ. Code § 1950.5(g)(2)');
      expect(html).toContain('Protection from Retaliation');
      expect(html).toContain('Cal. Civ. Code § 1942.5');
    });

    it('expands first item by default via defaultValue="right-0"', () => {
      const html = renderToString(
        React.createElement(RightsAccordion, {
          rights: mockRights,
        })
      );

      expect(html).toContain('data-state="open"');
      expect(html).toContain('Landlords are legally required to provide an itemized statement within 21 days.');
    });

    it('returns null when rights is empty or undefined', () => {
      expect(renderToString(React.createElement(RightsAccordion, { rights: [] }))).toBe('');
      expect(renderToString(React.createElement(RightsAccordion, { rights: undefined as unknown as [] }))).toBe('');
    });
  });

  describe('NextStepsRoadmap (SIT-05, D-05, D-12)', () => {
    const mockRoadmap = [
      {
        step: 'Preserve Move-Out Documentation',
        description: 'Compile photographic evidence and copies of lease communications.',
        urgency: 'immediate' as const,
        doableWithoutLawyer: true,
      },
      {
        step: 'Send Formal Demand Notice',
        description: 'Mail certified letter citing statutory return requirements.',
        urgency: 'within-7-days' as const,
        doableWithoutLawyer: true,
      },
      {
        step: 'File Small Claims Complaint',
        description: 'Submit formal claim in municipal small claims court.',
        urgency: 'within-30-days' as const,
        doableWithoutLawyer: true,
      },
      {
        step: 'Retain Counsel for Counterclaim Defense',
        description: 'Engage licensed tenant-rights attorney if counterparty counter-sues for damages.',
        urgency: 'when-ready' as const,
        doableWithoutLawyer: false,
      },
    ];

    it('groups steps into 4 urgency tiers with correct headings and pill badges', () => {
      const html = renderToString(
        React.createElement(NextStepsRoadmap, {
          roadmap: mockRoadmap,
        })
      );

      expect(html).toContain('id="roadmap-section"');
      expect(html).toContain('Next Steps Roadmap');
      expect(html).toContain('Immediate Actions (Emergency / Evidence Preservation)');
      expect(html).toContain('Actions Within 7 Days (Written Notices &amp; Formal Demands)');
      expect(html).toContain('Actions Within 30 Days (Administrative &amp; Statutory Filing)');
      expect(html).toContain('Long-Term Escalation (Tribunals &amp; Settlement)');
    });

    it('renders Doable Solo vs Counsel Recommended badges', () => {
      const html = renderToString(
        React.createElement(NextStepsRoadmap, {
          roadmap: mockRoadmap,
        })
      );

      expect(html).toContain('✓ Doable Solo');
      expect(html).toContain('⚠ Counsel Recommended');
      expect(html).toContain('Preserve Move-Out Documentation');
      expect(html).toContain('Retain Counsel for Counterclaim Defense');
    });

    it('omits empty urgency tiers cleanly without blank DOM blocks', () => {
      const singleTier = [
        {
          step: 'Check State Statutes',
          description: 'Review governing code.',
          urgency: 'immediate' as const,
          doableWithoutLawyer: true,
        },
      ];

      const html = renderToString(
        React.createElement(NextStepsRoadmap, {
          roadmap: singleTier,
        })
      );

      expect(html).toContain('Immediate Actions (Emergency / Evidence Preservation)');
      expect(html).not.toContain('Actions Within 7 Days');
      expect(html).not.toContain('Actions Within 30 Days');
      expect(html).not.toContain('Long-Term Escalation');
    });

    it('returns null when roadmap is empty or undefined', () => {
      expect(renderToString(React.createElement(NextStepsRoadmap, { roadmap: [] }))).toBe('');
      expect(renderToString(React.createElement(NextStepsRoadmap, { roadmap: undefined as unknown as [] }))).toBe('');
    });
  });

  describe('EvidenceChecklist (SIT-06, D-06, D-12)', () => {
    const mockEvidence = [
      {
        document: 'Signed Lease Agreement',
        why: 'Establishes the initial deposit amount and terms of tenancy surrender.',
      },
      {
        document: 'Move-Out Inspection Photos',
        why: 'Demonstrates clean physical condition and rebuts wear-and-tear deductions.',
      },
    ];

    it('renders document item cards with why rationale and progress counter', () => {
      const html = renderToString(
        React.createElement(EvidenceChecklist, {
          documentsToGather: mockEvidence,
        })
      );

      expect(html).toContain('id="evidence-section"');
      expect(html).toContain('Documents to Gather');
      expect(html).toContain('Signed Lease Agreement');
      expect(html).toContain('Establishes the initial deposit amount');
      expect(html).toContain('Move-Out Inspection Photos');
      expect(html).toContain('Demonstrates clean physical condition');
      expect(html).toContain('Why This Matters');
      expect(html).toContain('Collected 0 of 2 evidentiary items (0%)');
    });

    it('renders documented empty state fallback when evidence list is empty', () => {
      const html = renderToString(
        React.createElement(EvidenceChecklist, {
          documentsToGather: [],
        })
      );

      expect(html).toContain('id="evidence-section"');
      expect(html).toContain('No mandatory evidentiary documents identified for this dispute.');
    });
  });

  describe('CounselTriggersCard (SIT-06, D-08)', () => {
    const mockTriggers = [
      'If the counterparty serves a formal eviction summons or unlawful detainer.',
      'If alleged damages exceed the statutory small claims monetary threshold ($10,000).',
    ];

    it('renders attorney escalation cards with trigger descriptions', () => {
      const html = renderToString(
        React.createElement(CounselTriggersCard, {
          whenToCallLawyer: mockTriggers,
        })
      );

      expect(html).toContain('id="counsel-section"');
      expect(html).toContain('When to Consult Professional Counsel');
      expect(html).toContain('Escalation Trigger 01');
      expect(html).toContain('If the counterparty serves a formal eviction summons');
      expect(html).toContain('Escalation Trigger 02');
      expect(html).toContain('If alleged damages exceed the statutory small claims monetary threshold');
    });

    it('returns null when whenToCallLawyer is empty or undefined', () => {
      expect(renderToString(React.createElement(CounselTriggersCard, { whenToCallLawyer: [] }))).toBe('');
      expect(renderToString(React.createElement(CounselTriggersCard, { whenToCallLawyer: undefined as unknown as [] }))).toBe('');
    });
  });

  describe('SituationStickyNav (D-09)', () => {
    it('renders 5 section targets and counter badges', () => {
      const html = renderToString(
        React.createElement(SituationStickyNav, {
          activeSection: 'summary-section',
          onNavigate: vi.fn(),
          onReset: vi.fn(),
          counts: {
            rights: 3,
            roadmap: 4,
            evidence: 5,
            counselTriggers: 2,
          },
        })
      );

      expect(html).toContain('Summary');
      expect(html).toContain('Your Rights');
      expect(html).toContain('[3]');
      expect(html).toContain('Roadmap');
      expect(html).toContain('[4]');
      expect(html).toContain('Evidence');
      expect(html).toContain('[5]');
      expect(html).toContain('Counsel Triggers');
      expect(html).toContain('[2]');
      expect(html).toContain('Start New Situation');
    });

    it('supports counts.counsel alias for counselTriggers', () => {
      const html = renderToString(
        React.createElement(SituationStickyNav, {
          activeSection: 'rights-section',
          onNavigate: vi.fn(),
          onReset: vi.fn(),
          counts: {
            rights: 2,
            roadmap: 3,
            evidence: 4,
            counsel: 1,
          },
        })
      );

      expect(html).toContain('[1]');
    });

    it('renders deadline navigation button when hasDeadlines is true', () => {
      const html = renderToString(
        React.createElement(SituationStickyNav, {
          activeSection: 'deadline-section',
          onNavigate: vi.fn(),
          onReset: vi.fn(),
          hasDeadlines: true,
          counts: {
            rights: 1,
            roadmap: 1,
            evidence: 1,
            counselTriggers: 1,
          },
        })
      );

      expect(html).toContain('Deadlines');
    });
  });

  describe('SituationErrorCard (SIT-01, Plan 03-04)', () => {
    it('renders exact UI-SPEC error heading, body copy with errorMessage, and CTAs', () => {
      const onRetry = vi.fn();
      const onAdjustDescription = vi.fn();
      const html = renderToString(
        React.createElement(SituationErrorCard, {
          errorMessage: 'Anthropic rate limit exceeded',
          onRetry,
          onAdjustDescription,
        })
      );

      expect(html).toContain('data-testid="situation-error-card"');
      expect(html).toContain('Analysis Encountered an Issue');
      expect(html).toContain(
        'Gavel could not complete situation analysis: Anthropic rate limit exceeded. Your dispute narrative was processed ephemerally and has been cleared from volatile server memory.'
      );
      expect(html).toContain('Adjust Dispute Description');
      expect(html).toContain('Retry Analysis');
    });

    it('triggers onRetry and onAdjustDescription callbacks on button clicks', () => {
      const onRetry = vi.fn();
      const onAdjustDescription = vi.fn();
      const element = React.createElement(SituationErrorCard, {
        errorMessage: 'Network timeout',
        onRetry,
        onAdjustDescription,
      });

      const tree = element.type(element.props);
      // tree.props.children[1] is the actions container
      const actionButtons = tree.props.children[1].props.children;
      const adjustBtn = actionButtons[0];
      const retryBtn = actionButtons[1];

      adjustBtn.props.onClick();
      expect(onAdjustDescription).toHaveBeenCalledTimes(1);

      retryBtn.props.onClick();
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('Complete Situation Dossier Integration (Plan 03-04)', () => {
    const mockAnalysis = {
      disputeCategory: 'tenancy' as const,
      summary: 'Landlord withholding $2,400 security deposit without itemized statement or receipts within statutory 21 days.',
      estimatedTimeline: 'Typically 1–3 months via formal demand letter',
      deadlineFlags: ['21-day statutory notice deadline', '3-year contract limitation window'],
      rights: [
        {
          title: 'Right to Itemized Deductions',
          explanation: 'Landlords are legally required to provide an itemized statement within 21 days.',
          statuteReference: 'Cal. Civ. Code § 1950.5(g)(2)',
        },
      ],
      roadmap: [
        {
          step: 'Send Formal Demand Letter',
          description: 'Mail certified letter citing statutory return requirements.',
          urgency: 'immediate' as const,
          doableWithoutLawyer: true,
        },
        {
          step: 'File Small Claims Complaint',
          description: 'Submit formal claim in municipal small claims court.',
          urgency: 'within-30-days' as const,
          doableWithoutLawyer: true,
        },
      ],
      documentsToGather: [
        {
          document: 'Signed Lease Agreement',
          why: 'Establishes initial deposit and terms.',
        },
      ],
      whenToCallLawyer: [
        'If landlord asserts fraudulent damages exceeding $10,000.',
      ],
    };

    it('renders all 6 dossier layers with correct section anchor IDs', () => {
      const bannerHtml = renderToString(
        React.createElement(DeadlineAlertBanner, { deadlineFlags: mockAnalysis.deadlineFlags })
      );
      const summaryHtml = renderToString(
        React.createElement(SituationSummaryCard, {
          disputeCategory: mockAnalysis.disputeCategory,
          summary: mockAnalysis.summary,
          estimatedTimeline: mockAnalysis.estimatedTimeline,
        })
      );
      const rightsHtml = renderToString(
        React.createElement(RightsAccordion, { rights: mockAnalysis.rights })
      );
      const roadmapHtml = renderToString(
        React.createElement(NextStepsRoadmap, { roadmap: mockAnalysis.roadmap })
      );
      const evidenceHtml = renderToString(
        React.createElement(EvidenceChecklist, { documentsToGather: mockAnalysis.documentsToGather })
      );
      const counselHtml = renderToString(
        React.createElement(CounselTriggersCard, { whenToCallLawyer: mockAnalysis.whenToCallLawyer })
      );

      expect(bannerHtml).toContain('id="deadline-section"');
      expect(summaryHtml).toContain('id="summary-section"');
      expect(rightsHtml).toContain('id="rights-section"');
      expect(roadmapHtml).toContain('id="roadmap-section"');
      expect(evidenceHtml).toContain('id="evidence-section"');
      expect(counselHtml).toContain('id="counsel-section"');
    });
  });

  describe('HomePage (Discovery & Navigation to /analyze/situation)', () => {
    it('renders prominent Mode 2 discovery card linking to /analyze/situation', () => {
      const html = renderToString(React.createElement(HomePage));

      expect(html).toContain('href="/analyze/situation"');
      expect(html).toContain('I have a legal situation');
      expect(html).toContain('Situation Navigator');
      expect(html).toContain(
        'Describe an ongoing dispute or legal dilemma in plain English to evaluate your rights, next steps, and evidence.'
      );
      expect(html).toContain('Mode 2 · Situation Navigator');
    });
  });
});


