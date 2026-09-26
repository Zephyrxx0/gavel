'use client';

/**
 * @file DocumentThumbnailBox.tsx
 * @description Interactive thumbnail preview container displaying either image scan
 * or styled paper sheet preview with keyboard accessibility and hover action indicator.
 */

import React from 'react';
import { Maximize2 } from 'lucide-react';
import { DocumentPaperThumbnail } from '@/components/decoder/DocumentPaperThumbnail';

export interface DocumentThumbnailBoxProps {
  fileName: string;
  isImage: boolean;
  isPdf: boolean;
  isDocx: boolean;
  fileObjectUrl?: string | null;
  rawBase64?: string;
  mimeType?: string;
  miniatureLines: string[];
  wordCount: number;
  onOpenDocument: () => void;
}

export function DocumentThumbnailBox({
  fileName,
  isImage,
  isPdf,
  isDocx,
  fileObjectUrl,
  rawBase64,
  mimeType,
  miniatureLines,
  wordCount,
  onOpenDocument,
}: DocumentThumbnailBoxProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open full document: ${fileName}`}
      onClick={onOpenDocument}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenDocument();
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
            (rawBase64
              ? `data:${mimeType || 'image/jpeg'};base64,${rawBase64}`
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
  );
}
