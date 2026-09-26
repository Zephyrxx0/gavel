'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  ExternalLink,
  Copy,
  Check,
  Eye,
  ShieldCheck,
  Search,
  X,
  FileCode,
  FileDown,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadData } from '@/lib/schemas/upload';
import { formatFileSize } from '@/lib/image-utils';
import { copyToClipboard } from '@/lib/export-utils';
import { toast } from 'sonner';
import { DocumentPaperThumbnail } from '@/components/decoder/DocumentPaperThumbnail';

export interface UploadedDocumentCardProps {
  uploadedDoc: UploadData | null;
  manualText?: string;
  fileObjectUrl?: string | null;
}

export function UploadedDocumentCard({
  uploadedDoc,
  manualText = '',
  fileObjectUrl,
}: UploadedDocumentCardProps) {
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Handlers
  const handleOpenDocument = () => {
    if (fileObjectUrl) {
      window.open(fileObjectUrl, '_blank');
      return;
    }

    if (isImage && uploadedDoc?.rawBase64) {
      const imgWindow = window.open('');
      if (imgWindow) {
        imgWindow.document.write(
          `<html><head><title>${fileName}</title></head><body style="margin:0;background:#111;display:flex;align-items:center;justify-content:center;min-height:100vh;"><img src="data:${uploadedDoc.mimeType};base64,${uploadedDoc.rawBase64}" style="max-width:100%;max-height:100vh;object-fit:contain;box-shadow:0 4px 20px rgba(0,0,0,0.5);" /></body></html>`
        );
      }
      return;
    }

    if (fullText) {
      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return;
    }

    setIsReaderOpen(true);
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

  // Filtered text for the reader modal
  const filteredParagraphs = useMemo(() => {
    const paras = fullText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    if (!searchQuery.trim()) return paras;
    const q = searchQuery.toLowerCase();
    return paras.filter((p) => p.toLowerCase().includes(q));
  }, [fullText, searchQuery]);

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
          {/* Document Thumbnail Preview Frame */}
          <div
            role="button"
            tabIndex={0}
            aria-label={`Open full document: ${fileName}`}
            onClick={handleOpenDocument}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpenDocument();
              }
            }}
            className="group relative w-32 sm:w-36 md:w-40 aspect-[8.5/11] rounded-xl border border-stone-200/90 bg-white shadow-md overflow-hidden shrink-0 cursor-pointer transition-transform duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
            title="Click to view full document"
          >
            {/* 1. Image Thumbnail */}
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={
                  fileObjectUrl ||
                  (uploadedDoc?.rawBase64
                    ? `data:${uploadedDoc.mimeType};base64,${uploadedDoc.rawBase64}`
                    : '')
                }
                alt={fileName}
                className="w-full h-full object-cover"
              />
            ) : (
              /* 2. Styled Paper Sheet Thumbnail (PDF, DOCX, or Pasted Text) */
              <DocumentPaperThumbnail
                isPdf={isPdf}
                isDocx={isDocx}
                fileName={fileName}
                miniatureLines={miniatureLines}
                wordCount={wordCount}
              />
            )}

            {/* Hover Veil Action Indicator */}
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-1 z-10 p-2 text-center">
              <Maximize2 className="w-4 h-4 text-white" />
              <span className="text-[10px] font-sans font-medium leading-tight">
                Open Document
              </span>
            </div>
          </div>

          {/* Details & Excerpt */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h4 className="font-serif text-lg font-bold text-stone-900 truncate">
                {fileName}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono ${
                    isPdf
                      ? 'border-rose-200 text-rose-800 bg-rose-50'
                      : isDocx
                        ? 'border-blue-200 text-blue-800 bg-blue-50'
                        : isImage
                          ? 'border-amber-200 text-amber-800 bg-amber-50'
                          : 'border-stone-200 text-stone-700 bg-stone-50'
                  }`}
                >
                  {isPdf
                    ? 'PDF Document'
                    : isDocx
                      ? 'Word Document (.docx)'
                      : isImage
                        ? 'Image Scan / Photo'
                        : 'Manual Paste'}
                </Badge>

                {sizeBytes > 0 && (
                  <span className="text-xs font-mono text-stone-500">
                    {formatFileSize(sizeBytes)}
                  </span>
                )}

                <span className="text-stone-300">•</span>

                <span className="text-xs font-mono text-stone-500">
                  {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
                </span>
              </div>
            </div>

            {/* Excerpt box */}
            {previewSnippet && (
              <div className="rounded-xl bg-[#FAF9F5] border border-stone-200/80 p-3 text-xs text-stone-600 font-sans leading-relaxed select-text">
                <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 font-semibold block mb-1">
                  Preamble Excerpt
                </span>
                <p className="italic text-stone-700">&ldquo;{previewSnippet}&rdquo;</p>
              </div>
            )}

            {/* Micro action row */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition-colors font-sans py-1 px-2 rounded-md hover:bg-stone-100"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">Copied Text</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Full Text</span>
                  </>
                )}
              </button>

              <span className="text-stone-300">•</span>

              <button
                type="button"
                onClick={() => setIsReaderOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition-colors font-sans py-1 px-2 rounded-md hover:bg-stone-100"
              >
                <Eye className="w-3.5 h-3.5 text-stone-500" />
                <span>Expand Full Document Reader</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Full Document Reader Modal */}
      {isReaderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Document Reader"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsReaderOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl border border-stone-200 shadow-2xl flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-white/95 backdrop-blur flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 truncate">
                    {fileName}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {wordCount.toLocaleString()} words
                  </Badge>
                </div>
                <p className="text-xs text-stone-500 font-sans">
                  Original text extracted in volatile memory
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  className="h-8 text-xs gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </Button>

                {fileObjectUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(fileObjectUrl, '_blank')}
                    className="h-8 text-xs gap-1.5"
                    title="Open original file in new browser window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Open Original</span>
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => setIsReaderOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                  aria-label="Close document reader"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search filter bar */}
            <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex items-center gap-2">
              <Search className="w-4 h-4 text-stone-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords or clauses in document text..."
                className="w-full bg-transparent text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-700 text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 font-sans text-xs sm:text-sm text-stone-800 leading-relaxed select-text bg-[#FAF9F6]">
              {filteredParagraphs.length > 0 ? (
                filteredParagraphs.map((para, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-stone-200/70 shadow-2xs"
                  >
                    <span className="text-[10px] font-mono text-stone-400 block mb-1">
                      ¶ {idx + 1}
                    </span>
                    <p className="whitespace-pre-wrap">{para}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-stone-400">
                  <p className="text-sm">No matching paragraphs found for &ldquo;{searchQuery}&rdquo;</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-5 border-t border-stone-200 bg-white flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-mono">Zero-Disk Ephemeral Security</span>
              <span>Advocates Act, 1961 Compliance</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
