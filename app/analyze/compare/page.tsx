'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { ModeSwitcher } from '@/components/shared/ModeSwitcher';
import { LegalDisclaimerBanner, LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';
import { DualDocumentIntake, ComparisonPayload } from '@/components/comparison/intake/DualDocumentIntake';
import { ComparisonProgress } from '@/components/comparison/ComparisonProgress';
import { ComparisonStickyNav } from '@/components/comparison/ComparisonStickyNav';
import { FavorabilityVerdictCard } from '@/components/comparison/FavorabilityVerdictCard';
import { ClauseComparisonTable } from '@/components/comparison/ClauseComparisonTable';
import { InconsistenciesSection } from '@/components/comparison/InconsistenciesSection';
import { NegotiationGuide } from '@/components/comparison/NegotiationGuide';
import { ComparisonErrorCard } from '@/components/comparison/ComparisonErrorCard';
import { Comparison } from '@/lib/schemas/comparison';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatTriggerButton } from '@/components/chat/ChatTriggerButton';
import { ExportDossierCard } from '@/components/export/ExportDossierCard';
import { useScrollSpy } from '@/lib/hooks/useScrollSpy';
import {
  SESSION_KEYS,
  saveSessionAnalysis,
  loadSessionAnalysis,
  clearSessionAnalysis,
} from '@/lib/session-vault';

const COMPARISON_SECTIONS = [
  'verdict-section',
  'differences-section',
  'inconsistencies-section',
  'negotiation-section',
];

type ComparisonPageState = 'idle' | 'analyzing' | 'dossier' | 'error';

