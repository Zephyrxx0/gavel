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
        borderClass: 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]',
        haloClass: 'border-[#D4AF37]/30 shadow-[#D4AF37]/5',
      }
    : isDocB
    ? {
        label: `${labelB} has more favourable terms`,
        borderClass: 'border-blue-500/60 bg-blue-950/30 text-blue-400',
        haloClass: 'border-blue-500/30 shadow-blue-500/5',
      }
    : {
        label: 'Terms are substantially equivalent',
        borderClass: 'border-slate-500/60 bg-slate-800/40 text-slate-300',
        haloClass: 'border-slate-700/40',
      };

  return (
    <section
      id="verdict-section"
      className={cn(
        'relative rounded-2xl border bg-[#111827] p-6 sm:p-8 shadow-xl backdrop-blur-sm scroll-mt-28 mb-8 transition-all',
        verdictConfig.haloClass
      )}
    >
      <div className="flex flex-col gap-6">
        {/* Section Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#1E293B] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-[#D4AF37]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
                Mode 3 Synthesis
              </span>
              <h2 className="font-serif text-2xl text-white">Overall Favorability Verdict</h2>
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
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Strategic Evaluation Rationale
          </h4>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
            {rationale}
          </p>
        </div>

        {/* Quantitative Metric Chips per D-16 */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1E293B] bg-[#0B0F17] px-3.5 py-1.5 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="font-bold text-[#D4AF37] font-mono tabular-nums text-sm">
              {metrics.clausesFavoringDocA}
            </span>
            <span>clauses favour {labelA}</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#1E293B] bg-[#0B0F17] px-3.5 py-1.5 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="font-bold text-blue-400 font-mono tabular-nums text-sm">
              {metrics.clausesFavoringDocB}
            </span>
            <span>clauses favour {labelB}</span>
          </div>

          {metrics.criticalInconsistencies > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/20 px-3.5 py-1.5 text-xs text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
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
