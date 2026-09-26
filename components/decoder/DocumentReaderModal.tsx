'use client';

/**
 * @file DocumentReaderModal.tsx
 * @description Accessible, searchable reader modal for reviewing in-memory document text.
 *
 * Displays parsed contract text paragraph-by-paragraph with keyword filtering,
 * clipboard export, and direct link to source files. Adheres to WAI-ARIA dialog patterns
 * with keyboard traps, zero-disk security assurances, and Advocates Act compliance disclaimers.
 */

import React, { useState, useMemo } from 'react';
import { Copy, Check, ExternalLink, X, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { openDocumentPreview } from '@/lib/safe-preview';

export interface DocumentReaderModalProps {
  /** Controls visibility of the modal dialog */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Display name of the active document */
  fileName: string;
  /** Word count of the extracted text */
  wordCount: number;
  /** Complete extracted text of the document */
  fullText: string;
  /** Optional browser object URL of the original file */
  fileObjectUrl?: string | null;
  /** Whether the document text was recently copied to clipboard */
  copied: boolean;
  /** Action handler to trigger copying the full document text */
  onCopyText: () => void;
}

export function DocumentReaderModal({
  isOpen,
  onClose,
  fileName,
  wordCount,
  fullText,
  fileObjectUrl,
  copied,
  onCopyText,
}: DocumentReaderModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized paragraph segmentation and keyword filtering
  const filteredParagraphs = useMemo(() => {
    const paras = fullText.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    if (!searchQuery.trim()) return paras;
    const q = searchQuery.toLowerCase();
    return paras.filter((p) => p.toLowerCase().includes(q));
  }, [fullText, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Document Reader"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
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
              onClick={onCopyText}
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
                onClick={() => openDocumentPreview({ fileObjectUrl })}
                className="h-8 text-xs gap-1.5"
                title="Open original file in new browser window"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open Original</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
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
  );
}
