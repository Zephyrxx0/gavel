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
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
              When to Consult Professional Counsel
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Specific escalation triggers where independent action is discouraged and licensed representation is recommended.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {whenToCallLawyer.map((trigger, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-950/15 text-slate-200 shadow-sm"
          >
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-1.5 text-amber-400 shrink-0 mt-0.5">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-300 font-semibold block">
                {`Escalation Trigger 0${idx + 1}`}
              </span>
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                {trigger}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
