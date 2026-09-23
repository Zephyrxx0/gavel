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
      <div className="pb-4 border-b border-stone-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EBF3EE] border border-[#D0E2D6] flex items-center justify-center text-[#264D34]">
            <HelpCircle className="w-4 h-4 text-[#264D34]" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
            Lawyer Preparation Guide
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          High-leverage consultation inquiries grounded directly in verbatim agreement terms
        </p>
      </div>

      <div className="space-y-4">
        {lawyerQuestions.map((q, idx) => (
          <article
            key={q.id || idx}
            className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 space-y-4 shadow-card-soft transition-all hover:border-stone-400"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#EBF3EE] border border-[#D0E2D6] flex items-center justify-center text-[#264D34] shrink-0 font-mono text-xs font-bold mt-0.5">
                  {`Q${idx + 1}`}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-sans text-sm sm:text-base font-semibold text-stone-900 leading-snug">
                    {q.question}
                  </h3>
                  {(q.relatedClauseId || (q as unknown as { clauseReference?: string }).clauseReference) && (
                    <button
                      type="button"
                      onClick={() => onClauseCrossReference?.((q.relatedClauseId || (q as unknown as { clauseReference?: string }).clauseReference)!)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-stone-600 hover:text-stone-900 underline underline-offset-2"
                    >
                      {`Re: ${q.relatedClauseId || (q as unknown as { clauseReference?: string }).clauseReference}`}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyQuestion(q.question)}
                className="h-8 text-xs font-mono border-stone-200 bg-white text-stone-700 hover:bg-stone-50 shrink-0 self-end sm:self-auto shadow-sm"
              >
                <Copy className="w-3 h-3 mr-1.5" />
                Copy Question
              </Button>
            </div>

            {/* Strategic Rationale & Context */}
            <div className="rounded-xl bg-stone-50 p-3.5 border border-stone-200/80 text-xs text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-stone-800">
                <Scale className="w-3 h-3 text-stone-600" />
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
