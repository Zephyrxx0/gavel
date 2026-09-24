'use client';

import React from 'react';
import Link from 'next/link';
import { Scale } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 max-w-6xl mx-auto transition-all duration-300">
      <div className="rounded-full border border-stone-200/90 bg-white/90 backdrop-blur-xl shadow-card-soft px-3.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <Link
          href="/"
          className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-full"
        >
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#EBF3EE] border border-[#D0E2D6] text-[#264D34] shadow-sm group-hover:scale-105 transition-all duration-200">
            <Scale className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors">
                Gavel
              </span>
            </div>
            <p className="hidden sm:block text-[10px] font-mono tracking-wider text-stone-500 uppercase">
              Legal Intelligence
            </p>
          </div>
        </Link>

        {/* Security & Privacy Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-[#D0E2D6] bg-[#EBF3EE] px-3 py-1 text-xs text-[#264D34] shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span className="font-mono text-[10px] sm:text-[11px] font-medium tracking-wide">
              Zero-Disk Vault
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

