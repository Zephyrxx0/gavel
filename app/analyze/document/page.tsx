'use client';

import React, { useState, useCallback } from 'react';
import { Header } from '@/components/shared/Header';
import { LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';
import { DocumentDropzone } from '@/components/upload/DocumentDropzone';
import { ManualPasteArea } from '@/components/upload/ManualPasteArea';
import { FilePreviewCard } from '@/components/upload/FilePreviewCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Zap, ArrowRight } from 'lucide-react';
import { UploadData } from '@/lib/schemas/upload';
import { DocumentAnalysis } from '@/lib/schemas/document';
import { DownsampleResult } from '@/lib/image-utils';

import { StickyNav } from '@/components/decoder/StickyNav';
import { ExecutiveSummaryCard } from '@/components/decoder/ExecutiveSummaryCard';
import { RiskScorecard } from '@/components/decoder/RiskScorecard';
import { ActionChecklist } from '@/components/decoder/ActionChecklist';
import { LawyerPrepGuide } from '@/components/decoder/LawyerPrepGuide';
import { AnalysisProgress } from '@/components/decoder/AnalysisProgress';
import { AnalysisErrorCard } from '@/components/decoder/AnalysisErrorCard';

type AnalysisState = 'idle' | 'analyzing' | 'dossier' | 'error';

export default function DocumentDecoderPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [uploadedDoc, setUploadedDoc] = useState<UploadData | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<DownsampleResult | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<DocumentAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('summary-section');

  const handleStartAnalysis = useCallback(async () => {
    setAnalysisState('analyzing');
    setErrorMessage('');

    try {
      const payload: { text?: string; imageBase64?: string; mimeType?: string; fileName?: string } = {};

      if (uploadedDoc) {
        if (uploadedDoc.isImage) {
          payload.imageBase64 = uploadedDoc.rawBase64;
          payload.mimeType = uploadedDoc.mimeType;
          payload.fileName = uploadedDoc.fileName;
        } else {
          payload.text = uploadedDoc.text;
          payload.fileName = uploadedDoc.fileName;
        }
      } else if (manualText.trim()) {
        payload.text = manualText.trim();
        payload.fileName = 'manual-input.txt';
      } else {
        throw new Error('No document content or text provided for analysis.');
      }

      const res = await fetch('/api/analyze/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
  }, [uploadedDoc, manualText]);

  const handleClauseCrossReference = useCallback((clauseId: string) => {
    const el = document.getElementById(`clause-${clauseId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#D4AF37]', 'bg-[#D4AF37]/10');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#D4AF37]', 'bg-[#D4AF37]/10');
      }, 1800);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisData(null);
    setUploadedDoc(null);
    setCompressionInfo(null);
    setManualText('');
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
    <div className="min-h-screen bg-legal-obsidian text-foreground flex flex-col">
      <Header />

      {analysisState === 'dossier' && analysisData && (
        <StickyNav
          activeSection={activeSection}
          onNavigate={handleNavigateSection}
          onReset={handleReset}
          counts={{
            risks: analysisData.clauses.length,
            checklist: analysisData.checklist.length,
            lawyerQuestions: analysisData.lawyerQuestions.length,
          }}
        />
      )}

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        <LegalDisclaimerCard />

        {analysisState === 'idle' && (
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/70 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                Document Intake & Analysis Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Upload a lease, contract, or notice — or paste clause text directly for instant evaluation.
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'upload' | 'manual')}
              className="w-full space-y-5"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-900 border-slate-800">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Paste Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                {uploadedDoc ? (
                  <div className="space-y-4">
                    <FilePreviewCard
                      fileName={uploadedDoc.fileName}
                      sizeBytes={uploadedDoc.sizeBytes}
                      wordCount={uploadedDoc.wordCount}
                      mimeType={uploadedDoc.mimeType}
                      isImage={uploadedDoc.isImage}
                      compressionInfo={compressionInfo}
                      onRemove={() => setUploadedDoc(null)}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleStartAnalysis}
                        className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-9 text-xs px-4"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                        Analyze Legal Document
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DocumentDropzone
                    onUploadSuccess={(data, comp) => {
                      setUploadedDoc(data);
                      setCompressionInfo(comp || null);
                    }}
                    onFallbackToManual={(reason) => {
                      setFallbackNotice(reason);
                      setActiveTab('manual');
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <ManualPasteArea
                  value={manualText}
                  onChange={setManualText}
                  fallbackNotice={fallbackNotice}
                  onClearFallbackNotice={() => setFallbackNotice(null)}
                />
                {manualText.trim().length >= 30 && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleStartAnalysis}
                      className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-9 text-xs px-4"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                      Analyze Legal Document
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {analysisState === 'analyzing' && <AnalysisProgress />}

        {analysisState === 'error' && (
          <AnalysisErrorCard
            errorMessage={errorMessage}
            onRetry={handleStartAnalysis}
            onAdjustInput={() => setAnalysisState('idle')}
          />
        )}

        {analysisState === 'dossier' && analysisData && (
          <div className="space-y-12">
            <ExecutiveSummaryCard
              documentType={analysisData.documentType}
              parties={analysisData.parties}
              summary={analysisData.summary}
            />

            <RiskScorecard clauses={analysisData.clauses} />

            <ActionChecklist
              checklist={analysisData.checklist}
              onClauseCrossReference={handleClauseCrossReference}
            />

            <LawyerPrepGuide
              lawyerQuestions={analysisData.lawyerQuestions}
              onClauseCrossReference={handleClauseCrossReference}
            />
          </div>
        )}
      </main>
    </div>
  );
}
