'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileSearch, HelpCircle, GitCompare, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModeSwitcher({ className, showHome = true }: { className?: string; showHome?: boolean }) {
  const pathname = usePathname() || '';

  const modes = [
    {
      name: 'Document Decoder',
      href: '/analyze/document',
      isActive: pathname.startsWith('/analyze/document'),
      icon: FileSearch,
      activeColor: 'text-[#264D34]',
    },
    {
      name: 'Situation Navigator',
      href: '/analyze/situation',
      isActive: pathname.startsWith('/analyze/situation'),
      icon: HelpCircle,
      activeColor: 'text-[#7D432D]',
    },
    {
      name: 'Compare Contracts',
      href: '/analyze/compare',
      isActive: pathname.startsWith('/analyze/compare'),
      icon: GitCompare,
      activeColor: 'text-blue-800',
    },
  ];

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
      <nav
        aria-label="Intelligence Modes"
        className="inline-flex items-center gap-1 bg-stone-100/90 border border-stone-200/70 rounded-full p-1 text-xs shadow-xs overflow-x-auto max-w-full"
      >
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link
              key={mode.href}
              href={mode.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium transition-all duration-150 whitespace-nowrap',
                mode.isActive
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/80 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 shrink-0', mode.isActive ? mode.activeColor : 'text-stone-500')} />
              <span>{mode.name}</span>
            </Link>
          );
        })}
      </nav>

      {showHome && (
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-mono text-stone-500 hover:text-stone-900 transition-colors px-2 py-1 rounded-md"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>All Engines</span>
        </Link>
      )}
    </div>
  );
}
