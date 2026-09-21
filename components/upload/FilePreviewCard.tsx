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
    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0B0F17]/90 border border-slate-800 shadow-lg backdrop-blur-sm transition-all duration-200">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Document or Image Type Icon */}
        <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-slate-900 border border-slate-700/60 flex items-center justify-center text-[#D4AF37]">
          {isImg ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
        </div>

        {/* File Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-slate-100 truncate max-w-[220px] sm:max-w-xs md:max-w-sm">
              {fileName}
            </h4>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400">
            <span className="font-mono text-slate-300">
              {formatFileSize(sizeBytes)}
            </span>

            <span className="text-slate-600">•</span>

            {isImg ? (
              <Badge variant="outline" className="text-[11px] font-mono border-amber-500/30 text-amber-300 bg-amber-950/20">
                Visual OCR Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[11px] font-mono border-slate-700 text-slate-300">
                {wordCount.toLocaleString()} {wordCount === 1 ? 'word' : 'words'}
              </Badge>
            )}

            {compressionInfo?.wasCompressed && (
              <Badge
                variant="outline"
                className="text-[11px] font-mono border-emerald-500/40 text-emerald-300 bg-emerald-950/30 flex items-center gap-1"
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
          className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/50 transition-colors duration-150 h-8 px-2.5"
          aria-label="Remove uploaded file"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          <span className="text-xs">Remove</span>
        </Button>
      </div>
    </div>
  );
}
