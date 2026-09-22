'use client';

import React, { useState } from 'react';
import { ArrowRight, AlertCircle, FileCheck2 } from 'lucide-react';
import { DocumentZone } from './DocumentZone';
import { ComparisonPresetCards } from './ComparisonPresetCards';
import { Button } from '@/components/ui/button';
import { UploadData } from '@/lib/schemas/upload';
import { toast } from 'sonner';

export interface ComparisonPayload {
  docA: string;
  docB: string;
  labelA: string;
  labelB: string;
  imageA?: string;
  mimeTypeA?: string;
  imageB?: string;
  mimeTypeB?: string;
}

export interface DualDocumentIntakeProps {
  onStartComparison: (payload: ComparisonPayload) => void;
  isComparing?: boolean;
}

export function DualDocumentIntake({
  onStartComparison,
  isComparing = false,
}: DualDocumentIntakeProps) {
  const [labelA, setLabelA] = useState('Original Document');
  const [labelB, setLabelB] = useState('Revised Document');

  const [uploadedA, setUploadedA] = useState<UploadData | null>(null);
  const [uploadedB, setUploadedB] = useState<UploadData | null>(null);

  const [manualTextA, setManualTextA] = useState('');
  const [manualTextB, setManualTextB] = useState('');

  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  // Content validation: each zone must have either uploaded text/image or >= 30 chars of manual text
  const hasContentA = Boolean(
    (uploadedA && (uploadedA.text || uploadedA.rawBase64)) ||
    manualTextA.trim().length >= 30
  );
  const hasContentB = Boolean(
    (uploadedB && (uploadedB.text || uploadedB.rawBase64)) ||
    manualTextB.trim().length >= 30
  );

  const isReady = hasContentA && hasContentB && !isComparing;

  // Character calculations for large-doc feedback
  const charLengthA = uploadedA?.text ? uploadedA.text.length : manualTextA.length;
  const charLengthB = uploadedB?.text ? uploadedB.text.length : manualTextB.length;
  const combinedChars = charLengthA + charLengthB;
  const isLargePair = combinedChars > 60_000;

  const handleSelectPreset = (preset: {
    docA: string;
    docB: string;
    labelA: string;
    labelB: string;
  }) => {
    setUploadedA(null);
    setUploadedB(null);
    setManualTextA(preset.docA);
    setManualTextB(preset.docB);
    setLabelA(preset.labelA);
    setLabelB(preset.labelB);
    setErrorA(null);
    setErrorB(null);
    toast.success(`Loaded preset: ${preset.labelA} vs ${preset.labelB}`);
  };

  const handleSubmit = () => {
    if (!hasContentA) {
      setErrorA('Please upload or paste Document A.');
      return;
    }
    if (!hasContentB) {
      setErrorB('Please upload or paste Document B.');
      return;
    }

    const payload: ComparisonPayload = {
      labelA: labelA.trim() || 'Document A',
      labelB: labelB.trim() || 'Document B',
      docA: uploadedA?.text || manualTextA,
      docB: uploadedB?.text || manualTextB,
      imageA: uploadedA?.isImage && uploadedA.rawBase64 ? uploadedA.rawBase64 : undefined,
      mimeTypeA: uploadedA?.mimeType,
      imageB: uploadedB?.isImage && uploadedB.rawBase64 ? uploadedB.rawBase64 : undefined,
      mimeTypeB: uploadedB?.mimeType,
    };

    onStartComparison(payload);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Quick-Start Presets */}
      <ComparisonPresetCards onSelectPreset={handleSelectPreset} />

      {/* Dual Upload Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
        <DocumentZone
          zoneId="docA"
          label={labelA}
          defaultLabel="Original Document"
          onLabelChange={setLabelA}
          uploadedDoc={uploadedA}
          manualText={manualTextA}
          onUploadSuccess={(data) => {
            setUploadedA(data);
            setErrorA(null);
          }}
          onTextChange={(text) => {
            setManualTextA(text);
            if (errorA) setErrorA(null);
          }}
          onRemove={() => setUploadedA(null)}
          onFallbackToManual={(reason) => {
            setUploadedA(null);
            setErrorA(`Upload failed: ${reason}. Please paste text manually.`);
          }}
          disabled={isComparing}
          errorMessage={errorA}
        />

        <DocumentZone
          zoneId="docB"
          label={labelB}
          defaultLabel="Revised Document"
          onLabelChange={setLabelB}
          uploadedDoc={uploadedB}
          manualText={manualTextB}
          onUploadSuccess={(data) => {
            setUploadedB(data);
            setErrorB(null);
          }}
          onTextChange={(text) => {
            setManualTextB(text);
            if (errorB) setErrorB(null);
          }}
          onRemove={() => setUploadedB(null)}
          onFallbackToManual={(reason) => {
            setUploadedB(null);
            setErrorB(`Upload failed: ${reason}. Please paste text manually.`);
          }}
          disabled={isComparing}
          errorMessage={errorB}
        />
      </div>

      {/* Submit Trigger & Helper Info */}
      <div className="mt-8 flex flex-col items-center gap-2.5 w-full">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady}
          size="lg"
          className="min-w-[240px] h-12 bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B0F17] font-semibold text-sm shadow-xl shadow-[#D4AF37]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {isComparing ? (
            'Analyzing Contract Discrepancies…'
          ) : !hasContentA || !hasContentB ? (
            'Add second document to compare'
          ) : (
            <>
              Compare Documents <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {/* Dynamic Character Count & Two-Pass Notification */}
        {hasContentA && hasContentB && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">
              Combined: {combinedChars.toLocaleString()} characters
            </span>
            {isLargePair && (
              <span className="text-amber-400 font-medium inline-flex items-center gap-1">
                • ⚠ Large documents detected (&gt;60k chars) — two-pass analysis will activate
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
