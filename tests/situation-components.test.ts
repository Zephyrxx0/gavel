import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DeadlineAlertBanner } from '@/components/situation/DeadlineAlertBanner';
import { SituationSummaryCard } from '@/components/situation/SituationSummaryCard';
import { RightsAccordion } from '@/components/situation/RightsAccordion';
import { NextStepsRoadmap } from '@/components/situation/NextStepsRoadmap';

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

      // Radix Accordion renders open state for defaultValue="right-0"
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
});
