'use client';

import React, { useState } from 'react';
import {
  XCircle,
  CheckCircle2,
  Scale,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { NegotiationGuide as NegotiationGuideType } from '@/lib/schemas/comparison';
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

  // Default to pushBack if it has items, otherwise whichever tab has items
  const defaultTab =
    negotiationGuide.pushBack.length > 0
      ? 'pushBack'
      : negotiationGuide.flagForLawyer.length > 0
        ? 'flagForLawyer'
        : 'acceptAsIs';

  const [activeTab, setActiveTab] = useState(defaultTab);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (key: string, text: string, label: string = 'Talking point') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`Copied ${label.toLowerCase()} to clipboard`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const tabsConfig = [
    {
      id: 'pushBack',
      title: 'Push Back On',
      shortTitle: 'Push Back',
      items: negotiationGuide.pushBack,
      icon: XCircle,
      badgeColor: 'border-rose-200 text-rose-800 bg-rose-50',
      activeColor: 'data-[state=active]:bg-white data-[state=active]:text-rose-900 data-[state=active]:border-rose-200',
      description: `Terms in ${labelB} that introduce heightened liability, unreciprocated obligations, or unfavorable commercial shifts. Push back on these items during negotiations.`,
      emptyTitle: 'No Terms Flagged for Push Back',
      emptyText: `No severe adverse changes or one-sided terms were identified in ${labelB}.`,
      counterLabel: 'Counter-Proposal Draft',
    },
    {
      id: 'acceptAsIs',
      title: 'Accept As-Is',
      shortTitle: 'Accept',
      items: negotiationGuide.acceptAsIs,
      icon: CheckCircle2,
      badgeColor: 'border-emerald-200 text-emerald-800 bg-emerald-50',
      activeColor: 'data-[state=active]:bg-white data-[state=active]:text-emerald-900 data-[state=active]:border-emerald-200',
      description: `Terms in ${labelB} that are balanced, beneficial, or aligned with prevailing market standards. Concede on these points to preserve negotiation goodwill.`,
      emptyTitle: 'No Automatic Concessions',
      emptyText: `All revised provisions in ${labelB} require either push-back or legal evaluation.`,
      counterLabel: 'Proposed Language',
    },
    {
      id: 'flagForLawyer',
      title: 'Flag for Lawyer',
      shortTitle: 'Flag for Counsel',
      items: negotiationGuide.flagForLawyer,
      icon: Scale,
      badgeColor: 'border-amber-200 text-amber-800 bg-amber-50',
      activeColor: 'data-[state=active]:bg-white data-[state=active]:text-amber-900 data-[state=active]:border-amber-200',
      description: `Statutory, jurisdictional, or legally ambiguous provisions in ${labelB} that require formal legal advice before signing.`,
      emptyTitle: 'No Mandatory Counsel Triggers',
      emptyText: 'No clauses in this comparison appear to require immediate outside attorney intervention.',
      counterLabel: 'Recommended Counsel Review Topic',
    },
  ];

  return (
    <section
      id="negotiation-section"
      className="scroll-mt-36 mb-8 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-card-soft space-y-6"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDF2FA] border border-blue-200/60 flex items-center justify-center text-blue-700 shrink-0">
            <Sparkles className="w-5 h-5 stroke-[1.8]" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider font-mono text-stone-500 font-medium">
              Strategy &amp; Leverage
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 tracking-tight">
              Actionable Negotiation Guide
            </h2>
          </div>
        </div>

        {/* Counter Summary Pills */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-stone-500 font-mono">
            {negotiationGuide.pushBack.length +
              negotiationGuide.acceptAsIs.length +
              negotiationGuide.flagForLawyer.length}{' '}
            strategic action items
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 w-full h-auto p-1.5 bg-stone-100/90 border border-stone-200/80 rounded-2xl gap-1.5">
          {tabsConfig.map((tab) => {
            const TabIcon = tab.icon;
            const count = tab.items.length;
            const isActive = activeTab === tab.id;

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all min-h-[44px]',
                  'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50',
                  'data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border border-transparent',
                  tab.activeColor
                )}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{tab.title}</span>
                <span
                  className={cn(
                    'font-mono text-xs px-2 py-0.5 rounded-full border shrink-0',
                    isActive ? tab.badgeColor : 'bg-stone-200/70 border-stone-300/80 text-stone-700'
                  )}
                >
                  {count}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Contents: Spacious Layout */}
        {tabsConfig.map((tab) => {
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6 focus:outline-none">
              {/* Contextual Description Banner */}
              <div className="p-4 rounded-xl border border-stone-200/80 bg-[#FAF9F5] flex items-start gap-3">
                <Info className="w-4 h-4 text-stone-500 mt-0.5 shrink-0" />
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {tab.description}
                </p>
              </div>

              {/* Items Grid: Spacious 2-column or 1-column layout */}
              {tab.items.length === 0 ? (
                <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 space-y-2">
                  <tab.icon className="w-8 h-8 text-stone-400 mx-auto stroke-[1.5]" />
                  <h4 className="font-serif font-bold text-base text-stone-800">
                    {tab.emptyTitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto font-sans">
                    {tab.emptyText}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {tab.items.map((card, idx) => {
                    const cardKey = `${tab.id}-${idx}`;
                    const isChecked = Boolean(checkedItems[cardKey]);
                    const isCopiedAlternative = copiedKey === `${cardKey}-alt`;
                    const isCopiedRationale = copiedKey === `${cardKey}-rat`;

                    return (
                      <div
                        key={cardKey}
                        className={cn(
                          'p-5 sm:p-6 rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all duration-200 flex flex-col justify-between space-y-4',
                          isChecked
                            ? 'opacity-40 bg-stone-50/60 line-through'
                            : 'hover:border-stone-300 hover:shadow-sm'
                        )}
                      >
                        {/* Card Header */}
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={cardKey}
                            checked={isChecked}
                            onCheckedChange={() => toggleCheck(cardKey)}
                            aria-label={`Mark ${card.clauseTitle} as resolved`}
                            className="mt-1 border-stone-400 data-[state=checked]:bg-stone-900 data-[state=checked]:text-white h-4 w-4 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <label
                                htmlFor={cardKey}
                                className="font-serif text-base sm:text-lg font-bold text-stone-900 cursor-pointer block leading-tight"
                              >
                                {card.clauseTitle}
                              </label>
                              <Badge
                                variant="outline"
                                className={cn('text-[10px] font-mono shrink-0 uppercase', tab.badgeColor)}
                              >
                                {tab.shortTitle}
                              </Badge>
                            </div>

                            {/* Rationale Text */}
                            <p className="text-xs sm:text-sm text-stone-700 mt-2.5 leading-relaxed font-sans select-text">
                              {card.rationale}
                            </p>
                          </div>
                        </div>

                        {/* Counter-Proposal Draft Callout */}
                        {card.suggestedAlternative && (
                          <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 space-y-2 select-text">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-900 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                                {tab.counterLabel}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopy(
                                    `${cardKey}-alt`,
                                    card.suggestedAlternative || '',
                                    'Counter-proposal draft'
                                  )
                                }
                                className="inline-flex items-center gap-1 text-[11px] font-sans text-amber-800 hover:text-amber-950 font-medium transition-colors"
                              >
                                {isCopiedAlternative ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700 font-semibold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Draft</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-xs sm:text-sm text-stone-800 font-sans italic leading-relaxed pl-2 border-l-2 border-amber-400">
                              &ldquo;{card.suggestedAlternative}&rdquo;
                            </p>
                          </div>
                        )}

                        {/* Card Actions Footer */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="text-stone-400 font-mono text-[11px]">
                            {isChecked ? 'Marked resolved' : 'Action pending'}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(`${cardKey}-rat`, card.rationale, 'Talking point')
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500 hover:text-stone-900 transition-colors py-1 px-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:bg-stone-100"
                          >
                            {isCopiedRationale ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-medium">Copied!</span>
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
                    );
                  })}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Strategic Synthesis Footer */}
      {negotiationGuide.recommendation && (
        <div className="mt-8 p-5 sm:p-6 rounded-2xl border border-stone-200/90 bg-[#FAF9F5] space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-stone-700" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 font-mono">
              Overall Strategic Synthesis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
            {negotiationGuide.recommendation}
          </p>
        </div>
      )}
    </section>
  );
}
