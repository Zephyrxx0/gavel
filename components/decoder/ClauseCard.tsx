'use client';

import React from 'react';
import { Clause } from '@/lib/schemas/document';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export interface ClauseCardProps {
  clause: Clause;
  defaultOpen?: boolean;
}

export function ClauseCard({ clause, defaultOpen = false }: ClauseCardProps) {
  const isHighRisk = clause.risk === 'high';
  const isCaution = clause.risk === 'caution';

  const riskBadgeVariant = isHighRisk ? 'high' : isCaution ? 'caution' : 'standard';
  const riskLabel = isHighRisk ? 'High Risk' : isCaution ? 'Caution' : 'Standard';

  const containerStyles = isHighRisk
    ? 'border-l-4 border-red-500/80 bg-red-950/20 bg-white border border-stone-200/90 shadow-card-soft'
    : isCaution
    ? 'border-l-4 border-amber-500/60 bg-white border border-stone-200/90 shadow-card-soft'
    : 'border-l-4 border-emerald-500/50 bg-white border border-stone-200/90 shadow-card-soft';

  const obligationBadgeStyle = {
    user: 'border-sky-200 bg-sky-50 text-sky-800',
    counterparty: 'border-purple-200 bg-purple-50 text-purple-800',
    mutual: 'border-stone-200 bg-stone-100 text-stone-700',
    none: 'border-stone-200 bg-stone-50 text-stone-500',
  }[clause.obligation] || 'border-stone-200 bg-stone-50 text-stone-500';

  const obligationLabel = {
    user: 'Duty: User',
    counterparty: 'Duty: Counterparty',
    mutual: 'Duty: Mutual',
    none: 'Duty: General / None',
  }[clause.obligation] || 'Duty: General / None';

  return (
    <article
      id={`clause-${clause.id}`}
      className={`scroll-mt-28 rounded-2xl p-5 sm:p-6 transition-all duration-300 ${containerStyles}`}
    >
      <div className="space-y-3.5">
        {/* Header & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {isHighRisk ? (
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            ) : isCaution ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <h3 className="font-sans text-base sm:text-lg font-semibold text-stone-900">
              {clause.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${obligationBadgeStyle}`}
            >
              {obligationLabel}
            </span>
            <Badge variant={riskBadgeVariant} className="text-xs">
              {riskLabel}
            </Badge>
          </div>
        </div>

        {/* Simplified Plain-English Explanation */}
        <p className="text-sm text-stone-700 font-sans leading-relaxed">
          {clause.simplified}
        </p>

        {/* Objective Risk Rationale */}
        <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-3.5 text-xs text-stone-600">
          <span className="font-mono uppercase text-stone-900 mr-2 font-medium">
            Analysis Rationale:
          </span>
          {clause.riskReason}
        </div>

        {/* Verbatim Source Accordion */}
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen ? 'verbatim' : undefined}
          className="w-full pt-1 border-t border-stone-100"
        >
          <AccordionItem value="verbatim" className="border-none">
            <AccordionTrigger className="text-xs font-mono text-stone-600 hover:text-stone-900 py-2 hover:no-underline">
              Show verbatim source text
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/80 max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed text-stone-700 whitespace-pre-wrap">
                {clause.originalText}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}
