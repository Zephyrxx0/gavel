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
    <section id="rights-section" className="scroll-mt-36 space-y-4">
      <div className="pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#FAF0EB] border border-[#F2D8CD] flex items-center justify-center text-[#7D432D] shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
              Your Statutory Rights
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
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
            className="rounded-2xl border border-stone-200/90 bg-white px-5 py-1 shadow-card-soft data-[state=open]:border-stone-400 transition-colors"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-left w-full pr-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#FAF0EB] border border-[#F2D8CD] flex items-center justify-center text-[#7D432D] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-sans text-sm sm:text-base font-semibold text-stone-900">
                    {right.title}
                  </span>
                </div>

                <span className="inline-flex items-center font-mono text-[11px] text-stone-700 bg-stone-50 border border-stone-200 px-2.5 py-0.5 rounded-full self-start sm:self-center shrink-0">
                  {right.statuteReference}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-2 pb-4 text-stone-700 font-sans leading-relaxed border-t border-stone-100">
              <p className="text-sm">{right.explanation}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
