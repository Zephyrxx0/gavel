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

const CATEGORY_METADATA: Record<
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
      className="scroll-mt-28 border border-stone-200/90 bg-white rounded-2xl p-6 sm:p-8 shadow-card-soft space-y-5"
    >
      {/* Header & Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FAF0EB] border border-[#F2D8CD] flex items-center justify-center text-[#7D432D] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
              Dispute Assessment & Summary
            </h2>
            <p className="text-xs text-stone-500 font-sans">
              Plain-English synthesis and statutory domain classification
            </p>
          </div>
        </div>

        {/* Category Confirmation Badge & Change Domain Trigger */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
          <Badge
            variant="gold"
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 bg-[#FAF0EB] text-[#7D432D] border-[#F2D8CD]"
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
              className="h-7 text-[11px] font-mono border-stone-200 bg-white text-stone-700 hover:bg-stone-50 px-2.5 shadow-sm"
            >
              <span>Change Domain</span>
              <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isChanging ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Category Change Selector Dropdown Area */}
      {isChanging && onChangeCategory && (
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-700">
              Re-analyze dispute under a different legal domain:
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChanging(false)}
              className="text-xs text-stone-500 hover:text-stone-900 h-6 px-2"
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-white hover:bg-[#FAF0EB] hover:text-[#7D432D] border border-stone-200 hover:border-[#F2D8CD] text-stone-700 transition-colors shadow-sm"
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
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500">
          <FileText className="w-3.5 h-3.5 text-stone-600" />
          <span>Factual Recap</span>
        </div>
        <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-sans">
          {summary}
        </p>
      </div>

      {/* Resolution Horizon & Non-UPL Educational Notice */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
        <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-stone-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Resolution Horizon</span>
          </div>
          <p className="text-xs sm:text-sm text-stone-900 font-sans font-medium">
            {estimatedTimeline}
          </p>
        </div>

        <div className="rounded-xl bg-stone-50 border border-stone-200/80 p-4 space-y-2 flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Legal Disclaimer</span>
          </div>
          <div>
            <span className="border border-stone-200 bg-white text-stone-600 font-mono text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
              Educational &amp; Informational Analysis · Not Formal Legal Counsel
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
