'use client';

import React, { useState } from 'react';
import { Header } from '@/components/shared/Header';
import { LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';
import { DocumentDropzone } from '@/components/upload/DocumentDropzone';
import { FilePreviewCard } from '@/components/upload/FilePreviewCard';
import { ManualPasteArea } from '@/components/upload/ManualPasteArea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UploadCloud, FileText, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
                    <Button
                      size="sm"
                      className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-8 text-xs px-3 self-end sm:self-auto"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                      Begin Mode 1 Analysis
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
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
                  <Button
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-9 text-xs px-4"
                  >
                    <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                    Begin Mode 1 Analysis
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
