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
      className={`fixed bottom-6 right-6 z-40 mb-[env(safe-area-inset-bottom)] min-h-[48px] min-w-[48px] px-4 py-2.5 flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#B8972E] hover:from-[#E5C158] hover:to-[#D4AF37] text-[#0B0F17] font-semibold shadow-xl shadow-[#D4AF37]/20 border border-[#F3E5AB]/40 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 focus:ring-offset-slate-950 ${className}`}
    >
      <MessageSquareText className="h-5 w-5 text-slate-950" />
      <span className="hidden sm:inline text-sm font-sans tracking-tight">Ask Gavel</span>
      {unreadCount !== undefined && unreadCount > 0 && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[11px] font-bold text-white shadow-sm">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
