'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SituationErrorCardProps {
  errorMessage: string;
  onRetry: () => void;
  onAdjustDescription: () => void;
}

export function SituationErrorCard({
  errorMessage,
  onRetry,
  onAdjustDescription,
}: SituationErrorCardProps) {
  return (
    <div
      data-testid="situation-error-card"
      className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-5"
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-red-400 shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-white tracking-wide">
            Analysis Encountered an Issue
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            {`Gavel could not complete situation analysis: ${errorMessage}. Your dispute narrative was processed ephemerally and has been cleared from volatile server memory.`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
        <Button
          variant="outline"
          size="sm"
          onClick={onAdjustDescription}
          data-testid="adjust-description-button"
          className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Adjust Dispute Description
        </Button>
        <Button
          size="sm"
          onClick={onRetry}
          data-testid="retry-analysis-button"
          className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold text-xs px-4"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Retry Analysis
        </Button>
      </div>
    </div>
  );
}
