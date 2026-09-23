'use client';

import React from 'react';
import { MessageSquareText } from 'lucide-react';

export interface ChatTriggerButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  unreadCount?: number;
  className?: string;
}

export function ChatTriggerButton({
  onClick,
  isOpen = false,
  unreadCount,
  className = '',
}: ChatTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Gavel Legal Assistant"
      aria-expanded={isOpen}
      data-testid="chat-trigger-button"
      className={`fixed bottom-6 right-6 z-40 mb-[env(safe-area-inset-bottom)] min-h-[48px] min-w-[48px] px-4 py-2.5 flex items-center justify-center gap-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white font-medium shadow-lg border border-stone-700/50 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-stone-400 ${className}`}
    >
      <MessageSquareText className="h-5 w-5 text-white" />
      <span className="hidden sm:inline text-sm font-sans tracking-tight">Ask Gavel</span>
      {unreadCount !== undefined && unreadCount > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[11px] font-bold text-white shadow-sm">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
