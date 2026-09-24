'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileSearch, HelpCircle, GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

const ANALYSIS_MODES = [
  {
    name: 'Document Decoder',
    href: '/analyze/document',
    icon: FileSearch,
    activeColor: 'text-[#264D34]',
  },
  {
    name: 'Situation Navigator',
    href: '/analyze/situation',
    icon: HelpCircle,
    activeColor: 'text-[#7D432D]',
  },
  {
    name: 'Compare Contracts',
    href: '/analyze/compare',
    icon: GitCompare,
    activeColor: 'text-blue-800',
  },
] as const;

export function ModeSwitcher({ className }: { className?: string }) {
  const pathname = usePathname() || '';

  return (
    <div className={cn('flex items-center justify-center w-full', className)}>
      <nav
        aria-label="Intelligence Modes"
        className="inline-flex items-center gap-1 bg-stone-100/90 border border-stone-200/70 rounded-full p-1 text-xs shadow-xs overflow-x-auto max-w-full"
      >
        {ANALYSIS_MODES.map((mode) => {
          const isActive = pathname.startsWith(mode.href);
          const Icon = mode.icon;
          return (
            <Link
              key={mode.href}
              href={mode.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 shrink-0', isActive ? mode.activeColor : 'text-stone-500')} />
              <span>{mode.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
