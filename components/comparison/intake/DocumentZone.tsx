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
  const [fileObjectUrl, setFileObjectUrl] = useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (fileObjectUrl) {
        URL.revokeObjectURL(fileObjectUrl);
      }
    };
  }, [fileObjectUrl]);

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
        'relative rounded-2xl border p-5 sm:p-6 transition-all duration-200 flex flex-col',
        errorMessage
          ? 'border-red-300 bg-red-50/30'
          : hasContent
          ? 'border-blue-200 bg-white shadow-sm'
          : 'border-stone-200/80 bg-white hover:border-stone-300'
      )}
    >
      {/* Zone Header: Custom Label + Stats */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          {isEditingLabel ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempLabel}
                aria-label="Document label"
                onChange={(e) => setTempLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLabel();
                  if (e.key === 'Escape') {
                    setIsEditingLabel(false);
                    setTempLabel(label);
                  }
                }}
                className="bg-stone-50 border border-stone-300 text-sm font-semibold text-stone-900 px-2 py-0.5 rounded focus:outline-none focus:ring-1 focus:ring-stone-500 max-w-[180px]"
                autoFocus
              />
              <button
                type="button"
                onClick={handleSaveLabel}
                className="text-stone-700 hover:text-stone-900 p-1"
                aria-label="Save label"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-semibold text-stone-900 uppercase tracking-wider truncate">
                {label || defaultLabel}
              </span>
              {onLabelChange && (
                <button
                  type="button"
                  onClick={() => {
                    setTempLabel(label || defaultLabel);
                    setIsEditingLabel(true);
                  }}
                  className="text-stone-400 hover:text-stone-700 p-1 transition-colors"
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
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-0.5 text-xs font-mono text-stone-700">
            <FileText className="w-3 h-3 text-stone-500" />
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
              rawBase64={uploadedDoc.rawBase64}
              text={uploadedDoc.text}
              fileObjectUrl={fileObjectUrl}
              onRemove={() => {
                if (fileObjectUrl) {
                  URL.revokeObjectURL(fileObjectUrl);
                  setFileObjectUrl(null);
                }
                onRemove();
              }}
            />
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as 'upload' | 'paste')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3 bg-stone-100/80 border border-stone-200/70 p-1 rounded-xl">
              <TabsTrigger
                value="upload"
                className="text-xs rounded-lg text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
              >
                Upload File (PDF/DOCX/Scan)
              </TabsTrigger>
              <TabsTrigger
                value="paste"
                className="text-xs rounded-lg text-stone-600 data-[state=active]:bg-white data-[state=active]:text-stone-900 data-[state=active]:shadow-sm"
              >
                Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0 focus-visible:outline-none">
              <DocumentDropzone
                onUploadSuccess={(data, _comp, rawFile) => {
                  if (rawFile) {
                    if (fileObjectUrl) {
                      URL.revokeObjectURL(fileObjectUrl);
                    }
                    setFileObjectUrl(URL.createObjectURL(rawFile));
                  }
                  onUploadSuccess(data);
                }}
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
        <p className="mt-2 text-xs text-rose-600 font-medium">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

