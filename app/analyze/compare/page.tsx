'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
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

export type ComparisonPageState = 'idle' | 'analyzing' | 'dossier' | 'error';

export default function ComparePage() {
  const [pageState, setPageState] = useState<ComparisonPageState>('idle');
  const [comparisonResult, setComparisonResult] = useState<Comparison | null>(null);
  const [isLargeDoc, setIsLargeDoc] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<ComparisonPayload | null>(null);

  const [labelA, setLabelA] = useState('Original Document');
  const [labelB, setLabelB] = useState('Revised Document');
  const [activeSection, setActiveSection] = useState('verdict-section');

  const handleStartComparison = async (payload: ComparisonPayload) => {
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

  // Scroll-spy observer for dossier sections
  useEffect(() => {
    if (pageState !== 'dossier') return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const sectionIds = [
      'verdict-section',
      'differences-section',
      'inconsistencies-section',
      'negotiation-section',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          const topEntry = intersecting.reduce((prev, curr) =>
            Math.abs(curr.boundingClientRect.top - 120) < Math.abs(prev.boundingClientRect.top - 120)
              ? curr
              : prev
          );
          setActiveSection(topEntry.target.id);
        }
      },
      {
        root: null,
        rootMargin: '-100px 0px -50% 0px',
        threshold: [0, 0.2, 0.5, 0.8],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [pageState, comparisonResult]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white flex flex-col pb-20">
      <Header />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* State: IDLE */}
        {pageState === 'idle' && (
          <div className="flex flex-col items-center">
            <div className="text-center max-w-2xl mb-8">
              <span className="inline-flex items-center rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs font-medium text-[#D4AF37] mb-3">
                Mode 3 · Document Comparison Engine
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-white mb-3">
                Compare Two Legal Agreements
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
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
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[#1E293B]">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs border-[#1E293B] bg-[#111827] text-slate-300 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Compare New Pair
                </Button>
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl text-white">
                    Comparison Report: {labelA} vs {labelB}
                  </h1>
                </div>
              </div>

              {isLargeDoc && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-950/30 px-3 py-1 text-xs text-amber-400 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Large contract — analysed in two passes</span>
                </div>
              )}
            </div>

            <LegalDisclaimerCard className="mb-6" />

            {/* Layout: Sticky Left Nav + Content Sections */}
            <div className="flex items-start gap-8">
              <ComparisonStickyNav
                activeSection={activeSection}
                onSelectSection={handleSelectSection}
                onReset={handleReset}
                counts={{
                  differences: comparisonResult.differences.length,
                  inconsistencies: comparisonResult.inconsistencies.length,
                  negotiation:
                    comparisonResult.negotiationGuide.pushBack.length +
                    comparisonResult.negotiationGuide.acceptAsIs.length +
                    comparisonResult.negotiationGuide.flagForLawyer.length,
                }}
              />

              <div className="flex-1 min-w-0 space-y-8">
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

                {/* Bottom Reset Callout per D-15 */}
                <div className="p-6 rounded-2xl border border-[#1E293B] bg-[#111827] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-serif text-white">Finished with this comparison?</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Compare another agreement version pair. All prior analyses are cleared from memory.
                    </p>
                  </div>
                  <Button
                    onClick={handleReset}
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B0F17] font-semibold text-xs px-5"
                  >
                    Compare Another Pair
                  </Button>
                </div>
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
