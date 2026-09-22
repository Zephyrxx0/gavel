'use client';

import React, { useState } from 'react';
import { Edit2, Check, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DocumentDropzone } from '@/components/upload/DocumentDropzone';
import { ManualPasteArea } from '@/components/upload/ManualPasteArea';
import { FilePreviewCard } from '@/components/upload/FilePreviewCard';
import { UploadData } from '@/lib/schemas/upload';
import { countWords } from '@/lib/text-utils';
import { cn } from '@/lib/utils';

export interface DocumentZoneProps {
  zoneId: 'docA' | 'docB';
  label: string;
  defaultLabel: string;
  onLabelChange?: (newLabel: string) => void;
  uploadedDoc: UploadData | null;
  manualText: string;
  onUploadSuccess: (data: UploadData) => void;
  onTextChange: (text: string) => void;
  onRemove: () => void;
  onFallbackToManual: (reason: string) => void;
  disabled?: boolean;
  errorMessage?: string | null;
}

export function DocumentZone({
  zoneId,
  label,
  defaultLabel,
  onLabelChange,
  uploadedDoc,
  manualText,
  onUploadSuccess,
  onTextChange,
  onRemove,
  onFallbackToManual,
  disabled = false,
  errorMessage = null,
}: DocumentZoneProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [tempLabel, setTempLabel] = useState(label);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>(manualText ? 'paste' : 'upload');

  const wordCount = uploadedDoc ? uploadedDoc.wordCount : countWords(manualText);
  const hasContent = Boolean(uploadedDoc || manualText.trim().length >= 30);

  const handleSaveLabel = () => {
    setIsEditingLabel(false);
    if (tempLabel.trim() && onLabelChange) {
      onLabelChange(tempLabel.trim());
    } else {
      setTempLabel(label);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-[#111827]/50 p-4 sm:p-5 transition-all duration-200 flex flex-col',
        errorMessage
          ? 'border-red-500/50 bg-red-950/10'
          : hasContent
          ? 'border-[#D4AF37]/35 shadow-md shadow-[#D4AF37]/5'
          : 'border-[#1E293B] hover:border-slate-700'
      )}
    >
      {/* Zone Header: Custom Label + Stats */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
          {isEditingLabel ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempLabel}
                onChange={(e) => setTempLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLabel();
                  if (e.key === 'Escape') {
                    setIsEditingLabel(false);
                    setTempLabel(label);
                  }
                }}
                className="bg-[#0B0F17] border border-[#D4AF37]/50 text-sm font-semibold text-white px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-[#D4AF37] max-w-[180px]"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveLabel}
                className="text-[#D4AF37] hover:text-[#C5A059] p-1"
                aria-label="Save label"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-[#D4AF37] uppercase tracking-wider truncate">
                {label || defaultLabel}
              </span>
              {onLabelChange && (
                <button
                  type="button"
                  onClick={() => {
                    setTempLabel(label || defaultLabel);
                    setIsEditingLabel(true);
                  }}
                  className="text-slate-500 hover:text-[#D4AF37] p-1 transition-colors"
                  aria-label="Edit label"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Word Count / Status Badge */}
        {hasContent && (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-700/60 bg-[#0B0F17] px-2.5 py-0.5 text-xs font-mono text-slate-300">
            <FileText className="w-3 h-3 text-[#D4AF37]" />
            {wordCount} words
          </span>
        )}
      </div>

      {/* Zone Body: Upload / Preview / Paste */}
      <div className="flex-1 flex flex-col justify-center">
        {uploadedDoc ? (
          <div className="w-full">
            <FilePreviewCard
              fileName={uploadedDoc.fileName}
              sizeBytes={uploadedDoc.sizeBytes}
              wordCount={uploadedDoc.wordCount}
              mimeType={uploadedDoc.mimeType}
              isImage={uploadedDoc.isImage}
              onRemove={onRemove}
            />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'upload' | 'paste')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3 bg-[#0B0F17] border border-[#1E293B]">
              <TabsTrigger
                value="upload"
                className="text-xs data-[state=active]:bg-[#111827] data-[state=active]:text-[#D4AF37]"
              >
                Upload File (PDF/DOCX/Scan)
              </TabsTrigger>
              <TabsTrigger
                value="paste"
                className="text-xs data-[state=active]:bg-[#111827] data-[state=active]:text-[#D4AF37]"
              >
                Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0 focus-visible:outline-none">
              <DocumentDropzone
                onUploadSuccess={onUploadSuccess}
                onFallbackToManual={onFallbackToManual}
                disabled={disabled}
              />
            </TabsContent>

            <TabsContent value="paste" className="mt-0 focus-visible:outline-none">
              <ManualPasteArea
                value={manualText}
                onChange={onTextChange}
                disabled={disabled}
                placeholder={`Paste the full text or key excerpts of ${label || defaultLabel}...`}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <p className="mt-2 text-xs text-red-400 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

