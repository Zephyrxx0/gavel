'use client';

import React from 'react';
import { Scale, ArrowLeftRight, AlertTriangle, Sparkles, RefreshCw, MessageSquareText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ComparisonStickyNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  onReset: () => void;
  onOpenChat?: () => void;
  onExport?: () => void;
  counts: {
    differences: number;
    inconsistencies: number;
    negotiation: number;
  };
}

export function ComparisonStickyNav({
  activeSection,
  onSelectSection,
  onReset,
  onOpenChat,
  onExport,
  counts,
}: ComparisonStickyNavProps) {
  const navItems = [
    {
      id: 'verdict-section',
      label: 'Verdict',
      icon: Scale,
      badge: null,
    },
    {
      id: 'differences-section',
      label: 'Clause Comparison',
      icon: ArrowLeftRight,
      badge: counts.differences,
    },
    {
      id: 'inconsistencies-section',
      label: 'Inconsistencies',
      icon: AlertTriangle,
      badge: counts.inconsistencies,
    },
    {
      id: 'negotiation-section',
      label: 'Negotiation Guide',
      icon: Sparkles,
      badge: counts.negotiation,
    },
  ];

  return (
    <>
      {/* Mobile & Tablet Sticky Top Bar (<1024px) */}
      <nav className="lg:hidden sticky top-16 z-30 w-full border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur shadow-md">
        <div className="container mx-auto px-2 sm:px-4 h-12 flex items-center justify-between gap-2">
          <div
            className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] sm:min-h-[40px]',
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full font-mono text-[10px]',
                        isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-slate-800 text-slate-400'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenChat}
                className="text-xs border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] h-8 px-2 sm:px-2.5 shrink-0"
              >
                <MessageSquareText className="w-3.5 h-3.5 sm:mr-1.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">Ask Gavel</span>
              </Button>
            )}

            {onExport && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 h-8 px-2 sm:px-2.5 shrink-0"
              >
                <Download className="w-3.5 h-3.5 sm:mr-1.5 text-slate-400" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 h-8 px-2 sm:px-2.5 shrink-0"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">New Pair</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar (>=1024px) */}
      <aside className="w-56 xl:w-64 shrink-0 sticky top-20 self-start hidden lg:flex flex-col gap-4">
        <div className="rounded-xl border border-[#1E293B] bg-[#111827]/90 p-3 shadow-xl backdrop-blur-md">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block px-3 py-1.5 font-bold">
            Navigation
          </span>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectSection(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left min-h-[36px]',
                    isActive
                      ? 'bg-[#0B0F17] text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-[#0B0F17]/50'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#D4AF37]' : 'text-slate-500')} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={cn(
                        'font-mono text-[10px] px-1.5 py-0.5 rounded-full',
                        isActive
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                          : 'bg-[#0B0F17] text-slate-500'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="mt-4 pt-3 border-t border-[#1E293B] space-y-2">
            {onOpenChat && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenChat}
                className="w-full text-xs border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-1.5 h-9"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>Ask Gavel</span>
              </Button>
            )}

            {onExport && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onExport}
                className="w-full text-xs border-[#1E293B] bg-[#0B0F17] hover:bg-[#111827] text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 h-9"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dossier</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="w-full text-xs border-[#1E293B] bg-[#0B0F17] hover:bg-[#111827] text-slate-300 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-1.5 h-9"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Compare Another Pair</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

