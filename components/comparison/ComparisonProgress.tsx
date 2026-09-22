'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ArrowLeftRight, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComparisonProgressProps {
  isLargeDoc?: boolean;
}

const STAGES = [
  { id: 1, label: 'Ingesting Document A…', subtext: 'Normalizing contract provisions and parsing clauses' },
  { id: 2, label: 'Ingesting Document B…', subtext: 'Normalizing contract provisions and parsing clauses' },
  { id: 3, label: 'Comparing clause-by-clause…', subtext: 'Mapping category variances, favorability shifts & risk tiers' },
  { id: 4, label: 'Generating comparison report…', subtext: 'Synthesizing inconsistencies, metrics & actionable negotiation guide' },
];

export function ComparisonProgress({ isLargeDoc = false }: ComparisonProgressProps) {
  const [currentStage, setCurrentStage] = useState(1);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Stage progression timeline
    const t1 = setTimeout(() => setCurrentStage(2), 2500);
    const t2 = setTimeout(() => setCurrentStage(3), 5500);
    const t3 = setTimeout(() => setCurrentStage(4), 10500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[55vh] py-12 px-4 w-full">
      <div className="w-full max-w-xl p-8 rounded-2xl bg-[#111827] border border-[#1E293B] shadow-2xl backdrop-blur-md flex flex-col items-center text-center">
        {/* Animated Comparison Icon Halo */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0B0F17] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
            <ArrowLeftRight className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0B0F17]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>

        {/* Dynamic Stage Heading */}
        <h3 className="text-xl font-serif text-white mb-2 transition-all duration-300">
          {STAGES[currentStage - 1].label}
        </h3>
        <p className="text-xs text-slate-400 mb-6 max-w-md">
          {STAGES[currentStage - 1].subtext}
        </p>

        {/* Large Document Amber Notice per D-07 */}
        {isLargeDoc && (
          <div className="flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-amber-500/40 bg-amber-950/20 text-amber-400 text-xs font-medium animate-fade-in">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Large contract detected — analysing key risk sections via two-pass extraction</span>
          </div>
        )}

        {/* 4-Stage Stepper Dots */}
        <div className="grid grid-cols-4 gap-2.5 w-full max-w-md mb-6">
          {STAGES.map((s) => {
            const isDone = s.id < currentStage;
            const isCurrent = s.id === currentStage;
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'h-1.5 w-full rounded-full transition-all duration-500',
                    isDone
                      ? 'bg-[#D4AF37]'
                      : isCurrent
                      ? 'bg-[#D4AF37] animate-pulse'
                      : 'bg-[#1E293B]'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] uppercase font-mono tracking-wider',
                    isDone || isCurrent ? 'text-slate-300 font-semibold' : 'text-slate-600'
                  )}
                >
                  Step {s.id}
                </span>
              </div>
            );
          })}
        </div>

        {/* Elapsed Timer & Privacy Seal */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 border-t border-[#1E293B] pt-4 w-full">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{elapsedSeconds}s elapsed</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-retention ephemeral memory</span>
          </div>
        </div>
      </div>
    </div>
  );
}

