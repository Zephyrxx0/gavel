'use client';

import React from 'react';
import { Scale, ArrowLeftRight, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ComparisonStickyNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  onReset: () => void;
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
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left',
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

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-[#1E293B]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full text-xs border-[#1E293B] bg-[#0B0F17] hover:bg-[#111827] text-slate-300 hover:text-[#D4AF37] transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Compare Another Pair</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
