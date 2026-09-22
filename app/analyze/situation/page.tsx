'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';
import { SituationAnalysis, DisputeCategory } from '@/lib/schemas/situation';

import { SituationIntakeForm, DRAFT_STORAGE_KEY } from '@/components/situation/SituationIntakeForm';
import { SituationProgress } from '@/components/situation/SituationProgress';
import { SituationErrorCard } from '@/components/situation/SituationErrorCard';
import { SituationStickyNav } from '@/components/situation/SituationStickyNav';
import { DeadlineAlertBanner } from '@/components/situation/DeadlineAlertBanner';
import { SituationSummaryCard } from '@/components/situation/SituationSummaryCard';
import { RightsAccordion } from '@/components/situation/RightsAccordion';
import { NextStepsRoadmap } from '@/components/situation/NextStepsRoadmap';
import { EvidenceChecklist } from '@/components/situation/EvidenceChecklist';
import { CounselTriggersCard } from '@/components/situation/CounselTriggersCard';

type AnalysisState = 'idle' | 'analyzing' | 'dossier' | 'error';

export default function SituationNavigatorPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisData, setAnalysisData] = useState<SituationAnalysis | null>(null);
  const [submittedDescription, setSubmittedDescription] = useState<string>('');
  const [submittedCategory, setSubmittedCategory] = useState<DisputeCategory | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('summary-section');

  const handleAnalyze = useCallback(async (description: string, category?: DisputeCategory) => {
    setAnalysisState('analyzing');
    setErrorMessage('');
    setSubmittedDescription(description);
    setSubmittedCategory(category);

    try {
      const res = await fetch('/api/analyze/situation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, category }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Analysis could not be completed.');
      }

      setAnalysisData(json.data);
      setAnalysisState('dossier');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setAnalysisState('error');
    }
  }, []);

  const handleChangeCategory = useCallback(
    (newCategory: DisputeCategory) => {
      if (submittedDescription) {
        handleAnalyze(submittedDescription, newCategory);
      }
    },
    [submittedDescription, handleAnalyze]
  );

  const handleReset = useCallback(() => {
    setAnalysisData(null);
    setSubmittedDescription('');
    setSubmittedCategory(undefined);
    setErrorMessage('');
    setActiveSection('summary-section');
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (err) {
        console.warn('Failed to clear situation draft from sessionStorage:', err);
      }
    }
    setAnalysisState('idle');
  }, []);

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll-spy observer for dossier sections
  useEffect(() => {
    if (analysisState !== 'dossier') return;
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const sectionIds = [
      'deadline-section',
      'summary-section',
      'rights-section',
      'roadmap-section',
      'evidence-section',
      'counsel-section',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          // Find the intersecting section closest to top offset (e.g. 112px scroll-mt)
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
  }, [analysisState, analysisData]);

  return (
    <div className="min-h-screen bg-legal-obsidian text-foreground flex flex-col">
      <Header />

      {analysisState === 'dossier' && analysisData && (
        <SituationStickyNav
          activeSection={activeSection}
          onNavigate={handleNavigateSection}
          onReset={handleReset}
          hasDeadlines={Boolean(analysisData.deadlineFlags && analysisData.deadlineFlags.length > 0)}
          counts={{
            rights: analysisData.rights.length,
            roadmap: analysisData.roadmap.length,
            evidence: analysisData.documentsToGather.length,
            counselTriggers: analysisData.whenToCallLawyer.length,
          }}
        />
      )}

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Prominent Statutory Legal Disclaimer Card placed directly above viewports */}
        <LegalDisclaimerCard />

        {/* State 1: Idle / Intake */}
        {analysisState === 'idle' && (
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/70 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                Situation Intake &amp; Analysis Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Describe your legal dispute or dilemma in plain English to evaluate your rights, next steps, and evidence.
              </p>
            </div>

            <SituationIntakeForm
              onSubmit={handleAnalyze}
              initialDescription={submittedDescription}
              initialCategory={submittedCategory || 'auto'}
            />
          </div>
        )}

        {/* State 2: Analyzing / Progress */}
        {analysisState === 'analyzing' && <SituationProgress />}

        {/* State 3: Error */}
        {analysisState === 'error' && (
          <SituationErrorCard
            errorMessage={errorMessage}
            onRetry={() => handleAnalyze(submittedDescription, submittedCategory)}
            onAdjustDescription={() => setAnalysisState('idle')}
          />
        )}

        {/* State 4: Complete Situation Dossier */}
        {analysisState === 'dossier' && analysisData && (
          <div className="space-y-12">
            {/* Layer 1: Critical Deadline Warnings (SIT-07, D-10) */}
            <DeadlineAlertBanner deadlineFlags={analysisData.deadlineFlags} />

            {/* Layer 2: Factual Summary & Domain Confirmation (SIT-02, SIT-03, SIT-06, D-07, D-14, D-16) */}
            <SituationSummaryCard
              disputeCategory={analysisData.disputeCategory}
              summary={analysisData.summary}
              estimatedTimeline={analysisData.estimatedTimeline}
              onChangeCategory={handleChangeCategory}
            />

            {/* Layer 3: Statutory Protections (SIT-04, D-11) */}
            <RightsAccordion rights={analysisData.rights} />

            {/* Layer 4: Next Steps Roadmap (SIT-05, D-05, D-12) */}
            <NextStepsRoadmap roadmap={analysisData.roadmap} />

            {/* Layer 5: Evidentiary Checklist (SIT-06, D-06, D-12) */}
            <EvidenceChecklist documentsToGather={analysisData.documentsToGather} />

            {/* Layer 6: Attorney Escalation Triggers (SIT-06, D-08) */}
            <CounselTriggersCard whenToCallLawyer={analysisData.whenToCallLawyer} />
          </div>
        )}
      </main>
    </div>
  );
}
