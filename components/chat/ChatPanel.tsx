'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import ReactMarkdown from 'react-markdown';
import {
  X,
  RotateCcw,
  Send,
  Sparkles,
  ShieldAlert,
  Copy,
  Check,
  Scale,
  MessageSquare,
  StopCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/export-utils';

export interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'document' | 'situation' | 'compare';
  text?: string;
  analysis?: unknown;
  documentType?: string;
  parties?: string[];
}

const STARTER_PROMPTS: Record<'document' | 'situation' | 'compare', string[]> = {
  document: [
    'Can I terminate early without penalty?',
    'What are the biggest financial or liability risks?',
    'What happens if either party breaches?',
    'What should I negotiate before signing?',
  ],
  situation: [
    'What is my immediate statutory deadline?',
    'Should I consult a licensed lawyer now?',
    'What evidence is most critical to preserve?',
    'What steps can I handle myself?',
  ],
  compare: [
    'Which agreement favors me overall?',
    'What are the most critical inconsistencies?',
    'Which clauses should I push back on?',
    'Are there hidden traps in the revision?',
  ],
};

function extractMessageText(msg: UIMessage): string {
  if (typeof (msg as unknown as { content?: string }).content === 'string') {
    return (msg as unknown as { content: string }).content;
  }
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p) => p.type === 'text')
      .map((p) => (p as unknown as { text?: string }).text || '')
      .join('');
  }
  return '';
}

export function renderWithCitations(text: string) {
  // Regex matches [Clause X: Title], [Section Y: Title], [Schedule Z], etc.
  const citationRegex = /(\[(?:Clause|Section|Schedule|Article|Para)[^\]]+\])/g;
  const parts = text.split(citationRegex);

  return parts.map((part, index) => {
    if (citationRegex.test(part)) {
      return (
        <span
          key={index}
          data-testid="citation-badge"
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono font-medium text-stone-800 bg-stone-200/70 border border-stone-300 tracking-tight select-all"
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function ChatPanel({
  isOpen,
  onClose,
  mode,
  text,
  analysis,
  documentType,
  parties,
}: ChatPanelProps) {
  const [inputVal, setInputVal] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          context: {
            mode,
            text,
            analysis,
            documentType,
            parties,
          },
        },
      }),
    [mode, text, analysis, documentType, parties]
  );

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  async function handleSend() {
    if (!inputVal.trim() || isLoading) return;
    const currentInput = inputVal;
    setInputVal('');
    await sendMessage({ text: currentInput });
  }

  async function handleChipClick(chip: string) {
    if (isLoading) return;
    await sendMessage({ text: chip });
  }

  async function handleCopyMessage(msgId: string, content: string) {
    const success = await copyToClipboard(content);
    if (success) {
      setCopiedId(msgId);
      toast.success('Response copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  function handleClear() {
    if (isLoading) stop();
    setMessages([]);
    toast.info('Conversation cleared');
  }

  const starterChips = STARTER_PROMPTS[mode] || STARTER_PROMPTS.document;

  return (
    <div
      data-testid="chat-panel"
      role="dialog"
      aria-label="Gavel Legal Assistant"
      aria-modal="true"
      className="fixed top-0 right-0 bottom-9 sm:bottom-10 z-40 flex flex-col bg-white border-l border-b border-stone-200 shadow-2xl transition-transform duration-300 w-full sm:w-[460px] lg:w-[500px]"
    >
        {/* Persistent Compliance Banner */}
        <div className="bg-stone-100 border-b border-stone-200 px-4 py-2 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-stone-600 shrink-0" />
          <p className="text-[11px] text-stone-700 font-sans leading-tight">
            <span className="font-semibold">Legal Information Only</span> · Not Legal Advice ·
            Advocates Act, 1961
          </p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#EDF2FA] border border-blue-200/60 flex items-center justify-center text-blue-700">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 text-base">Gavel Assistant</h3>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-700 uppercase tracking-wider">
                  {mode}
                </span>
              </div>
              <p className="text-xs text-stone-500">Contextual legal Q&A</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleClear}
              title="Clear chat"
              aria-label="Clear conversation history"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
              data-testid="clear-chat-button"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close drawer"
              aria-label="Close legal assistant drawer"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400"
              data-testid="close-chat-button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message Feed / Empty State */}
        <div role="log" aria-live="polite" className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="h-12 w-12 rounded-2xl bg-[#FAF0EB] border border-orange-200/60 flex items-center justify-center text-orange-700 mb-3 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="font-serif text-lg font-bold text-stone-900 mb-1">
                How can Gavel assist?
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mb-6">
                Ask follow-up questions grounded directly in your active {mode} analysis.
              </p>

              <div className="w-full space-y-2">
                <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider text-left pl-1 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 h-3.5 text-stone-600" />
                  <span>Suggested Inquiries</span>
                </div>
                {starterChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="w-full text-left p-3 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-100 hover:border-stone-300 text-xs text-stone-700 hover:text-stone-900 transition-all duration-150 flex items-center justify-between group"
                    data-testid="starter-chip"
                  >
                    <span>{chip}</span>
                    <span className="text-stone-400 group-hover:text-stone-800 transition-colors ml-2 shrink-0">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const textContent = extractMessageText(msg);
              const isAssistant = msg.role === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                  data-testid={`message-${msg.role}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                      isAssistant
                        ? 'bg-stone-50 border border-stone-200 text-stone-800 rounded-tl-sm'
                        : 'bg-stone-900 text-white rounded-tr-sm'
                    }`}
                  >
                    {isAssistant ? (
                      <div className="prose prose-stone prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 text-stone-800">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">
                                {typeof children === 'string'
                                  ? renderWithCitations(children)
                                  : children}
                              </p>
                            ),
                          }}
                        >
                          {textContent}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{textContent}</p>
                    )}
                  </div>

                  {isAssistant && (
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, textContent)}
                        className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
                        title="Copy message"
                        aria-label="Copy response to clipboard"
                        data-testid="copy-message-button"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-stone-500 pl-2">
              <span className="h-2 w-2 rounded-full bg-stone-700 animate-pulse"></span>
              <span>Gavel is analyzing...</span>
              <button
                type="button"
                onClick={stop}
                className="ml-2 text-[11px] text-rose-600 hover:text-rose-700 flex items-center gap-1 underline underline-offset-2"
              >
                <StopCircle className="h-3 w-3" /> Stop
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-stone-200 bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a question about this analysis..."
              aria-label="Ask a question about this analysis"
              maxLength={1000}
              disabled={isLoading}
              data-testid="chat-input"
              className="w-full rounded-xl bg-stone-50 border border-stone-200 pl-4 pr-12 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              aria-label="Send message"
              data-testid="chat-send-button"
              className="absolute right-1.5 h-9 w-9 rounded-lg bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center disabled:opacity-40 transition-all min-h-[36px]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          <p className="text-[10px] text-stone-400 text-center mt-2 font-sans">
            Legal information only. Not legal advice. Consult licensed counsel for specific representation.
          </p>
        </div>
      </div>
  );
}
