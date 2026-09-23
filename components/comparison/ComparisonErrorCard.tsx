'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ComparisonErrorCardProps {
  errorMessage: string;
  onRetry: () => void;
  onAdjustInput: () => void;
}

export function ComparisonErrorCard({
  errorMessage,
  onRetry,
  onAdjustInput,
}: ComparisonErrorCardProps) {
  return (
    <div
      data-testid="comparison-error-card"
      className="rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-8 max-w-xl mx-auto shadow-sm space-y-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-red-100 border border-red-200 p-2 text-red-700 shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-stone-900 tracking-wide">
            Comparison Analysis Failed
          </h3>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
            {`Gavel could not complete document comparison: ${errorMessage}. Both documents were processed ephemerally and cleared from volatile memory.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-red-200/60">
        <Button
          variant="outline"
          size="sm"
          onClick={onAdjustInput}
          data-testid="adjust-documents-button"
          className="text-xs border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-xl"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Adjust Documents
        </Button>
        <Button
          size="sm"
          onClick={onRetry}
          data-testid="retry-comparison-button"
          className="bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs px-4 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Retry Comparison
        </Button>
      </div>
    </div>
  );
}

