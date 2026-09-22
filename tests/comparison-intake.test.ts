import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ComparisonPresetCards, COMPARISON_PRESETS } from '@/components/comparison/intake/ComparisonPresetCards';
import { DocumentZone } from '@/components/comparison/intake/DocumentZone';
import { DualDocumentIntake } from '@/components/comparison/intake/DualDocumentIntake';
import { ComparisonProgress } from '@/components/comparison/ComparisonProgress';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('ComparisonPresetCards Component', () => {
  it('renders all 3 comparison presets with titles and descriptions', () => {
    const html = renderToString(React.createElement(ComparisonPresetCards, { onSelectPreset: vi.fn() }));

    expect(html).toContain('Employment Offer vs Counter');
    expect(html).toContain('Vendor SLA vs Client Terms');
    expect(html).toContain('Master Lease vs Tenant Draft');
    expect(COMPARISON_PRESETS).toHaveLength(3);
  });
});

describe('DocumentZone Component', () => {
  it('renders in empty state with upload and paste tabs', () => {
    const html = renderToString(
      React.createElement(DocumentZone, {
        zoneId: 'docA',
        label: 'Original Agreement',
        defaultLabel: 'Original Document',
        uploadedDoc: null,
        manualText: '',
        onUploadSuccess: vi.fn(),
        onTextChange: vi.fn(),
        onRemove: vi.fn(),
        onFallbackToManual: vi.fn(),
      })
    );

    expect(html).toContain('Original Agreement');
    expect(html).toContain('Upload File');
    expect(html).toContain('Paste Text');
  });

  it('renders FilePreviewCard when uploadedDoc is present', () => {
    const mockUpload = {
      fileName: 'service-contract.pdf',
      fileSize: 45000,
      wordCount: 1250,
      mimeType: 'application/pdf',
      text: 'Sample contract text...',
    };

    const html = renderToString(
      React.createElement(DocumentZone, {
        zoneId: 'docA',
        label: 'Original Agreement',
        defaultLabel: 'Original Document',
        uploadedDoc: mockUpload,
        manualText: '',
        onUploadSuccess: vi.fn(),
        onTextChange: vi.fn(),
        onRemove: vi.fn(),
        onFallbackToManual: vi.fn(),
      })
    );

    expect(html).toContain('service-contract.pdf');
    expect(html).toContain('1,250');
  });

  it('renders error message when provided', () => {
    const html = renderToString(
      React.createElement(DocumentZone, {
        zoneId: 'docB',
        label: 'Revised Agreement',
        defaultLabel: 'Revised Document',
        uploadedDoc: null,
        manualText: '',
        onUploadSuccess: vi.fn(),
        onTextChange: vi.fn(),
        onRemove: vi.fn(),
        onFallbackToManual: vi.fn(),
        errorMessage: 'File upload failed: Corrupt PDF.',
      })
    );

    expect(html).toContain('File upload failed: Corrupt PDF.');
  });
});

describe('DualDocumentIntake Component', () => {
  it('renders dual document zones and presets', () => {
    const html = renderToString(React.createElement(DualDocumentIntake, { onStartComparison: vi.fn() }));

    expect(html).toContain('Original Document');
    expect(html).toContain('Revised Document');
    expect(html).toContain('Quick-Start Comparison Presets');
    expect(html).toContain('Add second document to compare');
  });
});

describe('ComparisonProgress Component', () => {
  it('renders standard 4-stage stepper and elapsed counter', () => {
    const html = renderToString(React.createElement(ComparisonProgress, { isLargeDoc: false }));

    expect(html).toContain('Ingesting Document A');
    expect(html).toContain('Step');
    expect(html).toContain('Zero-retention ephemeral memory');
    expect(html).not.toContain('Large contract detected');
  });

  it('renders large document notification badge when isLargeDoc is true', () => {
    const html = renderToString(React.createElement(ComparisonProgress, { isLargeDoc: true }));

    expect(html).toContain('Large contract detected');
    expect(html).toContain('analysing key risk sections via two-pass extraction');
  });
});
