import React from 'react';
import { FileText, Users, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ExecutiveSummaryCardProps {
  documentType: string;
  parties: string[];
  summary: string;
}

export function ExecutiveSummaryCard({
  documentType,
  parties,
  summary,
}: ExecutiveSummaryCardProps) {
  return (
    <section
      id="summary-section"
      className="scroll-mt-36 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-card-soft"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-stone-100">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#EBF3EE] border border-[#D0E2D6] flex items-center justify-center text-[#264D34]">
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
              Executive Brief
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              Plain-English analysis and contracting overview
            </p>
          </div>
        </div>

        <Badge variant="gold" className="self-start sm:self-center font-mono text-xs px-3.5 py-1">
          {documentType || 'Legal Document'}
        </Badge>
      </div>

      {/* Signatory Entities / Contracting Parties */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500">
          <Users className="w-3.5 h-3.5 text-stone-600" />
          <span>Contracting Parties</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {parties && parties.length > 0 ? (
            parties.map((party, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-mono text-stone-800"
              >
                {party}
              </span>
            ))
          ) : (
            <span className="text-xs text-stone-400 italic font-mono">
              Signatory entities not explicitly declared in source text
            </span>
          )}
        </div>
      </div>

      {/* Summary Body */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500">
          <FileText className="w-3.5 h-3.5 text-stone-600" />
          <span>Executive Summary</span>
        </div>
        <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
          {summary}
        </p>
      </div>
    </section>
  );
}

