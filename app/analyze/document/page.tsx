'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { ModeSwitcher } from '@/components/shared/ModeSwitcher';
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
import {
  SESSION_KEYS,
  saveSessionAnalysis,
  loadSessionAnalysis,
  clearSessionAnalysis,
} from '@/lib/session-vault';

import { StickyNav } from '@/components/decoder/StickyNav';
import { UploadedDocumentCard } from '@/components/decoder/UploadedDocumentCard';
import { ExecutiveSummaryCard } from '@/components/decoder/ExecutiveSummaryCard';
import { RiskScorecard } from '@/components/decoder/RiskScorecard';
import { ActionChecklist } from '@/components/decoder/ActionChecklist';
import { LawyerPrepGuide } from '@/components/decoder/LawyerPrepGuide';
import { AnalysisProgress } from '@/components/decoder/AnalysisProgress';
import { AnalysisErrorCard } from '@/components/decoder/AnalysisErrorCard';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { ChatTriggerButton } from '@/components/chat/ChatTriggerButton';
import { ExportDossierCard } from '@/components/export/ExportDossierCard';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);

  // Restore active review session when switching between ModeSwitcher tabs
  useEffect(() => {
    const saved = loadSessionAnalysis<{
      analysisData: DocumentAnalysis;
      uploadedDoc: UploadData | null;
      manualText: string;
    }>(SESSION_KEYS.DOCUMENT);

    if (saved && saved.analysisData) {
      setAnalysisData(saved.analysisData);
      setUploadedDoc(saved.uploadedDoc);
      setManualText(saved.manualText || '');
      setAnalysisState('dossier');
    }
  }, []);

  const handleStartAnalysis = useCallback(async () => {
    // Purge previous review session when user initiates a new review
    clearSessionAnalysis(SESSION_KEYS.DOCUMENT);
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

      // Persist completed review in session storage so it survives ModeSwitcher tab switches
      saveSessionAnalysis(SESSION_KEYS.DOCUMENT, {
        analysisData: json.data,
        uploadedDoc,
        manualText,
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setAnalysisState('error');
    }
  }, [uploadedDoc, manualText]);

  const handleClauseCrossReference = useCallback((clauseId: string) => {
    const el = document.getElementById(`clause-${clauseId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-stone-400', 'bg-[#EBF3EE]');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-stone-400', 'bg-[#EBF3EE]');
      }, 1800);
    }
  }, []);

  const handleReset = useCallback(() => {
    // Purge session when user deletes/resets the review
    clearSessionAnalysis(SESSION_KEYS.DOCUMENT);
    if (fileObjectUrl) {
      URL.revokeObjectURL(fileObjectUrl);
    }
    setFileObjectUrl(null);
    setAnalysisData(null);
    setUploadedDoc(null);
    setCompressionInfo(null);
    setManualText('');
    setAnalysisState('idle');
  }, [fileObjectUrl]);

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

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1">
        {analysisState === 'dossier' && analysisData && (
          <StickyNav
            activeSection={activeSection}
            onNavigate={handleNavigateSection}
            onReset={handleReset}
            onOpenChat={() => setIsChatOpen(true)}
            onExport={() => {
              const el = document.getElementById('export-dossier-section');
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            counts={{
              risks: analysisData.clauses.length,
              checklist: analysisData.checklist.length,
              lawyerQuestions: analysisData.lawyerQuestions.length,
            }}
          />
        )}

        <ModeSwitcher />
        <LegalDisclaimerCard />

        {analysisState === 'idle' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono tracking-wide uppercase bg-[#EBF3EE] border border-[#D0E2D6] text-[#264D34]">
                <span>Mode 1 · Document Decoder</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-stone-900 tracking-tight">
                Contract Intake &amp; Risk Triage
              </h1>
              <p className="text-sm text-stone-600 font-sans max-w-2xl leading-relaxed">
                Upload a lease, contract, or notice — or paste clause text directly for instant evaluation.
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'upload' | 'manual')}
              className="w-full space-y-5"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-xs bg-stone-100 p-1 border border-stone-200/80 rounded-xl">
                <TabsTrigger value="upload" className="flex items-center gap-2 text-xs">
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5" />
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
                      rawBase64={uploadedDoc.rawBase64}
                      text={uploadedDoc.text}
                      fileObjectUrl={fileObjectUrl}
                      compressionInfo={compressionInfo}
                      onRemove={() => {
                        if (fileObjectUrl) {
                          URL.revokeObjectURL(fileObjectUrl);
                          setFileObjectUrl(null);
                        }
                        setUploadedDoc(null);
                      }}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleStartAnalysis}
                        className="bg-stone-900 hover:bg-stone-800 text-white font-medium h-10 px-5 text-xs shadow-sm flex items-center gap-2 rounded-xl"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        Analyze Legal Document
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DocumentDropzone
                    onUploadSuccess={(data, comp, rawFile) => {
                      setUploadedDoc(data);
                      setCompressionInfo(comp || null);
                      if (rawFile) {
                        if (fileObjectUrl) {
                          URL.revokeObjectURL(fileObjectUrl);
                        }
                        setFileObjectUrl(URL.createObjectURL(rawFile));
                      }
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
                      className="bg-stone-900 hover:bg-stone-800 text-white font-medium h-10 px-5 text-xs shadow-sm flex items-center gap-2 rounded-xl"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1" />
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
          <div className="space-y-8 sm:space-y-10">
            <UploadedDocumentCard
              uploadedDoc={uploadedDoc}
              manualText={manualText}
              fileObjectUrl={fileObjectUrl}
            />

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

            <div id="export-dossier-section">
              <ExportDossierCard
                mode="document"
                data={analysisData}
                metadata={{ fileName: uploadedDoc?.fileName || 'document.txt' }}
              />
            </div>

            <ChatTriggerButton
              onClick={() => setIsChatOpen(true)}
              isOpen={isChatOpen}
            />

            <ChatPanel
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
              mode="document"
              text={uploadedDoc?.text || manualText}
              analysis={analysisData}
              documentType={analysisData.documentType}
              parties={analysisData.parties}
            />
          </div>
        )}
      </main>
    </div>
  );
}

