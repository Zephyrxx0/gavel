'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { ModeSwitcher } from '@/components/shared/ModeSwitcher';
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
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatTriggerButton } from '@/components/chat/ChatTriggerButton';
import { ExportDossierCard } from '@/components/export/ExportDossierCard';
import { useScrollSpy } from '@/lib/hooks/useScrollSpy';

const SITUATION_SECTIONS = [
  'deadline-section',
  'summary-section',
  'rights-section',
  'roadmap-section',
  'evidence-section',
  'counsel-section',
];

type AnalysisState = 'idle' | 'analyzing' | 'dossier' | 'error';

export default function SituationNavigatorPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [analysisData, setAnalysisData] = useState<SituationAnalysis | null>(null);
  const [submittedDescription, setSubmittedDescription] = useState<string>('');
  const [submittedCategory, setSubmittedCategory] = useState<DisputeCategory | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeSection, setActiveSection] = useScrollSpy(
    SITUATION_SECTIONS,
    120,
    analysisState === 'dossier'
  );
  const [isChatOpen, setIsChatOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col selection:bg-stone-200">
      <Header />

      {analysisState === 'dossier' && analysisData && (
        <SituationStickyNav
          activeSection={activeSection}
          onNavigate={handleNavigateSection}
          onReset={handleReset}
          onOpenChat={() => setIsChatOpen(true)}
          onExport={() => {
            const el = document.getElementById('export-dossier-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          hasDeadlines={Boolean(analysisData.deadlineFlags && analysisData.deadlineFlags.length > 0)}
          counts={{
            rights: analysisData.rights.length,
            roadmap: analysisData.roadmap.length,
            evidence: analysisData.documentsToGather.length,
            counselTriggers: analysisData.whenToCallLawyer.length,
          }}
        />
      )}

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8 flex-1">
        <ModeSwitcher />
        {/* Prominent Statutory Legal Disclaimer Card placed directly above viewports */}
        <LegalDisclaimerCard />

        {/* State 1: Idle / Intake */}
        {analysisState === 'idle' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono tracking-wide uppercase bg-[#FAF0EB] border border-[#F2D8CD] text-[#7D432D]">
                <span>Mode 2 · Situation Navigator</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
                Situation Intake &amp; Rights Evaluation
              </h1>
              <p className="text-sm text-stone-600 font-sans max-w-2xl leading-relaxed">
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

            <div id="export-dossier-section">
              <ExportDossierCard
                mode="situation"
                data={analysisData}
                metadata={{ description: submittedDescription }}
              />
            </div>

            <ChatTriggerButton
              onClick={() => setIsChatOpen(true)}
              isOpen={isChatOpen}
            />

            <ChatPanel
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              mode="situation"
              text={submittedDescription}
              analysis={analysisData}
              documentType={analysisData.disputeCategory}
            />
          </div>
        )}
      </main>
    </div>
  );
}
