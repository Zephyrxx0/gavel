'use client';

import React from 'react';
import { ErrorAlertCard } from '@/components/shared/ErrorAlertCard';

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
    <ErrorAlertCard
      cardTestId="comparison-error-card"
      title="Comparison Analysis Failed"
      message={`Gavel could not complete document comparison: ${errorMessage}. Both documents were processed ephemerally and cleared from volatile memory.`}
      onRetry={onRetry}
      retryTestId="retry-comparison-button"
      retryLabel="Retry Comparison"
      onAdjust={onAdjustInput}
      adjustLabel="Adjust Documents"
      adjustTestId="adjust-documents-button"
    />
  );
}
