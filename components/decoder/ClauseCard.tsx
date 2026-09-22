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
    ? 'border-l-4 border-red-500/80 bg-red-950/20 border-slate-800'
    : isCaution
    ? 'border-l-4 border-amber-500/60 bg-amber-950/15 border-slate-800'
    : 'border-l-4 border-emerald-500/50 bg-emerald-950/10 border-slate-800';

  const obligationBadgeStyle = {
    user: 'border-blue-500/30 bg-blue-950/30 text-blue-300',
    counterparty: 'border-indigo-500/30 bg-indigo-950/30 text-indigo-300',
    mutual: 'border-slate-500/40 bg-slate-800/40 text-slate-300',
    none: 'border-slate-700/40 bg-slate-900/40 text-slate-400',
  }[clause.obligation] || 'border-slate-700/40 bg-slate-900/40 text-slate-400';

  const obligationLabel = {
    user: 'Duty: User',
    counterparty: 'Duty: Counterparty',
    mutual: 'Duty: Mutual',
    none: 'Duty: General / None',
  }[clause.obligation] || 'Duty: General / None';

  return (
    <article
      id={`clause-${clause.id}`}
      className={`scroll-mt-28 rounded-xl border p-5 transition-all duration-300 shadow-md ${containerStyles}`}
    >
      <div className="space-y-3">
        {/* Header & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isHighRisk ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            ) : isCaution ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <h3 className="font-sans text-base sm:text-lg font-semibold text-slate-100">
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
        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          {clause.simplified}
        </p>

        {/* Objective Risk Rationale */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-3 text-xs text-slate-400">
          <span className="font-mono uppercase text-slate-300 mr-1.5 font-medium">
            Analysis Rationale:
          </span>
          {clause.riskReason}
        </div>

        {/* Verbatim Source Accordion */}
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultOpen ? 'verbatim' : undefined}
          className="w-full pt-1 border-t border-slate-800/60"
        >
          <AccordionItem value="verbatim" className="border-none">
            <AccordionTrigger className="text-xs font-mono text-[#D4AF37] hover:text-[#C5A059] py-2 hover:no-underline">
              Show verbatim source text
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap">
                {clause.originalText}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}
