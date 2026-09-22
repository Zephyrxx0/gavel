'use client';

import React from 'react';
import { FileText, ShieldAlert, CheckSquare, HelpCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface StickyNavProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onReset: () => void;
  counts: {
    risks: number;
    checklist: number;
    lawyerQuestions: number;
  };
}

export function StickyNav({ activeSection, onNavigate, onReset, counts }: StickyNavProps) {
  const navItems = [
    { id: 'summary-section', label: 'Summary', icon: FileText, count: null },
    { id: 'risks-section', label: 'Risks', icon: ShieldAlert, count: counts.risks },
    { id: 'checklist-section', label: 'Checklist', icon: CheckSquare, count: counts.checklist },
    { id: 'lawyer-prep-section', label: 'Lawyer Prep', icon: HelpCircle, count: counts.lawyerQuestions },
  ];

  return (
    <nav className="sticky top-16 z-30 w-full border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur shadow-md">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
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
                    {item.count}
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
          <span className="hidden sm:inline">Analyze Another Document</span>
          <span className="sm:hidden">Reset</span>
        </Button>
      </div>
    </nav>
  );
}

