'use client';

import React, { useState } from 'react';
import { DocumentEvidence } from '@/lib/schemas/situation';
import { Checkbox } from '@/components/ui/checkbox';
import { FolderCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export interface EvidenceChecklistProps {
  documentsToGather: DocumentEvidence[];
}

export function EvidenceChecklist({ documentsToGather }: EvidenceChecklistProps) {
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

  const toggleItem = (idx: number) => {
    setCheckedMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const totalCount = documentsToGather?.length || 0;
  const checkedCount = Object.values(checkedMap).filter(Boolean).length;
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  if (!documentsToGather || documentsToGather.length === 0) {
    return (
      <section id="evidence-section" className="scroll-mt-28 space-y-4">
        <div className="pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
                Documents to Gather
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Critical records and communications required to substantiate your dispute
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 text-center text-slate-400 font-sans text-sm space-y-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
          <p>No mandatory evidentiary documents identified for this dispute.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="evidence-section" className="scroll-mt-28 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] border border-[#F2D8CD] flex items-center justify-center text-[#7D432D] shrink-0">
            <FolderCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
              Documents to Gather
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Critical records and communications required to substantiate your dispute
            </p>
          </div>
        </div>

        {/* Progress Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-center font-mono text-xs text-stone-700 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full shadow-sm">
          <span>{`Collected ${checkedCount} of ${totalCount} evidentiary items (${percentage}%)`}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden border border-stone-200">
          <div
            className="h-full bg-stone-900 transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {documentsToGather.map((item, idx) => {
          const isChecked = !!checkedMap[idx];

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                isChecked
                  ? 'border-stone-200 bg-stone-50/40 opacity-60'
                  : 'border-stone-200/90 bg-white hover:border-stone-400 shadow-card-soft'
              }`}
            >
              <div className="pt-0.5">
                <Checkbox
                  id={`evidence-${idx}`}
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(idx)}
                />
              </div>

              <div className="flex-1 space-y-1.5 min-w-0">
                <label
                  htmlFor={`evidence-${idx}`}
                  className={`font-sans text-sm font-semibold cursor-pointer block leading-snug ${
                    isChecked ? 'line-through text-stone-400' : 'text-stone-900'
                  }`}
                >
                  {item.document}
                </label>

                <div className="rounded-xl bg-stone-50 p-2.5 border border-stone-200/80 text-xs text-stone-600 space-y-0.5">
                  <div className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#7D432D]">
                    <Sparkles className="w-3 h-3" />
                    <span>Why This Matters</span>
                  </div>
                  <p className="leading-relaxed font-sans text-stone-700">{item.why}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