export default function ComparePage() {
  const [pageState, setPageState] = useState<ComparisonPageState>('idle');
  const [comparisonResult, setComparisonResult] = useState<Comparison | null>(null);
  const [isLargeDoc, setIsLargeDoc] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<ComparisonPayload | null>(null);

  const [labelA, setLabelA] = useState('Original Document');
  const [labelB, setLabelB] = useState('Revised Document');
  const [activeSection, setActiveSection] = useScrollSpy(
    COMPARISON_SECTIONS,
    120,
    pageState === 'dossier'
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Restore active review session when switching between ModeSwitcher tabs
  useEffect(() => {
    const saved = loadSessionAnalysis<{
      comparisonResult: Comparison;
      isLargeDoc: boolean;
      labelA: string;
      labelB: string;
      lastPayload: ComparisonPayload | null;
    }>(SESSION_KEYS.COMPARE);

    if (saved && saved.comparisonResult) {
      setComparisonResult(saved.comparisonResult);
      setIsLargeDoc(Boolean(saved.isLargeDoc));
      setLabelA(saved.labelA || 'Original Document');
      setLabelB(saved.labelB || 'Revised Document');
      setLastPayload(saved.lastPayload || null);
      setPageState('dossier');
    }
  }, []);

  const handleStartComparison = async (payload: ComparisonPayload) => {
    // Purge previous review session when user initiates a new review
    clearSessionAnalysis(SESSION_KEYS.COMPARE);
    setLastPayload(payload);
    setLabelA(payload.labelA || 'Original Document');
    setLabelB(payload.labelB || 'Revised Document');
    setErrorMessage(null);
    setPageState('analyzing');

    try {
      const res = await fetch('/api/analyze/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Comparison analysis failed.');
      }

      setComparisonResult(data.data);
      setIsLargeDoc(Boolean(data.isLargeDoc));
      setPageState('dossier');

      // Persist completed review in session storage so it survives ModeSwitcher tab switches
      saveSessionAnalysis(SESSION_KEYS.COMPARE, {
        comparisonResult: data.data,
        isLargeDoc: Boolean(data.isLargeDoc),
        labelA: payload.labelA || 'Original Document',
        labelB: payload.labelB || 'Revised Document',
        lastPayload: payload,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to analyze documents.');
      setPageState('error');
    }
  };

  const handleRetry = () => {
    if (lastPayload) {
      handleStartComparison(lastPayload);
    } else {
      setPageState('idle');
    }
  };

  const handleReset = () => {
    // Purge session when user deletes/resets the review
    clearSessionAnalysis(SESSION_KEYS.COMPARE);
    setPageState('idle');
    setComparisonResult(null);
    setIsLargeDoc(false);
    setErrorMessage(null);
    setActiveSection('verdict-section');
  };

  const handleSelectSection = (id: string) => {
    setActiveSection(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col pb-20">
      <Header />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <ModeSwitcher className="w-full mb-6" />
        {/* State: IDLE */}
        {pageState === 'idle' && (
          <div className="flex flex-col items-center">
            <div className="text-center max-w-2xl mb-8">
              <span className="inline-flex items-center rounded-full border border-blue-200/80 bg-[#EDF2FA] px-3.5 py-1 text-xs font-medium text-blue-800 mb-3">
                Mode 3 · Document Comparison Engine
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 mb-3 font-normal tracking-tight">
                Compare Two Legal Agreements
              </h1>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
                Upload original and revised versions of a contract to detect clause discrepancies,
                favorability shifts, and actionable negotiation leverage.
              </p>
            </div>

            <div className="w-full mb-8">
              <LegalDisclaimerCard />
            </div>

            <DualDocumentIntake onStartComparison={handleStartComparison} />
          </div>
        )}

        {/* State: ANALYZING */}
        {pageState === 'analyzing' && <ComparisonProgress isLargeDoc={isLargeDoc} />}

        {/* State: DOSSIER (Results) */}
        {pageState === 'dossier' && comparisonResult && (
          <div className="space-y-6">
            {/* Dossier Header Bar */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-stone-200/80">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs border-stone-200 bg-white text-stone-700 hover:text-stone-900 hover:bg-stone-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Compare New Pair
                </Button>
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl text-stone-900">
                    Comparison Report: {labelA} vs {labelB}
                  </h1>
                </div>
              </div>

              {isLargeDoc && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs text-amber-800 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Large contract — analysed in two passes</span>
                </div>
              )}
            </div>

            <LegalDisclaimerCard className="mb-6" />

            {/* Layout: Sticky Left Nav + Content Sections */}
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <ComparisonStickyNav
                activeSection={activeSection}
                onSelectSection={handleSelectSection}
                onReset={handleReset}
                onOpenChat={() => setIsChatOpen(true)}
                onExport={() => {
                  const el = document.getElementById('export-dossier-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                counts={{
                  differences: comparisonResult.differences.length,
                  inconsistencies: comparisonResult.inconsistencies.length,
                  negotiation:
                    comparisonResult.negotiationGuide.pushBack.length +
                    comparisonResult.negotiationGuide.acceptAsIs.length +
                    comparisonResult.negotiationGuide.flagForLawyer.length,
                }}
              />

              <div className="flex-1 min-w-0 space-y-8 w-full">
                <FavorabilityVerdictCard
                  verdict={comparisonResult.favorabilityVerdict}
                  rationale={comparisonResult.verdictRationale}
                  metrics={comparisonResult.favorabilityMetrics}
                  labelA={labelA}
                  labelB={labelB}
                />

                <ClauseComparisonTable
                  differences={comparisonResult.differences}
                  labelA={labelA}
                  labelB={labelB}
                />

                <InconsistenciesSection
                  inconsistencies={comparisonResult.inconsistencies}
                />

                <NegotiationGuide
                  negotiationGuide={comparisonResult.negotiationGuide}
                  labelA={labelA}
                  labelB={labelB}
                />

                <div id="export-dossier-section">
                  <ExportDossierCard
                    mode="compare"
                    data={comparisonResult}
                    metadata={{ labelA, labelB }}
                  />
                </div>

                {/* Bottom Reset Callout per D-15 */}
                <div className="p-6 rounded-2xl border border-stone-200/80 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-serif text-stone-900">Finished with this comparison?</h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Compare another agreement version pair. All prior analyses are cleared from memory.
                    </p>
                  </div>
                  <Button
                    onClick={handleReset}
                    className="bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs px-5 rounded-xl transition-colors"
                  >
                    Compare Another Pair
                  </Button>
                </div>

                <ChatTriggerButton
                  onClick={() => setIsChatOpen(true)}
                  isOpen={isChatOpen}
                />

                <ChatPanel
                  isOpen={isChatOpen}
                  onClose={() => setIsChatOpen(false)}
                  mode="compare"
                  text={
                    lastPayload?.docA
                      ? `=== Document A: ${labelA} ===\n${lastPayload.docA}\n\n=== Document B: ${labelB} ===\n${lastPayload.docB}`
                      : undefined
                  }
                  analysis={comparisonResult}
                  documentType="Contract Comparison"
                />
              </div>
            </div>
          </div>
        )}

        {/* State: ERROR */}
        {pageState === 'error' && errorMessage && (
          <div className="py-12 flex justify-center">
            <ComparisonErrorCard
              errorMessage={errorMessage}
              onRetry={handleRetry}
              onAdjustInput={handleReset}
            />
          </div>
        )}
      </main>

      <LegalDisclaimerBanner />
    </div>
  );
}

