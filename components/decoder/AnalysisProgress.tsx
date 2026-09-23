'use client';

import React, { useEffect, useState } from 'react';
import { FileSearch, ShieldAlert, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Deconstructing document structure & contracting parties...', icon: FileSearch, minSec: 0 },
  { id: 2, label: 'Evaluating clause risks & obligation asymmetry...', icon: ShieldAlert, minSec: 4 },
  { id: 3, label: 'Formulating actionable checklist & counsel prep guide...', icon: CheckCircle2, minSec: 8 },
];

export function AnalysisProgress() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStageIndex = elapsedSeconds < 4 ? 0 : elapsedSeconds < 8 ? 1 : 2;

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center space-y-6 max-w-xl mx-auto shadow-card-soft">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#EBF3EE] border border-[#D0E2D6] flex items-center justify-center text-[#264D34] animate-pulse">
          <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-serif text-xl font-medium text-stone-900 tracking-tight">
          Analyzing Legal Document
        </h3>
        <p className="text-xs text-stone-500 font-mono">
          {`Elapsed time: `}
          <span className="text-[#264D34] font-semibold">{`${elapsedSeconds}s`}</span>
          {` (typically completes in 10–15s)`}
        </p>
      </div>

      <div className="space-y-3 text-left pt-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs transition-all duration-300 ${
                isCurrent
                  ? 'border-[#D0E2D6] bg-[#EBF3EE] text-stone-900 font-medium shadow-sm'
                  : isDone
                  ? 'border-stone-200/80 bg-stone-50 text-stone-700'
                  : 'border-transparent text-stone-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isCurrent
                    ? 'bg-[#264D34] text-white font-bold'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <StageIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-500 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Zero-retention volatile processing in progress
      </div>
    </div>
  );
}

