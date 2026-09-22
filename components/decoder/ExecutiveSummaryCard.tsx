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
      className="scroll-mt-28 rounded-2xl border border-[#D4AF37]/30 bg-[#111827] p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Executive Brief
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Plain-English analysis and contracting overview
            </p>
          </div>
        </div>

        <Badge variant="gold" className="self-start sm:self-center font-mono text-xs px-3 py-1">
          {documentType || 'Legal Document'}
        </Badge>
      </div>

      {/* Signatory Entities / Contracting Parties */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Contracting Parties</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {parties && parties.length > 0 ? (
            parties.map((party, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg border border-slate-700/60 bg-slate-900/60 px-2.5 py-1 text-xs font-mono text-slate-200"
              >
                {party}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic font-mono">
              Signatory entities not explicitly declared in source text
            </span>
          )}
        </div>
      </div>

      {/* Summary Body */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Executive Summary</span>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          {summary}
        </p>
      </div>
    </section>
  );
}
