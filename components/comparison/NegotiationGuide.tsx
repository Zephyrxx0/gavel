'use client';

import React, { useState } from 'react';
import { XCircle, CheckCircle2, Scale, Copy, Check, Sparkles } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { NegotiationGuide as NegotiationGuideType, NegotiationCard } from '@/lib/schemas/comparison';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface NegotiationGuideProps {
  negotiationGuide: NegotiationGuideType;
  labelA?: string;
  labelB?: string;
}

export function NegotiationGuide({
  negotiationGuide,
  labelA = 'Document A',
  labelB = 'Document B',
}: NegotiationGuideProps) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success('Copied talking point to clipboard');
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const buckets = [
    {
      id: 'pushBack',
      title: 'Push Back On',
      items: negotiationGuide.pushBack,
      icon: XCircle,
      headerClass: 'text-red-400 border-red-500/30 bg-red-950/20',
      emptyText: 'No terms in this category.',
    },
    {
      id: 'acceptAsIs',
      title: 'Accept As-Is',
      items: negotiationGuide.acceptAsIs,
      icon: CheckCircle2,
      headerClass: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
      emptyText: 'No terms in this category.',
    },
    {
      id: 'flagForLawyer',
      title: 'Flag for Lawyer',
      items: negotiationGuide.flagForLawyer,
      icon: Scale,
      headerClass: 'text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10',
      emptyText: 'No terms in this category.',
    },
  ];

  return (
    <section
      id="negotiation-section"
      className="scroll-mt-28 mb-8 rounded-2xl border border-[#1E293B] bg-[#111827] p-6 sm:p-8 shadow-xl backdrop-blur-sm"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0B0F17] border border-[#1E293B] flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-slate-400">
              Strategy & Leverage
            </span>
            <h2 className="font-serif text-2xl text-white">Actionable Negotiation Guide</h2>
          </div>
        </div>
      </div>

      {/* 3-Bucket Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {buckets.map((bucket) => {
          const BucketIcon = bucket.icon;
          return (
            <div
              key={bucket.id}
              className="rounded-xl border border-[#1E293B] bg-[#0B0F17]/80 p-4 flex flex-col"
            >
              {/* Bucket Header */}
              <div
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg border mb-3',
                  bucket.headerClass
                )}
              >
                <div className="flex items-center gap-2">
                  <BucketIcon className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">{bucket.title}</h4>
                </div>
                <span className="text-xs font-mono font-bold">[{bucket.items.length}]</span>
              </div>

              {/* Bucket Content */}
              <div className="space-y-3 flex-1">
                {bucket.items.length === 0 ? (
                  <p className="text-xs text-slate-500 font-mono italic text-center py-6">
                    {bucket.emptyText}
                  </p>
                ) : (
                  bucket.items.map((card, idx) => {
                    const cardKey = `${bucket.id}-${idx}`;
                    const isChecked = Boolean(checkedItems[cardKey]);
                    const isCopied = copiedKey === cardKey;

                    return (
                      <div
                        key={cardKey}
                        className={cn(
                          'p-3.5 rounded-lg border border-[#1E293B] bg-[#111827] transition-all duration-200',
                          isChecked ? 'opacity-40 line-through' : 'hover:border-slate-700'
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <Checkbox
                            id={cardKey}
                            checked={isChecked}
                            onCheckedChange={() => toggleCheck(cardKey)}
                            className="mt-1 border-slate-600 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:text-[#0B0F17]"
                          />
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={cardKey}
                              className="text-xs font-semibold text-white cursor-pointer block"
                            >
                              {card.clauseTitle}
                            </label>
                            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed font-sans">
                              {card.rationale}
                            </p>

                            {card.suggestedAlternative && (
                              <div className="mt-2.5 pl-2.5 border-l-2 border-[#D4AF37]/50 text-xs text-slate-400 font-mono italic">
                                <span className="text-[10px] uppercase font-bold text-[#D4AF37] block not-italic mb-0.5">
                                  Counter-Proposal Draft:
                                </span>
                                &ldquo;{card.suggestedAlternative}&rdquo;
                              </div>
                            )}

                            {/* Copy Action */}
                            <div className="mt-3 flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => handleCopy(cardKey, card.rationale)}
                                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-[#D4AF37] transition-colors py-0.5 px-1.5 rounded bg-[#0B0F17] border border-[#1E293B]"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy Talking Point</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Strategic Synthesis Footer */}
      {negotiationGuide.recommendation && (
        <div className="mt-6 p-4 rounded-xl border border-[#1E293B] bg-[#0B0F17]/90">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] block mb-1.5 font-mono">
            Overall Strategic Synthesis
          </span>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {negotiationGuide.recommendation}
          </p>
        </div>
      )}
    </section>
  );
}

