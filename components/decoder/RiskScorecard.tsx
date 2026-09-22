'use client';

import React, { useState, useMemo } from 'react';
import { Clause } from '@/lib/schemas/document';
import { ClauseCard } from './ClauseCard';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RiskScorecardProps {
  clauses: Clause[];
}

type FilterTier = 'all' | 'high' | 'caution' | 'standard';

export function RiskScorecard({ clauses }: RiskScorecardProps) {
  const [filterTier, setFilterTier] = useState<FilterTier>('all');

  const riskOrder: Record<string, number> = { high: 0, caution: 1, standard: 2 };

  const sortedClauses = useMemo(() => {
    return [...clauses].sort((a, b) => (riskOrder[a.risk] ?? 3) - (riskOrder[b.risk] ?? 3));
  }, [clauses]);

  const counts = useMemo(
    () => ({
      all: clauses.length,
      high: clauses.filter((c) => c.risk === 'high').length,
      caution: clauses.filter((c) => c.risk === 'caution').length,
      standard: clauses.filter((c) => c.risk === 'standard').length,
    }),
    [clauses]
  );

  const displayedClauses = useMemo(() => {
    if (filterTier === 'all') return sortedClauses;
    return sortedClauses.filter((c) => c.risk === filterTier);
  }, [sortedClauses, filterTier]);

  return (
    <section id="risks-section" className="scroll-mt-28 space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-white tracking-wide">
              Risk Scorecard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Clauses triaged across three traffic-light risk tiers with verbatim citations
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterTier('all')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {`All Clauses (${counts.all})`}
          </button>
          <button
            onClick={() => setFilterTier('high')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'high'
                ? 'bg-red-950/80 text-red-300 border border-red-500/60 font-semibold'
                : 'bg-slate-900 text-red-400/80 hover:text-red-300 border border-slate-800'
            }`}
          >
            {`🔴 High Risk (${counts.high})`}
          </button>
          <button
            onClick={() => setFilterTier('caution')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'caution'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 font-semibold'
                : 'bg-slate-900 text-amber-400/80 hover:text-amber-300 border border-slate-800'
            }`}
          >
            {`🟡 Caution (${counts.caution})`}
          </button>
          <button
            onClick={() => setFilterTier('standard')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'standard'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-semibold'
                : 'bg-slate-900 text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            {`🟢 Standard (${counts.standard})`}
          </button>
        </div>
      </div>

      {/* Clause Cards Grid */}
      {displayedClauses.length > 0 ? (
        <div className="space-y-4">
          {displayedClauses.map((clause) => (
            <ClauseCard key={clause.id} clause={clause} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-8 text-center space-y-3">
          <p className="font-sans text-base font-semibold text-slate-200">
            No clauses match the selected risk tier
          </p>
          <p className="text-xs text-slate-400">
            Switch filter to 'All Clauses' to review all analyzed sections of this document.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterTier('all')}
            className="text-xs mt-2"
          >
            Reset to All Clauses
          </Button>
        </div>
      )}
    </section>
  );
}
