'use client';

import React from 'react';
import { FileText, Image as ImageIcon, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/image-utils';

export interface FilePreviewCardProps {
  fileName: string;
  sizeBytes: number;
  wordCount: number;
  mimeType: string;
  isImage?: boolean;
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
  compressionInfo,
  onRemove,
}: FilePreviewCardProps) {
  const isImg = isImage || mimeType.startsWith('image/');

  return (
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm transition-all duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Document or Image Type Icon */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#EBF3EE] border border-[#D0E2D6] flex items-center justify-center text-[#264D34]">
          {isImg ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
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

      {/* Action: Clear / Remove */}
      <div className="flex items-center gap-2 self-end sm:self-center">
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
