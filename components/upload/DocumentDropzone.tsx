'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { downsampleImage, DownsampleResult } from '@/lib/image-utils';
import { UploadData } from '@/lib/schemas/upload';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

export interface DocumentDropzoneProps {
  onUploadSuccess: (data: UploadData, compressionInfo?: DownsampleResult | null) => void;
  onFallbackToManual: (reason: string) => void;
  disabled?: boolean;
}

export function DocumentDropzone({
  onUploadSuccess,
  onFallbackToManual,
  disabled = false,
}: DocumentDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  }, []);

  const validateFilePreFlight = useCallback(
    (file: File): boolean => {
      const fileName = file.name.toLowerCase();
      const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => fileName.endsWith(ext));
      const hasValidMime = file.type ? ALLOWED_MIME_TYPES.includes(file.type) : false;

      if (!hasValidExt && !hasValidMime) {
        toast.error('Unsupported file format. Please upload a PDF, DOCX, JPG, or PNG file.');
        triggerShake();
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds the 10MB limit. Please upload a smaller file.');
        triggerShake();
        return false;
      }

      return true;
    },
    [triggerShake]
  );

  const processAndUploadFile = useCallback(
    async (rawFile: File) => {
      if (!validateFilePreFlight(rawFile)) {
        return;
      }

      setIsProcessing(true);
      setStatusMessage('Preparing file...');

      try {
        let uploadFile = rawFile;
        let compressionResult: DownsampleResult | null = null;

        // Image Canvas Downsampling for images > 4MB (D-13 & INGEST-02)
        const isImage =
          rawFile.type.startsWith('image/') ||
          rawFile.name.toLowerCase().endsWith('.jpg') ||
          rawFile.name.toLowerCase().endsWith('.jpeg') ||
          rawFile.name.toLowerCase().endsWith('.png');

        if (isImage && rawFile.size > 4 * 1024 * 1024) {
          setStatusMessage('Downsampling high-resolution image...');
          compressionResult = await downsampleImage(rawFile, 4 * 1024 * 1024, 2048, 0.82);
          uploadFile = compressionResult.file;
        }

        setStatusMessage('Extracting document in volatile memory...');

        const formData = new FormData();
        formData.append('file', uploadFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorCode = result.error;
          const message = result.message || 'File upload failed.';

          if (errorCode === 'EMPTY_TEXT') {
            toast.error('Extracted text is too short or document is scanned.');
            onFallbackToManual(
              'The document yielded fewer than 50 characters of readable text. Scanned or photo documents can be pasted manually below.'
            );
          } else if (errorCode === 'PASSWORD_PROTECTED') {
            toast.error('The document is password-protected.');
            onFallbackToManual(
              'The document is password-protected or encrypted. You may copy and paste its contents directly below.'
            );
          } else if (errorCode === 'CORRUPT_FILE') {
            toast.error('Unable to parse document.');
            onFallbackToManual(
              'The document structure appears corrupt or unreadable. Please paste the agreement text directly.'
            );
          } else {
            toast.error(message);
            onFallbackToManual(message);
          }
          return;
        }

        toast.success(`Successfully parsed ${uploadFile.name}`);
        onUploadSuccess(result.data, compressionResult);
      } catch (err: unknown) {
        console.error('Upload failed:', err);
        const errorMsg = 'A network error occurred while uploading the file.';
        toast.error(errorMsg);
        onFallbackToManual(`${errorMsg} Please paste the text directly into the area below.`);
      } finally {
        setIsProcessing(false);
        setStatusMessage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [validateFilePreFlight, onFallbackToManual, onUploadSuccess]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processAndUploadFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processAndUploadFile(file);
    }
  };

  const handleZoneClick = () => {
    if (!disabled && !isProcessing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled || isProcessing}
      />

      <div
        role="button"
        tabIndex={disabled || isProcessing ? -1 : 0}
        onClick={handleZoneClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleZoneClick();
          }
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label="Upload document area"
        className={cn(
          'relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 border-dashed transition-all duration-150 cursor-pointer select-none text-center',
          isDragging
            ? 'border-[#D4AF37] bg-slate-900/90 scale-[1.01] shadow-[0_0_25px_rgba(212,175,55,0.25)]'
            : 'border-slate-800 bg-[#0B0F17]/80 hover:border-slate-700 hover:bg-slate-900/40',
          isShaking && 'animate-shake border-rose-500/80 shadow-[0_0_20px_rgba(239,68,68,0.25)]',
          (disabled || isProcessing) && 'cursor-not-allowed opacity-75'
        )}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
            <p className="text-sm font-medium text-slate-200">{statusMessage || 'Processing file...'}</p>
            <p className="text-xs text-slate-400 font-mono">Zero disk writes • Volatile memory parsing</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-150',
                isDragging
                  ? 'bg-slate-800 border-[#D4AF37] text-[#D4AF37] scale-110'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 group-hover:text-slate-200'
              )}
            >
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <p className="text-sm sm:text-base font-medium text-slate-100">
                <span className="text-[#D4AF37] underline underline-offset-4 decoration-[#D4AF37]/50 hover:decoration-[#D4AF37]">
                  Click to upload
                </span>{' '}
                or drag and drop your document
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports PDF, DOCX, JPG, or PNG (up to 10MB)
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 text-slate-400">
                <FileText className="w-3 h-3 text-[#D4AF37]" /> PDF / DOCX
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60 text-slate-400">
                <ImageIcon className="w-3 h-3 text-amber-400" /> JPG / PNG
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
