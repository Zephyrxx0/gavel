import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ChatTriggerButton } from '@/components/chat/ChatTriggerButton';
import { ChatPanel, renderWithCitations } from '@/components/chat/ChatPanel';
import { ExportDossierCard } from '@/components/export/ExportDossierCard';

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    sendMessage: vi.fn(),
    status: 'ready',
    stop: vi.fn(),
    setMessages: vi.fn(),
  })),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('Chat and Export Components Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ChatTriggerButton', () => {
    it('renders with "Ask Gavel" label and accessibility aria attributes', () => {
      const html = renderToString(
        React.createElement(ChatTriggerButton, {
          onClick: vi.fn(),
          isOpen: false,
        })
      );

      expect(html).toContain('Ask Gavel');
      expect(html).toContain('aria-label="Open Gavel Legal Assistant"');
      expect(html).toContain('data-testid="chat-trigger-button"');
      expect(html).toContain('fixed bottom-[3.75rem] right-6');
    });

    it('renders unread badge when unreadCount is provided and > 0', () => {
      const html = renderToString(
        React.createElement(ChatTriggerButton, {
          onClick: vi.fn(),
          unreadCount: 3,
        })
      );

      expect(html).toContain('3');
      expect(html).toContain('bg-rose-600');
    });
  });

  describe('renderWithCitations utility', () => {
    it('parses bracketed clause references into citation badge elements', () => {
      const text = 'Under [Clause 4.2: Early Termination], the penalty is outlined in [Section 8: Indemnity].';
      const elements = renderWithCitations(text);
      const html = renderToString(React.createElement('div', null, elements));

      expect(html).toContain('data-testid="citation-badge"');
      expect(html).toContain('[Clause 4.2: Early Termination]');
      expect(html).toContain('[Section 8: Indemnity]');
      expect(html).toContain('font-mono');
    });

    it('preserves plain text without citation badges when none are present', () => {
      const text = 'This agreement is between Party A and Party B.';
      const elements = renderWithCitations(text);
      const html = renderToString(React.createElement('div', null, elements));

      expect(html).not.toContain('data-testid="citation-badge"');
      expect(html).toContain('This agreement is between Party A and Party B.');
    });
  });

  describe('ChatPanel Drawer Component', () => {
    it('returns null when isOpen is false', () => {
      const html = renderToString(
        React.createElement(ChatPanel, {
          isOpen: false,
          onClose: vi.fn(),
          mode: 'document',
        })
      );

      expect(html).toBe('');
    });

    it('renders persistent disclaimer banner, header, and Mode 1 starter prompts when open and empty', () => {
      const html = renderToString(
        React.createElement(ChatPanel, {
          isOpen: true,
          onClose: vi.fn(),
          mode: 'document',
          documentType: 'Non-Disclosure Agreement',
        })
      );

      expect(html).toContain('Legal Information Only');
      expect(html).toContain('Advocates Act, 1961');
      expect(html).toContain('Gavel Assistant');
      expect(html).toContain('How can Gavel assist?');
      expect(html).toContain('Can I terminate early without penalty?');
      expect(html).toContain('What are the biggest financial or liability risks?');
      expect(html).toContain('data-testid="chat-input"');
      expect(html).toContain('data-testid="chat-send-button"');
    });

    it('renders Mode 2 Situation Navigator starter prompts in situation mode', () => {
      const html = renderToString(
        React.createElement(ChatPanel, {
          isOpen: true,
          onClose: vi.fn(),
          mode: 'situation',
        })
      );

      expect(html).toContain('What is my immediate statutory deadline?');
      expect(html).toContain('Should I consult a licensed lawyer now?');
      expect(html).toContain('What evidence is most critical to preserve?');
    });

    it('renders Mode 3 Comparison starter prompts in compare mode', () => {
      const html = renderToString(
        React.createElement(ChatPanel, {
          isOpen: true,
          onClose: vi.fn(),
          mode: 'compare',
        })
      );

      expect(html).toContain('Which agreement favors me overall?');
      expect(html).toContain('What are the most critical inconsistencies?');
      expect(html).toContain('Which clauses should I push back on?');
    });
  });

  describe('ExportDossierCard Component', () => {
    it('renders export buttons and statutory compliance tag for Document mode', () => {
      const sampleDoc = {
        documentType: 'Employment Agreement',
        parties: ['Tech Corp', 'Employee'],
        summary: 'Standard full-time employment agreement.',
        clauses: [],
        checklist: [],
        lawyerQuestions: [],
      };

      const html = renderToString(
        React.createElement(ExportDossierCard, {
          mode: 'document',
          data: sampleDoc,
          metadata: { fileName: 'employment.docx' },
        })
      );

      expect(html).toContain('Export Legal Intelligence Dossier');
      expect(html).toContain('Statutory Compliance (Advocates Act, 1961)');
      expect(html).toContain('Copy Dossier (MD)');
      expect(html).toContain('Markdown (.md)');
      expect(html).toContain('Plain Text (.txt)');
      expect(html).toContain('Raw Data (.json)');
      expect(html).toContain('data-testid="copy-markdown-button"');
      expect(html).toContain('data-testid="download-markdown-button"');
    });

    it('returns null when data is falsy', () => {
      const html = renderToString(
        React.createElement(ExportDossierCard, {
          mode: 'document',
          data: null,
        })
      );
      expect(html).toBe('');
    });
  });

  describe('StickyNav Components (Chat & Export Integration)', () => {
    it('renders Ask Gavel and Export buttons when onOpenChat and onExport are passed to StickyNav', async () => {
      const { StickyNav } = await import('@/components/decoder/StickyNav');
      const html = renderToString(
        React.createElement(StickyNav, {
          activeSection: 'summary-section',
          onNavigate: vi.fn(),
          onReset: vi.fn(),
          onOpenChat: vi.fn(),
          onExport: vi.fn(),
          counts: { risks: 2, checklist: 3, lawyerQuestions: 4 },
        })
      );

      expect(html).toContain('Ask Gavel');
      expect(html).toContain('Export');
      expect(html).toContain('Analyze Another Document');
    });

    it('renders Ask Gavel and Export buttons when onOpenChat and onExport are passed to SituationStickyNav', async () => {
      const { SituationStickyNav } = await import('@/components/situation/SituationStickyNav');
      const html = renderToString(
        React.createElement(SituationStickyNav, {
          activeSection: 'summary-section',
          onNavigate: vi.fn(),
          onReset: vi.fn(),
          onOpenChat: vi.fn(),
          onExport: vi.fn(),
          counts: { rights: 3, roadmap: 4, evidence: 2, counsel: 1 },
        })
      );

      expect(html).toContain('Ask Gavel');
      expect(html).toContain('Export');
      expect(html).toContain('Start New Situation');
    });

    it('renders mobile top nav bar and desktop sidebar for ComparisonStickyNav', async () => {
      const { ComparisonStickyNav } = await import('@/components/comparison/ComparisonStickyNav');
      const html = renderToString(
        React.createElement(ComparisonStickyNav, {
          activeSection: 'verdict-section',
          onSelectSection: vi.fn(),
          onReset: vi.fn(),
          onOpenChat: vi.fn(),
          onExport: vi.fn(),
          counts: { differences: 5, inconsistencies: 2, negotiation: 4 },
        })
      );

      expect(html).toContain('lg:hidden'); // mobile top bar
      expect(html).toContain('hidden lg:flex'); // desktop sidebar
      expect(html).toContain('Ask Gavel');
      expect(html).toContain('Export');
      expect(html).toContain('Compare Another Pair');
    });
  });
});
