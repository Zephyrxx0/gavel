import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DocumentPaperThumbnail } from '@/components/decoder/DocumentPaperThumbnail';
import { DocumentThumbnailBox } from '@/components/decoder/DocumentThumbnailBox';
import { DocumentMetadataDetails } from '@/components/decoder/DocumentMetadataDetails';

describe('DocumentPaperThumbnail Component', () => {
  it('renders correctly for a PDF document', () => {
    const html = renderToString(
      React.createElement(DocumentPaperThumbnail, {
        isPdf: true,
        isDocx: false,
        fileName: 'commercial-lease-agreement.pdf',
        miniatureLines: ['Clause 1: Term and Renewal', 'Clause 2: Base Rent Schedule'],
        wordCount: 1450,
      })
    );

    expect(html).toContain('PDF');
    expect(html).toContain('commercial-lease-agreement');
    expect(html).toContain('Clause 1: Term and Renewal');
    expect(html).toContain('Clause 2: Base Rent Schedule');
    expect(html).toContain('1,450');
    expect(html).toContain('Gavel Vault');
    expect(html).toContain('bg-rose-600');
  });

  it('renders correctly for a DOCX document', () => {
    const html = renderToString(
      React.createElement(DocumentPaperThumbnail, {
        isPdf: false,
        isDocx: true,
        fileName: 'independent-contractor.docx',
        miniatureLines: ['Section 1: Deliverables', 'Section 2: Payment Terms'],
        wordCount: 820,
      })
    );

    expect(html).toContain('DOCX');
    expect(html).toContain('independent-contractor');
    expect(html).toContain('Section 1: Deliverables');
    expect(html).toContain('820');
    expect(html).toContain('bg-blue-600');
  });

  it('renders default placeholder bars when miniatureLines is empty', () => {
    const html = renderToString(
      React.createElement(DocumentPaperThumbnail, {
        isPdf: false,
        isDocx: false,
        fileName: 'pasted-text-sample',
        miniatureLines: [],
        wordCount: 120,
      })
    );

    expect(html).toContain('LEGAL TEXT');
    expect(html).toContain('pasted-text-sample');
    expect(html).toContain('bg-stone-500');
    expect(html).toContain('120');
  });
});

describe('DocumentThumbnailBox Component', () => {
  it('renders interactive button and accessibility attributes', () => {
    const html = renderToString(
      React.createElement(DocumentThumbnailBox, {
        fileName: 'test-contract.pdf',
        isImage: false,
        isPdf: true,
        isDocx: false,
        miniatureLines: ['Clause 1'],
        wordCount: 500,
        onOpenDocument: vi.fn(),
      })
    );

    expect(html).toContain('role="button"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('aria-label="Open full document: test-contract.pdf"');
    expect(html).toContain('Open Document');
  });

  it('renders img element when isImage is true', () => {
    const html = renderToString(
      React.createElement(DocumentThumbnailBox, {
        fileName: 'scan.jpg',
        isImage: true,
        isPdf: false,
        isDocx: false,
        fileObjectUrl: 'blob:http://localhost/sample-scan',
        miniatureLines: [],
        wordCount: 0,
        onOpenDocument: vi.fn(),
      })
    );

    expect(html).toContain('<img');
    expect(html).toContain('src="blob:http://localhost/sample-scan"');
    expect(html).toContain('alt="scan.jpg"');
  });
});

describe('DocumentMetadataDetails Component', () => {
  it('renders metadata badges, word count, excerpt, and action triggers', () => {
    const html = renderToString(
      React.createElement(DocumentMetadataDetails, {
        fileName: 'employment-contract.pdf',
        isPdf: true,
        isDocx: false,
        isImage: false,
        sizeBytes: 2048,
        wordCount: 450,
        previewSnippet: 'Employee agrees to work 40 hours per week.',
        copied: false,
        onCopyText: vi.fn(),
        onOpenReader: vi.fn(),
      })
    );

    expect(html).toContain('employment-contract.pdf');
    expect(html).toContain('PDF Document');
    expect(html).toContain('450');
    expect(html).toContain('words');
    expect(html).toContain('Preamble Excerpt');
    expect(html).toContain('Employee agrees to work 40 hours per week.');
    expect(html).toContain('Copy Full Text');
    expect(html).toContain('Expand Full Document Reader');
  });
});
