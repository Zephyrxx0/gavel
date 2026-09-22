'use client';

import React from 'react';
import { StatutoryRight } from '@/lib/schemas/situation';
import { ShieldCheck, Scale, Shield } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export interface RightsAccordionProps {
  rights: StatutoryRight[];
}

export function RightsAccordion({ rights }: RightsAccordionProps) {
  if (!rights || rights.length === 0) {
    return null;
  }

  return (
    <section id="rights-section" className="scroll-mt-28 space-y-4">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Your Statutory Rights
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Identified legal protections and statutory codes applicable to your dispute
            </p>
          </div>
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue="right-0"
        className="w-full space-y-3"
      >
        {rights.map((right, idx) => (
          <AccordionItem
            key={idx}
            value={`right-${idx}`}
            className="rounded-xl border border-slate-800 bg-[#111827] px-5 py-1 shadow-md data-[state=open]:border-[#D4AF37]/40 transition-colors"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-left w-full pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-sans text-sm sm:text-base font-semibold text-slate-100">
                    {right.title}
                  </span>
                </div>

                <span className="inline-flex items-center font-mono text-[11px] text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded self-start sm:self-center shrink-0">
                  {right.statuteReference}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-2 pb-4 text-slate-300 font-sans leading-relaxed border-t border-slate-800/60">
              <p className="text-sm">{right.explanation}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
