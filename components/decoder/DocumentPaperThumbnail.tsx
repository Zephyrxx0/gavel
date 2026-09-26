'use client';

import React from 'react';

export interface DocumentPaperThumbnailProps {
  isPdf: boolean;
  isDocx: boolean;
  fileName: string;
  miniatureLines: string[];
  wordCount: number;
}

export function DocumentPaperThumbnail({
  isPdf,
  isDocx,
  fileName,
  miniatureLines,
  wordCount,
}: DocumentPaperThumbnailProps) {
  return (
    <div className="w-full h-full p-2.5 flex flex-col justify-between bg-[#FAF9F5] text-stone-800 text-[6px] sm:text-[7px] font-mono leading-tight select-none">
      <div>
        <div
          className={`h-1.5 -mx-2.5 -mt-2.5 mb-2 ${
            isPdf
              ? 'bg-rose-600'
              : isDocx
                ? 'bg-blue-600'
                : 'bg-stone-500'
          }`}
        />
        <div className="flex items-center justify-between pb-1 border-b border-stone-200/70 mb-1.5">
          <span className="font-bold text-[7px] text-stone-900 uppercase">
            {isPdf ? 'PDF' : isDocx ? 'DOCX' : 'LEGAL TEXT'}
          </span>
          <span className="text-[6px] text-stone-400">p. 1</span>
        </div>

        <p className="font-serif font-bold text-[8px] text-stone-900 line-clamp-1 mb-1">
          {fileName.replace(/\.[^/.]+$/, '')}
        </p>

        <div className="space-y-1 text-stone-500 opacity-80 overflow-hidden max-h-24">
          {miniatureLines.length > 0 ? (
            miniatureLines.map((line, idx) => (
              <p key={idx} className="line-clamp-1">
                {line}
              </p>
            ))
          ) : (
            <>
              <div className="h-1 bg-stone-200 rounded w-full" />
              <div className="h-1 bg-stone-200 rounded w-5/6" />
              <div className="h-1 bg-stone-200 rounded w-4/6" />
              <div className="h-1 bg-stone-200 rounded w-full" />
              <div className="h-1 bg-stone-200 rounded w-3/4" />
            </>
          )}
        </div>
      </div>

      <div className="pt-1 border-t border-stone-200/70 flex items-center justify-between text-[6px] text-stone-400">
        <span>Gavel Vault</span>
        <span>{wordCount.toLocaleString()} w</span>
      </div>
    </div>
  );
}
