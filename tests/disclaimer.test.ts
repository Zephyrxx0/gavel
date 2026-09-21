import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  LegalDisclaimerBanner,
  LegalDisclaimerCard,
  DISCLAIMER_TEXT,
} from '@/components/shared/LegalDisclaimer';

describe('Legal Disclaimer Surfaces (CORE-02, D-05, T-01-05)', () => {
  it('exports LegalDisclaimerBanner and LegalDisclaimerCard as functions', () => {
    expect(typeof LegalDisclaimerBanner).toBe('function');
    expect(typeof LegalDisclaimerCard).toBe('function');
  });

  it('renders LegalDisclaimerBanner with required non-UPL phrases', () => {
    const html = renderToString(React.createElement(LegalDisclaimerBanner));

    // Mandatory statutory phrases
    expect(html).toContain(
      'Gavel provides legal information and educational assistance only'
    );
    expect(html).toContain('does not provide legal advice');
    expect(html).toContain('does not create an attorney-client relationship');
    expect(html).toContain('Always consult a qualified lawyer');

    // Root accessibility & test identifiers
    expect(html).toContain('data-testid="legal-disclaimer-banner"');
    expect(html).toContain('role="complementary"');
  });

  it('renders LegalDisclaimerCard with explicit statutory safe harbor warnings and advice limitations', () => {
    const html = renderToString(React.createElement(LegalDisclaimerCard));

    // Mandatory statutory safe harbor title & body
    expect(html).toContain(
      DISCLAIMER_TEXT.cardTitle.replace(/&/g, '&amp;')
    );
    expect(html).toContain(
      'strictly for informational and educational purposes'
    );
    expect(html).toContain('not a law firm');
    expect(html).toContain('does not provide legal advice');
    expect(html).toContain('does not create an attorney-client relationship');
    expect(html).toContain('Always consult a qualified, licensed lawyer');

    // AI limitations notice
    expect(html).toContain('AI analysis may contain inaccuracies or omissions');

    // Test identifier
    expect(html).toContain('data-testid="legal-disclaimer-card"');
  });

  it('ensures disclaimer surfaces are strictly non-dismissible without close handlers', () => {
    const bannerHtml = renderToString(
      React.createElement(LegalDisclaimerBanner)
    );
    const cardHtml = renderToString(React.createElement(LegalDisclaimerCard));

    // Must NOT contain any dismiss/close button or triggers
    expect(bannerHtml).not.toContain('aria-label="Close"');
    expect(bannerHtml).not.toContain('<button');
    expect(cardHtml).not.toContain('aria-label="Close"');
    expect(cardHtml).not.toContain('<button');

    // Both accept at most 1 optional props argument ({ className }) without dismiss handlers
    expect(LegalDisclaimerBanner.length).toBeLessThanOrEqual(1);
    expect(LegalDisclaimerCard.length).toBeLessThanOrEqual(1);
  });
});
