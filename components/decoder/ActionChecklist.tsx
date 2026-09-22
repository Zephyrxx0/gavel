'use client';

import React, { useState } from 'react';
import { ActionItem } from '@/lib/schemas/document';
import { CheckSquare, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface ActionChecklistProps {
  checklist: ActionItem[];
  onClauseCrossReference?: (clauseId: string) => void;
}

export function ActionChecklist({ checklist, onClauseCrossReference }: ActionChecklistProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const timingGroups = [
    { key: 'immediate', title: 'Immediate Operational Priorities', badge: 'Immediate' },
    { key: 'before_signing', title: 'Action Required Before Signing', badge: 'Before Signing' },
    { key: 'after_signing', title: 'Post-Execution Compliance & Monitoring', badge: 'After Signing' },
  ];

  const getActionBadgeClass = (type: string) => {
    switch (type) {
      case 'negotiate':
        return 'border-purple-500/40 bg-purple-950/30 text-purple-300';
      case 'verify':
        return 'border-amber-500/40 bg-amber-950/30 text-amber-300';
      case 'refuse':
        return 'border-red-500/40 bg-red-950/30 text-red-300';
      case 'accept':
        return 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300';
      default:
        return 'border-slate-700 bg-slate-800 text-slate-300';
    }
  };

  return (
    <section id="checklist-section" className="scroll-mt-28 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl font-semibold text-white tracking-wide">
            Actionable Checklist
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Chronologically ordered recommendations with interactive execution tracking
        </p>
      </div>

      <div className="space-y-6">
        {timingGroups.map((group) => {
          const items = checklist.filter((item) => item.timing === group.key);

          return (
            <div
              key={group.key}
              className="rounded-xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <h3 className="font-sans text-base font-semibold text-slate-200">
                  {group.title}
                </h3>
                <span className="font-mono text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                  {`${items.length} items`}
                </span>
              </div>

              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => {
                    const isChecked = !!checkedMap[item.id];

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3.5 p-3 rounded-lg border transition-all ${
                          isChecked
                            ? 'border-slate-800/40 bg-slate-900/20 opacity-60'
                            : 'border-slate-800 bg-slate-900/60'
                        }`}
                      >
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleItem(item.id)}
                            id={`check-${item.id}`}
                          />
                        </div>

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-mono capitalize ${getActionBadgeClass(
                                item.actionType
                              )}`}
                            >
                              {item.actionType}
                            </span>

                            {item.relatedClauseId && (
                              <button
                                onClick={() => onClauseCrossReference?.(item.relatedClauseId!)}
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#D4AF37] hover:underline"
                              >
                                {`Re: ${item.relatedClauseId}`}
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <p
                            className={`text-xs sm:text-sm font-sans leading-relaxed ${
                              isChecked ? 'line-through text-slate-500' : 'text-slate-300'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-sans flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  {`No ${group.badge.toLowerCase()} action items identified`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
