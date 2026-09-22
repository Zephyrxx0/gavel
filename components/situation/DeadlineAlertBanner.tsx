'use client';

import React from 'react';
import { Clock, AlertTriangle, AlertCircle } from 'lucide-react';

export interface DeadlineAlertBannerProps {
  deadlineFlags: string[];
}

export function DeadlineAlertBanner({ deadlineFlags }: DeadlineAlertBannerProps) {
  if (!deadlineFlags || deadlineFlags.length === 0) {
    return null;
  }

  return (
    <section
      id="deadline-section"
      role="alert"
      className="scroll-mt-28 rounded-2xl border border-red-500/50 bg-red-950/25 p-6 shadow-xl space-y-4 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="flex items-center gap-2.5 text-red-400">
        <Clock className="w-5 h-5 animate-pulse text-red-400 shrink-0" />
        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
        <h3 className="font-serif text-lg font-semibold text-white tracking-wide">
          Critical Time-Sensitive Deadlines Detected
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
        Statutory limitation periods and notice windows are strictly enforced. Missing these deadlines may permanently extinguish your claims or defenses.
      </p>

      <div className="space-y-2 pt-1">
        {deadlineFlags.map((flag, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-red-500/30 bg-red-900/30 text-xs text-red-200 font-mono"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{flag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
