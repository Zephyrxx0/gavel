'use client';

import React, { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';
import { DocumentDropzone } from '@/components/upload/DocumentDropzone';
import { FilePreviewCard } from '@/components/upload/FilePreviewCard';
import { ManualPasteArea } from '@/components/upload/ManualPasteArea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UploadCloud, FileText, ArrowRight, ShieldCheck, Zap, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UploadData } from '@/lib/schemas/upload';
import { DownsampleResult } from '@/lib/image-utils';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [uploadedDoc, setUploadedDoc] = useState<UploadData | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<DownsampleResult | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);

  const handleUploadSuccess = (data: UploadData, compression?: DownsampleResult | null) => {
    setUploadedDoc(data);
    setCompressionInfo(compression || null);
    setFallbackNotice(null);
  };

  const handleFallbackToManual = (reason: string) => {
    setFallbackNotice(reason);
    setActiveTab('manual');
  };

  const handleRemoveFile = () => {
    setUploadedDoc(null);
    setCompressionInfo(null);
  };

  return (
    <div className="min-h-screen bg-legal-obsidian text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Prominent Statutory Legal Disclaimer Card placed directly above analysis viewports per D-05 */}
        <LegalDisclaimerCard />

        {/* Mode Discovery Grid: Mode 2 & Mode 3 Side-by-Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Mode 2: Situation Navigator Discovery Card */}
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#111827] via-[#161f30] to-[#111827] p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between gap-5 transition-all hover:border-[#D4AF37]/50">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full">
                  Mode 2 · Situation Navigator
                </span>
                <span className="text-xs text-slate-400">No document needed</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
                I have a legal situation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Describe an ongoing dispute or legal dilemma in plain English to evaluate your rights, next steps, and evidence.
              </p>
            </div>

            <Link href="/analyze/situation" className="w-full">
              <Button
                size="default"
                className="w-full bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-10 px-4 text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>Situation Navigator</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mode 3: Document Comparison Discovery Card */}
          <div className="rounded-2xl border border-[#1E293B] bg-gradient-to-r from-[#111827] via-[#151c2c] to-[#111827] p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between gap-5 transition-all hover:border-[#D4AF37]/40">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#D4AF37] uppercase tracking-wider bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-2.5 py-0.5 rounded-full">
                  Mode 3 · Compare Agreements
                </span>
                <ArrowLeftRight className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
                Compare Two Contracts
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                Upload two contract versions to detect clause discrepancies, favorability shifts, and negotiation leverage.
              </p>
            </div>

            <Link href="/analyze/compare" className="w-full">
              <Button
                size="default"
                variant="outline"
                className="w-full border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:text-white font-semibold h-10 px-4 text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Compare Documents</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Ingestion & Document Intake Container */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/70 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                Document Intake & Analysis Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Upload a lease, contract, or notice — or paste clause text directly for instant evaluation.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-center">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero Disk Retention
              </span>
            </div>
          </div>

          {/* Mode Switch Tabs (Radix) */}
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'upload' | 'manual')}
            className="w-full space-y-5"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-900 border-slate-800">
              <TabsTrigger
                value="upload"
                className="flex items-center gap-2 data-[state=active]:bg-[#0B0F17] data-[state=active]:text-[#D4AF37]"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Document
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex items-center gap-2 data-[state=active]:bg-[#0B0F17] data-[state=active]:text-[#D4AF37]"
              >
                <FileText className="w-4 h-4" />
                Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4 focus-visible:outline-none">
              {uploadedDoc ? (
                <div className="space-y-4">
                  <FilePreviewCard
                    fileName={uploadedDoc.fileName}
                    sizeBytes={uploadedDoc.sizeBytes}
                    wordCount={uploadedDoc.wordCount}
                    mimeType={uploadedDoc.mimeType}
                    isImage={uploadedDoc.isImage}
                    compressionInfo={compressionInfo}
                    onRemove={handleRemoveFile}
                  />
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <span>
                      Extracted <strong className="text-slate-200">{uploadedDoc.wordCount.toLocaleString()} words</strong> across volatile memory buffers.
                    </span>
                    <Link href="/analyze/document">
                      <Button
                        size="sm"
                        className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-8 text-xs px-3 self-end sm:self-auto"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                        Begin Mode 1 Analysis
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <DocumentDropzone
                  onUploadSuccess={handleUploadSuccess}
                  onFallbackToManual={handleFallbackToManual}
                />
              )}
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 focus-visible:outline-none">
              <ManualPasteArea
                value={manualText}
                onChange={setManualText}
                fallbackNotice={fallbackNotice}
                onClearFallbackNotice={() => setFallbackNotice(null)}
              />
              {manualText.trim().length >= 50 && (
                <div className="flex justify-end pt-2">
                  <Link href="/analyze/document">
                    <Button
                      size="sm"
                      className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-9 text-xs px-4"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                      Begin Mode 1 Analysis
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
