'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DisputeCategory } from '@/lib/schemas/situation';
import { CategoryFilterChips, CategoryFilterValue } from './CategoryFilterChips';
import { QuickStartCards } from './QuickStartCards';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, RotateCcw, HelpCircle, Loader2 } from 'lucide-react';

export const DRAFT_STORAGE_KEY = 'gavel_situation_draft_v1';

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

export function validateAndSubmitSituation(
  description: string,
  category: CategoryFilterValue,
  isLoading: boolean,
  onSubmit: (description: string, category?: DisputeCategory) => void
): boolean {
  const words = countWords(description);
  if (words < 20 || isLoading) {
    return false;
  }
  const resolvedCategory = category !== 'auto' ? category : undefined;
  onSubmit(description.trim(), resolvedCategory);
  return true;
}

export interface SituationIntakeFormProps {
  onSubmit: (description: string, category?: DisputeCategory) => void;
  isLoading?: boolean;
  initialDescription?: string;
  initialCategory?: CategoryFilterValue;
  isMounted?: boolean;
}

export function SituationIntakeForm({
  onSubmit,
  isLoading = false,
  initialDescription = '',
  initialCategory = 'auto',
  isMounted = false,
}: SituationIntakeFormProps) {
  const [description, setDescription] = useState<string>(initialDescription);
  const [category, setCategory] = useState<CategoryFilterValue>(initialCategory);
  const [mounted, setMounted] = useState<boolean>(isMounted);

  // Restore draft from sessionStorage safely on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const savedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY);
        if (savedDraft) {
          setDescription(savedDraft);
        }
      } catch (err) {
        console.warn('Unable to access sessionStorage for situation draft:', err);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDescription(val);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, val);
      } catch (err) {
        console.warn('Failed to save situation draft to sessionStorage:', err);
      }
    }
  };

  const handleSelectScenario = useCallback((text: string, cat: DisputeCategory) => {
    setDescription(text);
    setCategory(cat);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(DRAFT_STORAGE_KEY, text);
      } catch (err) {
        console.warn('Failed to save situation draft to sessionStorage:', err);
      }
    }
  }, []);

  const handleClear = () => {
    setDescription('');
    setCategory('auto');
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (err) {
        console.warn('Failed to remove situation draft from sessionStorage:', err);
      }
    }
  };

  const words = countWords(description);
  const isSubmittable = words >= 20;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSubmitSituation(description, category, isLoading, onSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="situation-intake-form">
      {/* Quick-Start Preset Cards */}
      <QuickStartCards onSelectScenario={handleSelectScenario} />

      {/* Category Chips */}
      <CategoryFilterChips selectedCategory={category} onSelectCategory={setCategory} />

      {/* Free-Text Narrative Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="situation-narrative"
            className="text-xs font-mono uppercase tracking-wider text-slate-300"
          >
            Dispute Narrative & Facts
          </label>
          <span
            data-testid="word-count-badge"
            className={`font-mono text-xs px-2.5 py-0.5 rounded-full transition-colors ${
              words >= 20
                ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/30'
                : 'text-slate-400 bg-slate-900 border border-slate-800'
            }`}
          >
            {words >= 20 ? `${words} words` : `${words} / 20 words minimum`}
          </span>
        </div>

        <textarea
          id="situation-narrative"
          data-testid="situation-narrative-input"
          value={description}
          onChange={handleChange}
          rows={7}
          placeholder="Describe what happened in your own words. Include who was involved, what agreements or promises were made, key dates, what went wrong, and what resolution you are seeking..."
          className="w-full min-h-[160px] rounded-xl border border-slate-800 bg-[#0B0F17] p-4 text-sm font-sans text-slate-200 placeholder:text-slate-500 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] leading-relaxed resize-y"
        />
      </div>

      {/* Inline Contextual Guidance Helper Banner (< 20 words) */}
      {mounted && words > 0 && words < 20 && (
        <div
          data-testid="prompt-helper-banner"
          className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 space-y-2 text-xs"
        >
          <div className="flex items-start gap-2 text-amber-300 font-medium">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-snug">
              Could you add a bit more detail? For the most accurate legal rights breakdown, consider: Who was involved? What was promised or agreed? Roughly when did this happen?
            </span>
          </div>
          <p className="text-slate-300 pl-6 leading-relaxed">
            To identify statutory protections, deadlines, and procedural steps, consider providing:
          </p>
          <ul className="list-disc list-inside text-slate-400 pl-6 space-y-1 font-mono text-[11px]">
            <li>Who was involved? (e.g., landlord, employer, merchant, contractor)</li>
            <li>What was promised or agreed? (e.g., signed contract, verbal agreement, delivery deadline)</li>
            <li>Roughly when did this happen? (e.g., last week, 30 days ago, ongoing)</li>
          </ul>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!description && category === 'auto'}
          data-testid="clear-draft-button"
          className="text-xs border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Clear Draft
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={!isSubmittable || isLoading}
          data-testid="submit-situation-button"
          className={`h-9 text-xs px-5 font-semibold transition-all ${
            isSubmittable && !isLoading
              ? 'bg-[#D4AF37] hover:bg-[#C5A059] text-black shadow-md cursor-pointer'
              : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-slate-400" />
              <span>Analyzing Situation...</span>
            </>
          ) : isSubmittable ? (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-black" />
              <span>Analyze Situation</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-black" />
            </>
          ) : (
            <span>Analyze Situation (Minimum 20 Words Required)</span>
          )}
        </Button>
      </div>
    </form>
  );
}
