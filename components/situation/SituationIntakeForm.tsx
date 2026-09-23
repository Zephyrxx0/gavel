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
            className="text-xs font-mono uppercase tracking-wider text-stone-600"
          >
            Dispute Narrative &amp; Facts
          </label>
          <span
            data-testid="word-count-badge"
            className={`font-mono text-xs px-2.5 py-0.5 rounded-full transition-colors ${
              words >= 20
                ? 'text-emerald-400 bg-emerald-50 border border-emerald-200'
                : 'text-stone-600 bg-stone-100 border border-stone-200'
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
          className="w-full min-h-[160px] rounded-2xl border border-stone-200/90 bg-white p-4 text-sm font-sans text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-300 leading-relaxed resize-y shadow-sm"
        />
      </div>

      {/* Inline Contextual Guidance Helper Banner (< 20 words) */}
      {mounted && words > 0 && words < 20 && (
        <div
          data-testid="prompt-helper-banner"
          className="rounded-2xl border border-[#F2D8CD] bg-[#FAF0EB] p-4 space-y-2 text-xs"
        >
          <div className="flex items-start gap-2 text-[#7D432D] font-medium">
            <HelpCircle className="w-4 h-4 text-[#7D432D] shrink-0 mt-0.5" />
            <span className="leading-snug">
              Could you add a bit more detail? For the most accurate legal rights breakdown, consider: Who was involved? What was promised or agreed? Roughly when did this happen?
            </span>
          </div>
          <p className="text-stone-700 pl-6 leading-relaxed">
            To identify statutory protections, deadlines, and procedural steps, consider providing:
          </p>
          <ul className="list-disc list-inside text-stone-600 pl-6 space-y-1 font-mono text-[11px]">
            <li>Who was involved? (e.g., landlord, employer, merchant, contractor)</li>
            <li>What was promised or agreed? (e.g., signed contract, verbal agreement, delivery deadline)</li>
            <li>Roughly when did this happen? (e.g., last week, 30 days ago, ongoing)</li>
          </ul>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/80">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={!description && category === 'auto'}
          data-testid="clear-draft-button"
          className="text-xs border-stone-200 bg-white text-stone-600 hover:text-stone-900 hover:bg-stone-50"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Clear Draft
        </Button>

        <Button
          type="submit"
          size="sm"
          disabled={!isSubmittable || isLoading}
          data-testid="submit-situation-button"
          className={`h-10 text-xs px-5 font-medium rounded-xl transition-all ${
            isSubmittable && !isLoading
              ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-sm cursor-pointer'
              : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin text-stone-500" />
              <span>Analyzing Situation...</span>
            </>
          ) : isSubmittable ? (
            <>
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-white" />
              <span>Analyze Situation</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-white" />
            </>
          ) : (
            <span>Analyze Situation (Minimum 20 Words Required)</span>
          )}
        </Button>
      </div>
    </form>
  );
}
