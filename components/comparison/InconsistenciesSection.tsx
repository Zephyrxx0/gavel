'use client';

import React from 'react';
import { AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InconsistencyItem } from '@/lib/schemas/comparison';

export interface InconsistenciesSectionProps {
  inconsistencies: InconsistencyItem[];
}

export function InconsistenciesSection({ inconsistencies }: InconsistenciesSectionProps) {
  if (inconsistencies.length === 0) {
    return (
      <section
        id="inconsistencies-section"
        className="scroll-mt-28 mb-8 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif text-stone-900">No Inconsistencies Detected</h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Both documents appear internally consistent with no contradictory provisions or conflicting obligations.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const criticalItems = inconsistencies.filter((i) => i.severity === 'critical');
  const notableItems = inconsistencies.filter((i) => i.severity === 'notable');
  const minorItems = inconsistencies.filter((i) => i.severity === 'minor');

  const groups = [
    {
      title: 'Critical Inconsistencies',
      items: criticalItems,
      badgeClass: 'border-red-200 bg-red-50 text-red-700',
      borderClass: 'border-red-200 bg-red-50/30',
      icon: AlertOctagon,
    },
    {
      title: 'Notable Variations & Ambiguities',
      items: notableItems,
      badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
      borderClass: 'border-amber-200 bg-amber-50/30',
      icon: AlertTriangle,
    },
    {
      title: 'Minor Discrepancies & Clerical Differences',
      items: minorItems,
      badgeClass: 'border-stone-200 bg-stone-100 text-stone-700',
      borderClass: 'border-stone-200 bg-stone-50/50',
      icon: Info,
    },
  ];

  return (
    <section
      id="inconsistencies-section"
      className="scroll-mt-28 mb-8 rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-stone-500">
              Risk Audit
            </span>
            <h2 className="font-serif text-2xl text-stone-900">Discrepancies & Contradictions</h2>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-mono text-stone-700">
          {inconsistencies.length} issues flagged
        </span>
      </div>

      <div className="space-y-6">
        {groups.map((group) => {
          if (group.items.length === 0) return null;
          const GroupIcon = group.icon;

          return (
            <div key={group.title} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-2">
                <GroupIcon className="w-3.5 h-3.5" />
                <span>{group.title}</span>
                <span className="text-[11px] font-mono text-stone-400">({group.items.length})</span>
              </h4>

              <div className="space-y-2.5">
                {group.items.map((item, idx) => (
                  <div
                    key={`${item.clauseTitle}-${idx}`}
                    className={cn(
                      'rounded-xl border p-4 transition-colors',
                      group.borderClass
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <h5 className="text-sm font-semibold text-stone-900">{item.clauseTitle}</h5>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold border',
                          group.badgeClass
                        )}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

