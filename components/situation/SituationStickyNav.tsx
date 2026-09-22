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
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SituationStickyNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onReset: () => void;
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
    <nav className="sticky top-16 z-30 w-full border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur shadow-md">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1">
          {hasDeadlines && (
            <button
              type="button"
              onClick={() => onNavigate('deadline-section')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeSection === 'deadline-section'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'text-red-400/80 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20'
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
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                      isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {`[${item.count}]`}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 h-8 px-2.5 shrink-0"
        >
          <RotateCcw className="w-3 h-3 mr-1.5" />
          <span className="hidden sm:inline">Start New Situation</span>
          <span className="sm:hidden">Reset</span>
        </Button>
      </div>
    </nav>
  );
}
