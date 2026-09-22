'use client';

import React, { useState } from 'react';
import { ArrowLeftRight, Filter, AlertCircle, ArrowUpRight, Minus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ClauseDiff } from '@/lib/schemas/comparison';
import { cn } from '@/lib/utils';

export interface ClauseComparisonTableProps {
  differences: ClauseDiff[];
  labelA?: string;
  labelB?: string;
}

export function ClauseComparisonTable({
  differences,
  labelA = 'Document A',
  labelB = 'Document B',
}: ClauseComparisonTableProps) {
  const [filter, setFilter] = useState<'all' | 'docA' | 'docB' | 'high'>('all');

  if (differences.length === 0) {
    return (
      <section
        id="differences-section"
        className="scroll-mt-28 mb-8 rounded-2xl border border-[#1E293B] bg-[#111827] p-8 text-center"
      >
        <p className="text-sm text-slate-400">No substantive clause differences identified.</p>
      </section>
    );
  }

  // Count metrics for filters
  const favorsDocACount = differences.filter((d) => d.favors === 'docA').length;
  const favorsDocBCount = differences.filter((d) => d.favors === 'docB').length;
  const highRiskCount = differences.filter((d) => d.riskRating === 'high').length;

  // Filter differences
  const filtered = differences.filter((d) => {
    if (filter === 'docA') return d.favors === 'docA';
    if (filter === 'docB') return d.favors === 'docB';
    if (filter === 'high') return d.riskRating === 'high';
    return true;
  });

  // Sort high risk first by default
  const riskRank = { high: 0, caution: 1, standard: 2 };
  const sorted = [...filtered].sort((a, b) => riskRank[a.riskRating] - riskRank[b.riskRating]);

  return (
    <section
      id="differences-section"
      className="scroll-mt-28 mb-8 rounded-2xl border border-[#1E293B] bg-[#111827] p-6 sm:p-8 shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-[#D4AF37]">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
              Clause Mapping
            </span>
            <h2 className="font-serif text-2xl text-white">Side-by-Side Clause Comparison</h2>
          </div>
        </div>

        {/* Filter Chips per D-07 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              filter === 'all'
                ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-[#1E293B] bg-[#0B0F17] text-slate-400 hover:text-white'
            )}
          >
            All [{differences.length}]
          </button>
          <button
            type="button"
            onClick={() => setFilter('docA')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              filter === 'docA'
                ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-[#1E293B] bg-[#0B0F17] text-slate-400 hover:text-white'
            )}
          >
            Favours {labelA} [{favorsDocACount}]
          </button>
          <button
            type="button"
            onClick={() => setFilter('docB')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              filter === 'docB'
                ? 'border-blue-500/60 bg-blue-950/20 text-blue-400'
                : 'border-[#1E293B] bg-[#0B0F17] text-slate-400 hover:text-white'
            )}
          >
            Favours {labelB} [{favorsDocBCount}]
          </button>
          <button
            type="button"
            onClick={() => setFilter('high')}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              filter === 'high'
                ? 'border-red-500/60 bg-red-950/20 text-red-400'
                : 'border-[#1E293B] bg-[#0B0F17] text-slate-400 hover:text-white'
            )}
          >
            🔴 High Risk [{highRiskCount}]
          </button>
        </div>
      </div>

      {/* Clause Rows */}
      <div className="space-y-4">
        {sorted.map((diff, index) => {
          const isHigh = diff.riskRating === 'high';
          const isCaution = diff.riskRating === 'caution';

          const riskBadgeClass = isHigh
            ? 'border-red-500/60 bg-red-950/30 text-red-400'
            : isCaution
            ? 'border-amber-500/60 bg-amber-950/30 text-amber-400'
            : 'border-emerald-500/60 bg-emerald-950/30 text-emerald-400';

          const favorsBadge =
            diff.favors === 'docA' ? (
              <span className="inline-flex items-center gap-1 text-[#D4AF37] font-semibold text-xs">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Favours {labelA}
              </span>
            ) : diff.favors === 'docB' ? (
              <span className="inline-flex items-center gap-1 text-blue-400 font-semibold text-xs">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Favours {labelB}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-xs">
                <Minus className="w-3.5 h-3.5" />
                Neutral
              </span>
            );

          return (
            <div
              key={`${diff.category}-${index}`}
              className={cn(
                'rounded-xl border bg-[#0B0F17] overflow-hidden transition-colors',
                isHigh
                  ? 'border-red-500/40 shadow-sm shadow-red-500/5'
                  : isCaution
                  ? 'border-amber-500/30'
                  : 'border-[#1E293B]'
              )}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 bg-[#111827]/80 border-b border-[#1E293B]">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-bold text-white tracking-wider">
                    {diff.category}
                  </span>
                  <span className="text-slate-600">•</span>
                  {favorsBadge}
                </div>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold border',
                    riskBadgeClass
                  )}
                >
                  {diff.riskRating} risk
                </span>
              </div>

              {/* Desktop Side-by-Side View */}
              <div className="hidden lg:grid lg:grid-cols-2 divide-x divide-[#1E293B]">
                <div className="p-4 bg-[#0B0F17]/70">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
                    {labelA}
                  </span>
                  <p className="font-mono text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {diff.textDocA}
                  </p>
                </div>
                <div className="p-4 bg-[#0B0F17]/70">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2">
                    {labelB}
                  </span>
                  <p className="font-mono text-xs sm:text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                    {diff.textDocB}
                  </p>
                </div>
              </div>

              {/* Mobile Tab-Switcher View per UI-SPEC */}
              <div className="block lg:hidden p-4">
                <Tabs defaultValue="docA" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3 bg-[#111827] border border-[#1E293B]">
                    <TabsTrigger value="docA" className="text-xs">
                      {labelA}
                    </TabsTrigger>
                    <TabsTrigger value="docB" className="text-xs">
                      {labelB}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="docA" className="mt-0">
                    <p className="font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                      {diff.textDocA}
                    </p>
                  </TabsContent>
                  <TabsContent value="docB" className="mt-0">
                    <p className="font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
                      {diff.textDocB}
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Notes Footer */}
              <div className="px-4 py-2.5 bg-[#111827]/40 border-t border-[#1E293B]/80 text-xs text-slate-400 flex items-start gap-2">
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] shrink-0 mt-0.5">
                  Analysis:
                </span>
                <p className="font-sans leading-relaxed">{diff.notes}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

