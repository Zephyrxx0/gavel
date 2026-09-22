import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import HomePage from '@/app/page';
import ComparePage from '@/app/analyze/compare/page';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Homepage Mode 3 Integration', () => {
  it('renders Mode 2 and Mode 3 side-by-side cards linking to respective routes', () => {
    const html = renderToString(React.createElement(HomePage));

    expect(html).toContain('Mode 2 · Situation Navigator');
    expect(html).toContain('href="/analyze/situation"');
    expect(html).toContain('Mode 3 · Compare Agreements');
    expect(html).toContain('Compare Two Contracts');
    expect(html).toContain('href="/analyze/compare"');
  });
});

describe('ComparePage Integration', () => {
  it('renders idle state with header, disclaimer, and dual intake', () => {
    const html = renderToString(React.createElement(ComparePage));

    expect(html).toContain('Mode 3 · Document Comparison Engine');
    expect(html).toContain('Compare Two Legal Agreements');
    expect(html).toContain('Original Document');
    expect(html).toContain('Revised Document');
    expect(html).toContain('Mandatory Legal Notice &amp; Statutory Safe Harbor');
  });
});
