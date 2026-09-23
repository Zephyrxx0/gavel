'use client';

import React from 'react';
import { Scale, AlertOctagon } from 'lucide-react';

export interface CounselTriggersCardProps {
  whenToCallLawyer: string[];
}

export function CounselTriggersCard({ whenToCallLawyer }: CounselTriggersCardProps) {
  if (!whenToCallLawyer || whenToCallLawyer.length === 0) {
    return null;
  }

  return (
    <section id="counsel-section" className="scroll-mt-28 space-y-4">
      <div className="pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] border border-[#F2D8CD] flex items-center justify-center text-[#7D432D] shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
              When to Consult Professional Counsel
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Specific escalation triggers where independent action is discouraged and licensed representation is recommended.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {whenToCallLawyer.map((trigger, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 text-stone-900 shadow-card-soft"
          >
            <div className="rounded-xl bg-white border border-amber-200 p-1.5 text-amber-700 shrink-0 mt-0.5 shadow-sm">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-800 font-semibold block">
                {`Escalation Trigger 0${idx + 1}`}
              </span>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-stone-700">
                {trigger}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
