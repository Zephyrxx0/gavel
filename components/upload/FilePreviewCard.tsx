'use client';

import React from 'react';
import { FileText, Image as ImageIcon, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/image-utils';
import { openDocumentPreview } from '@/lib/safe-preview';

export interface FilePreviewCardProps {
  fileName: string;
  sizeBytes: number;
  wordCount: number;
  mimeType: string;
  isImage?: boolean;
  rawBase64?: string;
  text?: string;
  fileObjectUrl?: string | null;
  compressionInfo?: {
    wasCompressed: boolean;
    originalSize: number;
    compressedSize: number;
  } | null;
  onRemove: () => void;
}

export function FilePreviewCard({
  fileName,
  sizeBytes,
  wordCount,
  mimeType,
  isImage = false,
  rawBase64,
  text = '',
  fileObjectUrl,
  compressionInfo,
  onRemove,
}: FilePreviewCardProps) {
  const isImg = isImage || mimeType.startsWith('image/');
  const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
  const isDocx = mimeType.includes('wordprocessingml') || fileName.toLowerCase().endsWith('.docx');

  const handleOpen = () => {
    openDocumentPreview({
      fileObjectUrl,
      isImage: isImg,
      rawBase64,
      mimeType,
      text,
    });
  };

  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Document Thumbnail Preview */}
        <div
          onClick={handleOpen}
          className="group relative flex-shrink-0 w-14 h-16 sm:w-16 sm:h-20 rounded-xl bg-white border border-stone-200 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          title="Click to open attached document"
        >
          {isImg && (fileObjectUrl || rawBase64) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fileObjectUrl || `data:${mimeType};base64,${rawBase64}`}
              alt={fileName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full p-1.5 flex flex-col justify-between bg-[#FAF9F5] text-stone-800 text-[5px] font-mono leading-none select-none">
              <div>
                <div
                  className={`h-1 -mx-1.5 -mt-1.5 mb-1 ${
                    isPdf ? 'bg-rose-600' : isDocx ? 'bg-blue-600' : 'bg-stone-500'
                  }`}
                />
                <span className="font-bold text-[6px] text-stone-900 block truncate">
                  {isPdf ? 'PDF' : isDocx ? 'DOCX' : 'DOC'}
                </span>
                <div className="mt-1 space-y-0.5 opacity-60">
                  <div className="h-0.5 bg-stone-300 rounded w-full" />
                  <div className="h-0.5 bg-stone-300 rounded w-4/5" />
                  <div className="h-0.5 bg-stone-300 rounded w-3/5" />
                </div>
              </div>
              <span className="text-[5px] text-stone-400">Preview</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <span className="text-[9px] font-medium">Open</span>
          </div>
        </div>

        {/* File Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-stone-900 truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
              {fileName}
            </h4>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-500">
            <span className="font-mono text-stone-700">
              {formatFileSize(sizeBytes)}
            </span>

            <span className="text-stone-300">•</span>

            {isImg ? (
              <Badge variant="outline" className="text-[11px] font-mono border-amber-200 text-amber-800 bg-amber-50">
                Visual OCR Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] font-mono border-stone-200 text-stone-700 bg-stone-50">
                {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
              </Badge>
            )}

            {compressionInfo?.wasCompressed && (
              <Badge
                variant="outline"
                className="text-[11px] font-mono border-emerald-200 text-emerald-800 bg-emerald-50 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Compressed ({formatFileSize(compressionInfo.originalSize)} → {formatFileSize(compressionInfo.compressedSize)})
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Open & Remove */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpen}
          className="text-stone-700 hover:bg-stone-50 transition-colors h-8 px-2.5 text-xs"
          title="Open document in a new tab"
        >
          Open Document
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-150 h-8 px-2.5"
          aria-label="Remove uploaded file"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          <span className="text-xs">Remove</span>
        </Button>
      </div>
    </div>
  );
}
