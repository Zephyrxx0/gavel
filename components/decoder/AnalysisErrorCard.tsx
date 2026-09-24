'use client';

import React from 'react';
import { ErrorAlertCard } from '@/components/shared/ErrorAlertCard';

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
    <ErrorAlertCard
      title="Analysis Encountered an Issue"
      message={`Gavel could not complete automated analysis: ${errorMessage}. Your document was processed ephemerally and has been cleared from volatile memory.`}
      onRetry={onRetry}
      onAdjust={onAdjustInput}
      adjustLabel="Adjust Input Text"
      retryLabel="Retry Analysis"
    />
  );
}
