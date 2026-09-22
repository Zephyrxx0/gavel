'use client';

import React, { useState } from 'react';
import { RoadmapStep, RoadmapUrgency } from '@/lib/schemas/situation';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Milestone,
  Clock,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export interface NextStepsRoadmapProps {
  roadmap: RoadmapStep[];
}

interface TierConfig {
  key: RoadmapUrgency;
  title: string;
  badge: string;
  containerStyle: string;
  badgeStyle: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TIERS: TierConfig[] = [
  {
    key: 'immediate',
    title: 'Immediate Actions (Emergency / Evidence Preservation)',
    badge: 'Immediate',
    containerStyle: 'border-l-4 border-red-500/80 bg-red-950/20',
    badgeStyle: 'border-red-500/40 bg-red-950/40 text-red-300',
    icon: Clock,
  },
  {
    key: 'within-7-days',
    title: 'Actions Within 7 Days (Written Notices & Formal Demands)',
    badge: 'Within 7 Days',
    containerStyle: 'border-l-4 border-amber-500/70 bg-amber-950/15',
    badgeStyle: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    icon: Calendar,
  },
  {
    key: 'within-30-days',
    title: 'Actions Within 30 Days (Administrative & Statutory Filing)',
    badge: 'Within 30 Days',
    containerStyle: 'border-l-4 border-blue-500/60 bg-blue-950/15',
    badgeStyle: 'border-blue-500/40 bg-blue-950/40 text-blue-300',
    icon: CalendarClock,
  },
  {
    key: 'when-ready',
    title: 'Long-Term Escalation (Tribunals & Settlement)',
    badge: 'When Ready',
    containerStyle: 'border-l-4 border-emerald-500/50 bg-emerald-950/10',
    badgeStyle: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
    icon: CheckCircle2,
  },
];

export function NextStepsRoadmap({ roadmap }: NextStepsRoadmapProps) {
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCheckedMap((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!roadmap || roadmap.length === 0) {
    return null;
  }

  return (
    <section id="roadmap-section" className="scroll-mt-28 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Milestone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Next Steps Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Urgency-tiered procedural actions with feasibility indicators
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {TIERS.map((tier) => {
          const steps = roadmap
            .map((step, originalIdx) => ({ ...step, originalIdx }))
            .filter((step) => step.urgency === tier.key);

          if (steps.length === 0) return null;

          const TierIcon = tier.icon;

          return (
            <div
              key={tier.key}
              className={`rounded-xl border border-slate-800 ${tier.containerStyle} p-5 sm:p-6 space-y-4 shadow-lg`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <TierIcon className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="font-sans text-sm sm:text-base font-semibold text-slate-200">
                    {tier.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[11px] px-2.5 py-0.5 rounded-full border ${tier.badgeStyle}`}
                  >
                    {tier.badge}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                    {`${steps.length} ${steps.length === 1 ? 'step' : 'steps'}`}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {steps.map((item) => {
                  const isChecked = !!checkedMap[item.originalIdx];

                  return (
                    <div
                      key={item.originalIdx}
                      className={`flex items-start gap-3.5 p-3.5 rounded-lg border transition-all duration-200 ${
                        isChecked
                          ? 'border-slate-800/40 bg-slate-900/20 opacity-65'
                          : 'border-slate-800 bg-[#111827]/90'
                      }`}
                    >
                      <div className="pt-0.5">
                        <Checkbox
                          id={`step-${item.originalIdx}`}
                          checked={isChecked}
                          onCheckedChange={() => toggleStep(item.originalIdx)}
                        />
                      </div>

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label
                            htmlFor={`step-${item.originalIdx}`}
                            className={`font-sans text-sm font-semibold cursor-pointer ${
                              isChecked ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {item.step}
                          </label>

                          {item.doableWithoutLawyer ? (
                            <span className="border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              ✓ Doable Solo
                            </span>
                          ) : (
                            <span className="border-amber-500/40 bg-amber-950/40 text-amber-300 font-mono text-[11px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              ⚠ Counsel Recommended
                            </span>
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
            </div>
          );
        })}
      </div>
    </section>
  );
}
