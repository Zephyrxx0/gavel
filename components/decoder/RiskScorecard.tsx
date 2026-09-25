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
    <section id="risks-section" className="scroll-mt-36 space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF3EE] border border-[#D0E2D6] flex items-center justify-center text-[#264D34]">
              <Shield className="w-4 h-4 text-[#264D34]" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
              Risk Scorecard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Clauses triaged across three traffic-light risk tiers with verbatim citations
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterTier('all')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-150 ${
              filterTier === 'all'
                ? 'bg-stone-900 text-white font-medium shadow-sm'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            {`All Clauses (${counts.all})`}
          </button>
          <button
            onClick={() => setFilterTier('high')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-150 ${
              filterTier === 'high'
                ? 'bg-rose-50 text-rose-800 border border-rose-200 font-medium shadow-sm'
                : 'bg-white text-rose-700/80 hover:text-rose-900 border border-stone-200/80'
            }`}
          >
            {`🔴 High Risk (${counts.high})`}
          </button>
          <button
            onClick={() => setFilterTier('caution')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-150 ${
              filterTier === 'caution'
                ? 'bg-amber-50 text-amber-800 border border-amber-200 font-medium shadow-sm'
                : 'bg-white text-amber-700/80 hover:text-amber-900 border border-stone-200/80'
            }`}
          >
            {`🟡 Caution (${counts.caution})`}
          </button>
          <button
            onClick={() => setFilterTier('standard')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-150 ${
              filterTier === 'standard'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium shadow-sm'
                : 'bg-white text-emerald-700/80 hover:text-emerald-900 border border-stone-200/80'
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
        <div className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center space-y-3 shadow-card-soft">
          <p className="font-sans text-base font-semibold text-stone-900">
            No clauses match the selected risk tier
          </p>
          <p className="text-xs text-stone-600">
            Switch filter to 'All Clauses' to review all analyzed sections of this document.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterTier('all')}
            className="text-xs mt-2 border-stone-200 text-stone-700 hover:bg-stone-50"
          >
            Reset to All Clauses
          </Button>
        </div>
      )}
    </section>
  );
}
