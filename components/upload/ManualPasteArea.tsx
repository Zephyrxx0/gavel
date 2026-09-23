'use client';

import React from 'react';
import { ClipboardPaste, Trash2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { countWords } from '@/lib/text-utils';
import { toast } from 'sonner';

export interface ManualPasteAreaProps {
  value: string;
  onChange: (value: string) => void;
  fallbackNotice?: string | null;
  onClearFallbackNotice?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ManualPasteArea({
  value,
  onChange,
  fallbackNotice,
  onClearFallbackNotice,
  placeholder = 'Paste legal contract clauses, agreement terms, tenancy notices, or statutory text here...',
  disabled = false,
}: ManualPasteAreaProps) {
  const charCount = value.length;
  const wordCount = countWords(value);

  const handlePasteFromClipboard = async () => {
    try {
      if (!navigator?.clipboard?.readText) {
        toast.error('Clipboard access is not supported by your browser.');
        return;
      }
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText || !clipboardText.trim()) {
        toast.info('Clipboard is empty.');
        return;
      }
      onChange(clipboardText);
      toast.success('Pasted from clipboard!');
    } catch {
      toast.error('Failed to read from clipboard. Please paste manually.');
    }
  };

  const handleClear = () => {
    onChange('');
    if (onClearFallbackNotice) {
      onClearFallbackNotice();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Inline Fallback Notification per D-02 */}
      {fallbackNotice && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-[#F2D8CD] bg-[#FAF0EB] text-[#7D432D] text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#7D432D] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-semibold text-stone-900">Document Upload Notice: </span>
              <span>{fallbackNotice}</span>
            </div>
          </div>
          {onClearFallbackNotice && (
            <button
              type="button"
              onClick={onClearFallbackNotice}
              className="text-[#7D432D] hover:text-stone-900 text-xs font-mono underline ml-2 flex-shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Header Bar: Status Badge & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] border border-[#D0E2D6] text-[#264D34] bg-[#EBF3EE] flex items-center gap-1.5 py-0.5 px-2.5 rounded-full">
            <Sparkles className="w-3 h-3 text-[#264D34]" />
            Manual Input Mode
          </span>
          <span className="text-xs text-stone-500 hidden sm:inline">
            Direct text input with formatting preservation
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePasteFromClipboard}
            disabled={disabled}
            className="h-8 px-2.5 text-xs border-stone-200/90 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-sm"
          >
            <ClipboardPaste className="w-3.5 h-3.5 mr-1.5 text-stone-600" />
            Paste Clipboard
          </Button>

          {value.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="h-8 px-2 text-xs text-stone-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative rounded-2xl border border-stone-200/90 bg-white transition-all focus-within:border-stone-400 focus-within:ring-1 focus-within:ring-stone-300 shadow-sm">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={9}
          className="w-full resize-y bg-transparent p-4 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none font-sans leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Legal text input"
        />

        {/* Live Counters Footer */}
        <div className="flex items-center justify-between border-t border-stone-100 px-4 py-2.5 text-xs text-stone-500 bg-stone-50/70 rounded-b-2xl">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>
              <strong className="text-stone-800">{charCount.toLocaleString()}</strong> characters
            </span>
            <span className="text-stone-300">•</span>
            <span>
              <strong className="text-stone-800">{wordCount.toLocaleString()}</strong> words
            </span>
          </div>

          <div className="text-[11px] font-mono">
            {charCount < 50 ? (
              <span className="text-amber-700 font-medium">Min 50 chars required</span>
            ) : (
              <span className="text-emerald-700 font-medium">Ready for analysis</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
