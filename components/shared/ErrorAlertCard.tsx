'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorAlertCardProps {
  title?: string;
  message: string;
  onRetry: () => void;
  onAdjust?: () => void;
  adjustLabel?: string;
  retryLabel?: string;
  cardTestId?: string;
  adjustTestId?: string;
  retryTestId?: string;
  className?: string;
}

export function ErrorAlertCard({
  title = 'Analysis Encountered an Issue',
  message,
  onRetry,
  onAdjust,
  adjustLabel = 'Adjust Input',
  retryLabel = 'Retry Analysis',
  cardTestId,
  adjustTestId,
  retryTestId,
  className,
}: ErrorAlertCardProps) {
  return (
    <div
      data-testid={cardTestId}
      className={cn(
        'rounded-2xl border border-rose-200 bg-rose-50/70 p-6 sm:p-8 max-w-xl mx-auto shadow-sm space-y-5',
        className
      )}
    >
      <div className="flex items-start gap-3.5">
        <div className="rounded-xl bg-white border border-rose-200 p-2 text-rose-600 shrink-0 shadow-sm">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-rose-950 tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-rose-900/80 leading-relaxed font-sans">
            {message}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-rose-200/60">
        {onAdjust && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAdjust}
            data-testid={adjustTestId}
            className="text-xs border-stone-200 bg-white text-stone-700 hover:bg-stone-50 rounded-xl"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            {adjustLabel}
          </Button>
        )}
        <Button
          size="sm"
          onClick={onRetry}
          data-testid={retryTestId}
          className="bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs px-4 rounded-xl"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          {retryLabel}
        </Button>
      </div>
    </div>
  );
}
