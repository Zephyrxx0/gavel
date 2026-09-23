'use client';

import React, { useState } from 'react';
import { Download, Copy, Check, FileText, Code, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  copyToClipboard,
  downloadFile,
  formatDocumentMarkdown,
  formatDocumentPlainText,
  formatSituationMarkdown,
  formatSituationPlainText,
  formatComparisonMarkdown,
  formatComparisonPlainText,
} from '@/lib/export-utils';
import type { DocumentAnalysis } from '@/lib/schemas/document';
import type { SituationAnalysis } from '@/lib/schemas/situation';
import type { Comparison } from '@/lib/schemas/comparison';

export interface ExportDossierCardProps {
  mode: 'document' | 'situation' | 'compare';
  data: unknown;
  metadata?: {
    fileName?: string;
    labelA?: string;
    labelB?: string;
    description?: string;
  };
  className?: string;
}

export function ExportDossierCard({ mode, data, metadata, className = '' }: ExportDossierCardProps) {
  const [copied, setCopied] = useState(false);

  if (!data) return null;

  function getMarkdownContent(): string {
    if (mode === 'document') {
      return formatDocumentMarkdown(data as DocumentAnalysis, metadata?.fileName);
    }
    if (mode === 'situation') {
      return formatSituationMarkdown(data as SituationAnalysis, metadata?.description);
    }
    if (mode === 'compare') {
      return formatComparisonMarkdown(data as Comparison, metadata?.labelA, metadata?.labelB);
    }
    return '';
  }

  function getPlainTextContent(): string {
    if (mode === 'document') {
      return formatDocumentPlainText(data as DocumentAnalysis, metadata?.fileName);
    }
    if (mode === 'situation') {
      return formatSituationPlainText(data as SituationAnalysis, metadata?.description);
    }
    if (mode === 'compare') {
      return formatComparisonPlainText(data as Comparison, metadata?.labelA, metadata?.labelB);
    }
    return '';
  }

  function getJsonContent(): string {
    return JSON.stringify(data, null, 2);
  }

  async function handleCopy() {
    const md = getMarkdownContent();
    const success = await copyToClipboard(md);
    if (success) {
      setCopied(true);
      toast.success('Dossier copied to clipboard in Markdown format');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  }

  function handleDownload(format: 'md' | 'txt' | 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    let content = '';
    let filename = '';
    let mime = '';

    if (format === 'md') {
      content = getMarkdownContent();
      filename = `gavel-${mode}-dossier-${timestamp}.md`;
      mime = 'text/markdown';
    } else if (format === 'txt') {
      content = getPlainTextContent();
      filename = `gavel-${mode}-dossier-${timestamp}.txt`;
      mime = 'text/plain';
    } else if (format === 'json') {
      content = getJsonContent();
      filename = `gavel-${mode}-data-${timestamp}.json`;
      mime = 'application/json';
    }

    downloadFile(content, filename, mime);
    toast.success(`Downloaded ${filename}`);
  }

  return (
    <div
      className={`rounded-2xl border border-stone-200/80 bg-white p-6 md:p-8 shadow-sm ${className}`}
      data-testid="export-dossier-card"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="h-5 w-5 text-stone-700" />
            <h3 className="font-serif text-xl md:text-2xl font-bold text-stone-900 tracking-wide">
              Export Legal Intelligence Dossier
            </h3>
          </div>
          <p className="text-sm text-stone-600">
            Download or copy this comprehensive legal analysis for your personal records or attorney consultation.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-auto rounded-full bg-stone-50 border border-stone-200 px-3 py-1 text-xs text-stone-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
          Statutory Compliance (Advocates Act, 1961)
        </div>
      </div>

      <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="col-span-1 sm:col-span-2 lg:col-span-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 font-sans font-medium text-white shadow-sm hover:bg-stone-800 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-stone-400"
          data-testid="copy-markdown-button"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy Dossier (MD)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleDownload('md')}
          className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-stone-400"
          data-testid="download-markdown-button"
        >
          <Download className="h-4 w-4 text-stone-700" />
          <span>Markdown (.md)</span>
        </button>

        <button
          type="button"
          onClick={() => handleDownload('txt')}
          className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-stone-400"
          data-testid="download-text-button"
        >
          <FileText className="h-4 w-4 text-stone-500" />
          <span>Plain Text (.txt)</span>
        </button>

        <button
          type="button"
          onClick={() => handleDownload('json')}
          className="min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100 px-4 py-2.5 text-sm font-medium text-stone-800 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-stone-400"
          data-testid="download-json-button"
        >
          <Code className="h-4 w-4 text-stone-500" />
          <span>Raw Data (.json)</span>
        </button>
      </div>
    </div>
  );
}
