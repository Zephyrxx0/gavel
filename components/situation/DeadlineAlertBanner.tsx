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
      className="scroll-mt-36 rounded-2xl border border-rose-200 bg-rose-50/70 p-6 shadow-card-soft space-y-4 animate-in fade-in duration-300"
    >
      <div className="flex items-center gap-2.5 text-rose-700">
        <Clock className="w-5 h-5 text-rose-600 shrink-0" />
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
        <h3 className="font-serif text-lg font-semibold text-rose-950 tracking-tight">
          Critical Time-Sensitive Deadlines Detected
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-rose-900/80 font-sans leading-relaxed">
        Statutory limitation periods and notice windows are strictly enforced. Missing these deadlines may permanently extinguish your claims or defenses.
      </p>

      <div className="space-y-2 pt-1">
        {deadlineFlags.map((flag, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-white text-xs text-rose-950 font-mono shadow-sm"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{flag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
