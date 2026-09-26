'use client';

import React from 'react';
import {
  FileText,
  ShieldCheck,
  Milestone,
  FolderCheck,
  Scale,
  RotateCcw,
  AlertTriangle,
  MessageSquareText,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SituationStickyNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onReset: () => void;
  onOpenChat?: () => void;
  onExport?: () => void;
  hasDeadlines?: boolean;
  counts: {
    rights: number;
    roadmap: number;
    evidence: number;
    counselTriggers?: number;
    counsel?: number;
  };
}

export function SituationStickyNav({
  activeSection,
  onNavigate,
  onReset,
  onOpenChat,
  onExport,
  hasDeadlines = false,
  counts,
}: SituationStickyNavProps) {
  const counselCount = counts.counselTriggers ?? counts.counsel ?? 0;

  const navItems = [
    { id: 'summary-section', label: 'Summary', icon: FileText, count: null },
    { id: 'rights-section', label: 'Your Rights', icon: ShieldCheck, count: counts.rights },
    { id: 'roadmap-section', label: 'Roadmap', icon: Milestone, count: counts.roadmap },
    { id: 'evidence-section', label: 'Evidence', icon: FolderCheck, count: counts.evidence },
    { id: 'counsel-section', label: 'Counsel Triggers', icon: Scale, count: counselCount },
  ];

  return (
    <nav
      data-testid="situation-sticky-nav"
      className="w-full rounded-2xl border border-stone-200/90 bg-white/95 backdrop-blur shadow-sm p-1.5 sm:p-2"
    >
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {hasDeadlines && (
            <button
              type="button"
              onClick={() => onNavigate('deadline-section')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] sm:min-h-[40px] ${
                activeSection === 'deadline-section'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200 font-semibold'
                  : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Deadlines</span>
            </button>
          )}

          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] sm:min-h-[40px] ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {`[${item.count}]`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onOpenChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenChat}
              className="text-xs border-[#F2D8CD] bg-[#FAF0EB] text-[#7D432D] hover:bg-[#FAF0EB]/80 h-8 px-2 sm:px-2.5 shrink-0 shadow-sm"
            >
              <MessageSquareText className="w-3.5 h-3.5 sm:mr-1.5 text-[#7D432D]" />
              <span className="hidden sm:inline">Ask Gavel</span>
            </Button>
          )}

          {onExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="text-xs text-stone-700 hover:text-stone-900 hover:bg-stone-100 h-8 px-2 sm:px-2.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5 sm:mr-1.5 text-stone-500" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-stone-600 hover:text-stone-900 hover:bg-stone-100 h-8 px-2 sm:px-2.5 shrink-0"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Start New Situation</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
