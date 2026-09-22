'use client';

import React from 'react';
import { LawyerQuestion } from '@/lib/schemas/document';
import { HelpCircle, Copy, ArrowUpRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface LawyerPrepGuideProps {
  lawyerQuestions: LawyerQuestion[];
  onClauseCrossReference?: (clauseId: string) => void;
}

export function LawyerPrepGuide({
  lawyerQuestions,
  onClauseCrossReference,
}: LawyerPrepGuideProps) {
  const handleCopyQuestion = (questionText: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(questionText);
    }
    toast.success('Question copied to clipboard');
  };

  return (
    <section id="lawyer-prep-section" className="scroll-mt-28 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl font-semibold text-white tracking-wide">
            Lawyer Preparation Guide
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-leverage consultation inquiries grounded directly in verbatim agreement terms
        </p>
      </div>

      <div className="space-y-4">
        {lawyerQuestions.map((q, idx) => (
          <article
            key={q.id || idx}
            className="rounded-xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4 shadow-lg transition-all hover:border-slate-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 font-mono text-xs font-bold mt-0.5">
                  {`Q${idx + 1}`}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-sans text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                    {q.question}
                  </h3>
                  {q.relatedClauseId && (
                    <button
                      onClick={() => onClauseCrossReference?.(q.relatedClauseId!)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#D4AF37] hover:underline"
                    >
                      {`Re: ${q.relatedClauseId}`}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyQuestion(q.question)}
                className="h-8 text-xs font-mono border-slate-700 bg-slate-900 text-slate-300 hover:text-white shrink-0 self-end sm:self-auto"
              >
                <Copy className="w-3 h-3 mr-1.5" />
                Copy Question
              </Button>
            </div>

            {/* Strategic Rationale & Context */}
            <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-300">
                <Scale className="w-3 h-3 text-[#D4AF37]" />
                <span>Strategic Context</span>
              </div>
              <p className="leading-relaxed font-sans">{q.context}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
