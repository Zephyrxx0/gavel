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
        className="scroll-mt-36 mb-8 rounded-2xl border border-[#1E293B] bg-[#111827] p-8 text-center"
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
      className="scroll-mt-36 mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDF2FA] border border-blue-200/60 flex items-center justify-center text-blue-700">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-stone-500">
              Clause Mapping
            </span>
            <h2 className="font-serif text-2xl text-stone-900">Side-by-Side Clause Comparison</h2>
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
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-stone-50 text-stone-600 hover:text-stone-900'
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
                ? 'border-amber-300 bg-amber-50 text-amber-900 font-semibold'
                : 'border-stone-200 bg-stone-50 text-stone-600 hover:text-stone-900'
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
                ? 'border-blue-300 bg-blue-50 text-blue-900 font-semibold'
                : 'border-stone-200 bg-stone-50 text-stone-600 hover:text-stone-900'
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
                ? 'border-red-300 bg-red-50 text-red-900 font-semibold'
                : 'border-stone-200 bg-stone-50 text-stone-600 hover:text-stone-900'
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
            ? 'border-red-200 bg-red-50 text-red-700'
            : isCaution
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800';

          const favorsBadge =
            diff.favors === 'docA' ? (
              <span className="inline-flex items-center gap-1 text-amber-800 font-semibold text-xs">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Favours {labelA}
              </span>
            ) : diff.favors === 'docB' ? (
              <span className="inline-flex items-center gap-1 text-blue-700 font-semibold text-xs">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Favours {labelB}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-stone-500 font-medium text-xs">
                <Minus className="w-3.5 h-3.5" />
                Neutral
              </span>
            );

          return (
            <div
              key={`${diff.category}-${index}`}
              className={cn(
                'rounded-2xl border bg-white overflow-hidden transition-colors',
                isHigh
                  ? 'border-red-200'
                  : isCaution
                  ? 'border-amber-200'
                  : 'border-stone-200/80'
              )}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-3 bg-stone-50/80 border-b border-stone-200/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-mono font-bold text-stone-900 tracking-wider">
                    {diff.category}
                  </span>
                  <span className="text-stone-400">•</span>
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
              <div className="hidden lg:grid lg:grid-cols-2 divide-x divide-stone-200/80">
                <div className="p-4 bg-white">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block mb-2">
                    {labelA}
                  </span>
                  <p className="font-mono text-xs sm:text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
                    {diff.textDocA}
                  </p>
                </div>
                <div className="p-4 bg-white">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 block mb-2">
                    {labelB}
                  </span>
                  <p className="font-mono text-xs sm:text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
                    {diff.textDocB}
                  </p>
                </div>
              </div>

              {/* Mobile Tab-Switcher View per UI-SPEC */}
              <div className="block lg:hidden p-4">
                <Tabs defaultValue="docA" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-3 bg-stone-100 border border-stone-200/70 p-1 rounded-xl">
                    <TabsTrigger value="docA" className="text-xs rounded-lg text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900">
                      {labelA}
                    </TabsTrigger>
                    <TabsTrigger value="docB" className="text-xs rounded-lg text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900">
                      {labelB}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="docA" className="mt-0">
                    <p className="font-mono text-xs leading-relaxed text-stone-800 whitespace-pre-wrap">
                      {diff.textDocA}
                    </p>
                  </TabsContent>
                  <TabsContent value="docB" className="mt-0">
                    <p className="font-mono text-xs leading-relaxed text-stone-800 whitespace-pre-wrap">
                      {diff.textDocB}
                    </p>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Notes Footer */}
              <div className="px-4 py-2.5 bg-stone-50/60 border-t border-stone-200/60 text-xs text-stone-600 flex items-start gap-2">
                <span className="font-semibold text-stone-700 uppercase tracking-wider text-[10px] shrink-0 mt-0.5">
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

