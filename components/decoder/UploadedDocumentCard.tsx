'use client';

/**
 * @file UploadedDocumentCard.tsx
 * @description Card component displaying metadata, thumbnail preview, and reader trigger
 * for the source agreement analyzed during document decoding.
 *
 * Adheres to zero-disk ephemeral processing requirements: documents reside strictly
 * in client state or volatile memory. Orchestrates thumbnail previews, metadata details,
 * and the accessible in-memory reader modal.
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  ExternalLink,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadData } from '@/lib/schemas/upload';
import { copyToClipboard } from '@/lib/export-utils';
import { toast } from 'sonner';
import { DocumentThumbnailBox } from '@/components/decoder/DocumentThumbnailBox';
import { DocumentMetadataDetails } from '@/components/decoder/DocumentMetadataDetails';
import { DocumentReaderModal } from '@/components/decoder/DocumentReaderModal';
import { openDocumentPreview } from '@/lib/safe-preview';

export interface UploadedDocumentCardProps {
  /** Uploaded document metadata payload */
  uploadedDoc: UploadData | null;
  /** Fallback raw text if user pasted directly */
  manualText?: string;
  /** Browser object URL of original uploaded file */
  fileObjectUrl?: string | null;
}

export function UploadedDocumentCard({
  uploadedDoc,
  manualText = '',
  fileObjectUrl,
}: UploadedDocumentCardProps) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isImage = Boolean(
    uploadedDoc?.isImage ||
    uploadedDoc?.mimeType?.startsWith('image/')
  );

  const isPdf = Boolean(
    uploadedDoc?.mimeType === 'application/pdf' ||
    uploadedDoc?.fileName?.toLowerCase().endsWith('.pdf')
  );

  const isDocx = Boolean(
    uploadedDoc?.mimeType?.includes('wordprocessingml') ||
    uploadedDoc?.fileName?.toLowerCase().endsWith('.docx')
  );

  const fileName = uploadedDoc?.fileName || 'Pasted Legal Text';
  const fullText = uploadedDoc?.text || manualText || '';
  const wordCount = uploadedDoc?.wordCount ?? (fullText.trim() ? fullText.trim().split(/\s+/).length : 0);
  const sizeBytes = uploadedDoc?.sizeBytes ?? (fullText ? new Blob([fullText]).size : 0);

  // Compute a preview snippet of the first few sentences
  const previewSnippet = useMemo(() => {
    if (!fullText) return '';
    return fullText.slice(0, 240).replace(/\s+/g, ' ').trim() + (fullText.length > 240 ? '…' : '');
  }, [fullText]);

  // Compute miniature lines of text for document paper thumbnail
  const miniatureLines = useMemo(() => {
    if (!fullText) return [];
    return fullText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, 10);
  }, [fullText]);

  // Document preview handler delegating to safe memory-managed helper
  const handleOpenDocument = () => {
    const opened = openDocumentPreview({
      fileObjectUrl,
      isImage,
      rawBase64: uploadedDoc?.rawBase64,
      mimeType: uploadedDoc?.mimeType,
      text: fullText,
    });

    if (!opened) {
      setIsReaderOpen(true);
    }
  };

  const handleCopyText = async () => {
    if (!fullText) return;
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopied(true);
      toast.success('Document text copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <section
        id="uploaded-document-section"
        className="rounded-2xl border border-stone-200/90 bg-white p-5 sm:p-6 shadow-card-soft space-y-4 transition-all duration-200"
      >
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF3EE] border border-[#D0E2D6] flex items-center justify-center text-[#264D34] shrink-0">
              <FileText className="w-4 h-4 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  Source Agreement
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-emerald-800 font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Zero-Disk Vault
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans">
                Active document analyzed in volatile RAM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenDocument}
              className="text-xs font-medium h-8 px-3 border-stone-200 hover:bg-stone-50 text-stone-800 flex items-center gap-1.5 rounded-lg shadow-2xs"
              title="Open document in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              <span>Open Document</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReaderOpen(true)}
              className="text-xs font-medium h-8 px-3 border-stone-200 hover:bg-stone-50 text-stone-800 flex items-center gap-1.5 rounded-lg shadow-2xs"
              title="View full extracted text"
            >
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              <span>Read Text</span>
            </Button>
          </div>
        </div>

        {/* Content body: Thumbnail + Details */}
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <DocumentThumbnailBox
            fileName={fileName}
            isImage={isImage}
            isPdf={isPdf}
            isDocx={isDocx}
            fileObjectUrl={fileObjectUrl}
            rawBase64={uploadedDoc?.rawBase64}
            mimeType={uploadedDoc?.mimeType}
            miniatureLines={miniatureLines}
            wordCount={wordCount}
            onOpenDocument={handleOpenDocument}
          />

          <DocumentMetadataDetails
            fileName={fileName}
            isPdf={isPdf}
            isDocx={isDocx}
            isImage={isImage}
            sizeBytes={sizeBytes}
            wordCount={wordCount}
            previewSnippet={previewSnippet}
            copied={copied}
            onCopyText={handleCopyText}
            onOpenReader={() => setIsReaderOpen(true)}
          />
        </div>
      </section>

      {/* Extracted Document Reader Dialog */}
      <DocumentReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        fileName={fileName}
        wordCount={wordCount}
        fullText={fullText}
        fileObjectUrl={fileObjectUrl}
        copied={copied}
        onCopyText={handleCopyText}
      />
    </>
  );
}
