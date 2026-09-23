'use client';

import React, { useEffect, useState } from 'react';
import {
  FileSearch,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export interface ProgressStage {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  minSec: number;
}

export const SITUATION_PROGRESS_STAGES: ProgressStage[] = [
  {
    id: 1,
    label: 'Classifying dispute domain & context...',
    icon: FileSearch,
    minSec: 0,
  },
  {
    id: 2,
    label: 'Evaluating statutory protections & rights...',
    icon: ShieldAlert,
    minSec: 4,
  },
  {
    id: 3,
    label: 'Mapping urgency roadmap, evidence checklist & deadline warnings...',
    icon: CheckCircle2,
    minSec: 8,
  },
];

export interface SituationProgressProps {
  initialSeconds?: number;
}

export function SituationProgress({ initialSeconds = 0 }: SituationProgressProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStageIndex =
    elapsedSeconds < 4 ? 0 : elapsedSeconds < 8 ? 1 : 2;

  return (
    <div
      data-testid="situation-progress"
      className="rounded-2xl border border-stone-200/90 bg-white p-8 text-center space-y-6 max-w-xl mx-auto shadow-card-soft"
    >
      {/* Pulsing Clock Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#FAF0EB] border border-[#F2D8CD] flex items-center justify-center text-[#7D432D] animate-pulse">
          <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      {/* Header & Elapsed Timer */}
      <div className="space-y-2">
        <h3 className="font-serif text-xl font-medium text-stone-900 tracking-tight">
          Evaluating Legal Dispute
        </h3>
        <p className="text-xs text-stone-500 font-mono" data-testid="elapsed-timer">
          {`Elapsed time: `}
          <span className="text-[#7D432D] font-semibold">{`${elapsedSeconds}s`}</span>
          {` (typically completes in 10–15s)`}
        </p>
      </div>

      {/* Milestone Stages */}
      <div className="space-y-3 text-left pt-2" role="status" aria-live="polite">
        {SITUATION_PROGRESS_STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.id}
              data-testid={`progress-stage-${stage.id}`}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-xs font-mono transition-all duration-300 ${
                isCurrent
                  ? 'border-[#D4AF37]/50 bg-[#D4AF37]/10 text-white font-medium shadow-sm'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                  : 'border-slate-800/80 bg-slate-900/40 text-slate-500'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" />
                ) : (
                  <StageIcon className="w-4 h-4 text-stone-400" />
                )}
              </div>
              <span className="leading-snug text-stone-900">{stage.label}</span>
            </div>
          );
        })}
      </div>

      {/* Privacy Guarantee Badge */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] font-mono text-emerald-700">
        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>Zero-retention volatile processing in progress</span>
      </div>
    </div>
  );
}
