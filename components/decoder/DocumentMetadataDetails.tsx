'use client';

/**
 * @file DocumentMetadataDetails.tsx
 * @description Presentational component rendering document metadata badges,
 * preamble preview excerpt, and clipboard/reader action buttons.
 */

import React from 'react';
import { Copy, Check, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/image-utils';

export interface DocumentMetadataDetailsProps {
  fileName: string;
  isPdf: boolean;
  isDocx: boolean;
  isImage: boolean;
  sizeBytes: number;
  wordCount: number;
  previewSnippet: string;
  copied: boolean;
  onCopyText: () => void;
  onOpenReader: () => void;
}

export function DocumentMetadataDetails({
  fileName,
  isPdf,
  isDocx,
  isImage,
  sizeBytes,
  wordCount,
  previewSnippet,
  copied,
  onCopyText,
  onOpenReader,
}: DocumentMetadataDetailsProps) {
  return (
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
          onClick={onCopyText}
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
          onClick={onOpenReader}
          className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 transition-colors font-sans py-1 px-2 rounded-md hover:bg-stone-100"
        >
          <Eye className="w-3.5 h-3.5 text-stone-500" />
          <span>Expand Full Document Reader</span>
        </button>
      </div>
    </div>
  );
}
