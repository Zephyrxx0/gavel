'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AnalysisErrorCardProps {
  errorMessage: string;
  onRetry: () => void;
  onAdjustInput: () => void;
}

export function AnalysisErrorCard({
  errorMessage,
  onRetry,
  onAdjustInput,
}: AnalysisErrorCardProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-6 sm:p-8 max-w-xl mx-auto shadow-sm space-y-5">
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-white border border-rose-200 p-2 text-rose-600 shrink-0 shadow-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-rose-950 tracking-tight">
            Analysis Encountered an Issue
          </h3>
          <p className="text-xs sm:text-sm text-rose-900/80 leading-relaxed font-sans">
            {`Gavel could not complete automated analysis: ${errorMessage}. Your document was processed ephemerally and has been cleared from volatile memory.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-rose-200/60">
        <Button
          variant="outline"
          size="sm"
          onClick={onAdjustInput}
          className="text-xs border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Adjust Input Text
        </Button>
        <Button
          size="sm"
          onClick={onRetry}
          className="bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs px-4"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Retry Analysis
        </Button>
      </div>
    </div>
  );
}

