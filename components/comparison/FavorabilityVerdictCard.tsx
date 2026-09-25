'use client';

import React from 'react';
import { Scale, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Favorability } from '@/lib/schemas/comparison';

export interface FavorabilityVerdictCardProps {
  verdict: Favorability;
  rationale: string;
  metrics: {
    clausesFavoringDocA: number;
    clausesFavoringDocB: number;
    criticalInconsistencies: number;
  };
  labelA?: string;
  labelB?: string;
}

export function FavorabilityVerdictCard({
  verdict,
  rationale,
  metrics,
  labelA = 'Document A',
  labelB = 'Document B',
}: FavorabilityVerdictCardProps) {
  const isDocA = verdict === 'docA';
  const isDocB = verdict === 'docB';
  const isNeutral = verdict === 'neutral';

  const verdictConfig = isDocA
    ? {
        label: `${labelA} has more favourable terms`,
        borderClass: 'border-amber-300 bg-amber-50 text-amber-900',
        haloClass: 'border-amber-200/80',
      }
    : isDocB
    ? {
        label: `${labelB} has more favourable terms`,
        borderClass: 'border-blue-300 bg-blue-50 text-blue-900',
        haloClass: 'border-blue-200/80',
      }
    : {
        label: 'Terms are substantially equivalent',
        borderClass: 'border-stone-300 bg-stone-100 text-stone-800',
        haloClass: 'border-stone-200/80',
      };

  return (
    <section
      id="verdict-section"
      className={cn(
        'relative rounded-2xl border bg-white p-6 sm:p-8 shadow-sm scroll-mt-36 mb-8 transition-all',
        verdictConfig.haloClass
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-stone-200/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDF2FA] border border-blue-200/60 flex items-center justify-center text-blue-700">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-stone-500">
                Mode 3 Synthesis
              </span>
              <h2 className="font-serif text-2xl text-stone-900">Overall Favorability Verdict</h2>
            </div>
          </div>

          {/* Verdict Pill */}
          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold tracking-wide shadow-sm',
              verdictConfig.borderClass
            )}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{verdictConfig.label}</span>
          </div>
        </div>

        {/* Plain-English Rationale */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            Strategic Evaluation Rationale
          </h4>
          <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
            {rationale}
          </p>
        </div>

        {/* Quantitative Metric Chips per D-16 */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs text-stone-700">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-bold text-amber-900 font-mono tabular-nums text-sm">
              {metrics.clausesFavoringDocA}
            </span>
            <span>clauses favour {labelA}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs text-stone-700">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-blue-900 font-mono tabular-nums text-sm">
              {metrics.clausesFavoringDocB}
            </span>
            <span>clauses favour {labelB}</span>
          </div>

          {metrics.criticalInconsistencies > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs text-red-700">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              <span className="font-bold font-mono tabular-nums text-sm">
                {metrics.criticalInconsistencies}
              </span>
              <span>critical inconsistencies</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

