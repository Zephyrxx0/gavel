import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { DocumentReaderModal } from '@/components/decoder/DocumentReaderModal';

describe('DocumentReaderModal Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToString(
      React.createElement(DocumentReaderModal, {
        isOpen: false,
        onClose: vi.fn(),
        fileName: 'sample-contract.pdf',
        wordCount: 500,
        fullText: 'Sample contract body text.',
        copied: false,
        onCopyText: vi.fn(),
      })
    );

    expect(html).toBe('');
  });

  it('renders modal dialog with paragraphs, word count, and accessibility attributes', () => {
    const html = renderToString(
      React.createElement(DocumentReaderModal, {
        isOpen: true,
        onClose: vi.fn(),
        fileName: 'lease-agreement.pdf',
        wordCount: 750,
        fullText: 'Paragraph 1: Tenant shall pay rent.\n\nParagraph 2: Term is 12 months.',
        copied: false,
        onCopyText: vi.fn(),
      })
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-label="Document Reader"');
    expect(html).toContain('lease-agreement.pdf');
    expect(html).toContain('750');
    expect(html).toContain('Tenant shall pay rent.');
    expect(html).toContain('Term is 12 months.');
    expect(html).toContain('Zero-Disk Ephemeral Security');
    expect(html).toContain('Advocates Act, 1961 Compliance');
  });

  it('renders "Copied" status when copied is true', () => {
    const html = renderToString(
      React.createElement(DocumentReaderModal, {
        isOpen: true,
        onClose: vi.fn(),
        fileName: 'nda.docx',
        wordCount: 300,
        fullText: 'Confidentiality agreement clause.',
        copied: true,
        onCopyText: vi.fn(),
      })
    );

    expect(html).toContain('Copied');
  });
});
