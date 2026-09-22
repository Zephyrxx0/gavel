import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DeadlineAlertBanner } from '@/components/situation/DeadlineAlertBanner';
import { SituationSummaryCard } from '@/components/situation/SituationSummaryCard';

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
});
