import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { FavorabilityVerdictCard } from '@/components/comparison/FavorabilityVerdictCard';
import { InconsistenciesSection } from '@/components/comparison/InconsistenciesSection';
import { ClauseComparisonTable } from '@/components/comparison/ClauseComparisonTable';
import { NegotiationGuide } from '@/components/comparison/NegotiationGuide';
import { ComparisonStickyNav } from '@/components/comparison/ComparisonStickyNav';
import { ClauseDiff, NegotiationGuide as NegotiationGuideType } from '@/lib/schemas/comparison';

describe('FavorabilityVerdictCard Component', () => {
  it('renders verdict pill and metric chips correctly for docA', () => {
    const html = renderToString(
      React.createElement(FavorabilityVerdictCard, {
        verdict: 'docA',
        rationale: 'Document A offers balanced indemnification.',
        metrics: {
          clausesFavoringDocA: 3,
          clausesFavoringDocB: 1,
          criticalInconsistencies: 2,
        },
        labelA: 'Offer V1',
        labelB: 'Offer V2',
      })
    );

    expect(html).toContain('Offer V1 has more favourable terms');
    expect(html).toContain('3');
    expect(html).toContain('clauses favour');
    expect(html).toContain('Offer V1');
    expect(html).toContain('2');
    expect(html).toContain('critical inconsistencies');
  });

  it('renders neutral verdict appropriately', () => {
    const html = renderToString(
      React.createElement(FavorabilityVerdictCard, {
        verdict: 'neutral',
        rationale: 'Both contracts reflect identical bilateral risk structures.',
        metrics: {
          clausesFavoringDocA: 0,
          clausesFavoringDocB: 0,
          criticalInconsistencies: 0,
        },
      })
    );

    expect(html).toContain('Terms are substantially equivalent');
  });
});

describe('InconsistenciesSection Component', () => {
  it('renders empty state when inconsistencies array is empty', () => {
    const html = renderToString(React.createElement(InconsistenciesSection, { inconsistencies: [] }));
    expect(html).toContain('No Inconsistencies Detected');
  });

  it('renders categorized inconsistencies with severity badges', () => {
    const items = [
      { clauseTitle: 'Liability Cap Variance', description: 'Clause 4 conflicts with Schedule B', severity: 'critical' as const },
      { clauseTitle: 'Notice Period', description: 'Notice is ambiguous between 14 and 30 days', severity: 'notable' as const },
    ];
    const html = renderToString(React.createElement(InconsistenciesSection, { inconsistencies: items }));
    expect(html).toContain('Critical Inconsistencies');
    expect(html).toContain('Liability Cap Variance');
    expect(html).toContain('Notable Variations &amp; Ambiguities');
  });
});

describe('ClauseComparisonTable Component', () => {
  const diffs: ClauseDiff[] = [
    {
      category: 'Termination',
      textDocA: 'Immediate termination without cause.',
      textDocB: '30 days written notice required.',
      favors: 'docB',
      riskRating: 'high',
      notes: 'Doc B provides necessary buffer period.',
    },
  ];

  it('renders clause excerpts with monospace font class and favors indicator', () => {
    const html = renderToString(
      React.createElement(ClauseComparisonTable, {
        differences: diffs,
        labelA: 'Old Contract',
        labelB: 'New Contract',
      })
    );

    expect(html).toContain('Termination');
    expect(html).toContain('font-mono');
    expect(html).toContain('Favours');
    expect(html).toContain('New Contract');
    expect(html).toContain('high');
    expect(html).toContain('risk');
  });
});

describe('NegotiationGuide Component', () => {
  const guide: NegotiationGuideType = {
    pushBack: [
      {
        clauseTitle: 'Uncapped Liability',
        rationale: 'Creates open-ended corporate financial exposure.',
        suggestedAlternative: 'Cap at total fees paid.',
      },
    ],
    acceptAsIs: [],
    flagForLawyer: [
      {
        clauseTitle: 'Broad Non-Compete',
        rationale: 'May exceed permissible state statutory bounds.',
      },
    ],
    recommendation: 'Prioritize liability capping before signing.',
  };

  it('renders 3 buckets and counter-proposal wording', () => {
    const html = renderToString(React.createElement(NegotiationGuide, { negotiationGuide: guide }));
    expect(html).toContain('Push Back On');
    expect(html).toContain('Uncapped Liability');
    expect(html).toContain('Counter-Proposal Draft');
    expect(html).toContain('Flag for Lawyer');
    expect(html).toContain('Prioritize liability capping before signing');
  });
});

describe('ComparisonStickyNav Component', () => {
  it('renders section buttons and counts', () => {
    const html = renderToString(
      React.createElement(ComparisonStickyNav, {
        activeSection: 'verdict-section',
        onSelectSection: vi.fn(),
        onReset: vi.fn(),
        counts: { differences: 4, inconsistencies: 1, negotiation: 3 },
      })
    );

    expect(html).toContain('Verdict');
    expect(html).toContain('Clause Comparison');
    expect(html).toContain('4');
    expect(html).toContain('Compare Another Pair');
  });
});
