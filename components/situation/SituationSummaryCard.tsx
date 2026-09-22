'use client';

import React, { useState } from 'react';
import { DisputeCategory } from '@/lib/schemas/situation';
import {
  Sparkles,
  FileText,
  Clock,
  ShieldCheck,
  ChevronDown,
  Home,
  Briefcase,
  ShoppingBag,
  Scale,
  Users,
  Landmark,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface SituationSummaryCardProps {
  disputeCategory: DisputeCategory;
  summary: string;
  estimatedTimeline: string;
  onChangeCategory?: (newCategory: DisputeCategory) => void;
  isReanalyzing?: boolean;
}

export const CATEGORY_METADATA: Record<
  DisputeCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  tenancy: { label: 'Tenancy', icon: Home },
  employment: { label: 'Employment', icon: Briefcase },
  consumer: { label: 'Consumer', icon: ShoppingBag },
  civil: { label: 'Civil', icon: Scale },
  family: { label: 'Family', icon: Users },
  property: { label: 'Property', icon: Landmark },
  financial: { label: 'Financial', icon: DollarSign },
  other: { label: 'General', icon: AlertCircle },
};

const ALL_CATEGORIES: DisputeCategory[] = [
  'tenancy',
  'employment',
  'consumer',
  'civil',
  'family',
  'property',
  'financial',
  'other',
];

export function SituationSummaryCard({
  disputeCategory,
  summary,
  estimatedTimeline,
  onChangeCategory,
  isReanalyzing = false,
}: SituationSummaryCardProps) {
  const [isChanging, setIsChanging] = useState(false);
  const meta = CATEGORY_METADATA[disputeCategory] || { label: disputeCategory, icon: Sparkles };
  const CategoryIcon = meta.icon;
  const categoryLabel = meta.label;

  return (
    <section
      id="summary-section"
      className="scroll-mt-28 border border-[#D4AF37]/30 bg-[#111827] rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5"
    >
      {/* Header & Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Dispute Assessment & Summary
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Plain-English synthesis and statutory domain classification
            </p>
          </div>
        </div>

        {/* Category Confirmation Badge & Change Domain Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <Badge
            variant="gold"
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-1"
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>{`✓ Verified: ${categoryLabel} Dispute`}</span>
          </Badge>

          {onChangeCategory && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChanging(!isChanging)}
              disabled={isReanalyzing}
              className="h-7 text-[11px] font-mono border-slate-700 bg-slate-900 text-slate-300 hover:text-white px-2.5"
            >
              <span>Change Domain</span>
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isChanging ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Category Change Selector Dropdown Area */}
      {isChanging && onChangeCategory && (
        <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/90 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300">
              Re-analyze dispute under a different legal domain:
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChanging(false)}
              className="text-xs text-slate-400 hover:text-white h-6 px-2"
            >
              Cancel
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.filter((cat) => cat !== disputeCategory).map((cat) => {
              const catMeta = CATEGORY_METADATA[cat];
              const CatIcon = catMeta.icon;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setIsChanging(false);
                    onChangeCategory(cat);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] border border-slate-700 hover:border-[#D4AF37]/40 text-slate-300 transition-colors"
                >
                  <CatIcon className="w-3 h-3" />
                  <span>{catMeta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary Narrative */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Factual Recap</span>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          {summary}
        </p>
      </div>

      {/* Resolution Horizon & Non-UPL Educational Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#D4AF37]">
            <Clock className="w-3.5 h-3.5" />
            <span>Resolution Horizon</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans font-medium">
            {estimatedTimeline}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4 space-y-2 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Legal Disclaimer</span>
          </div>
          <div>
            <span className="border border-slate-700/60 bg-slate-900/60 text-slate-400 font-mono text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              Educational &amp; Informational Analysis · Not Formal Legal Counsel
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
