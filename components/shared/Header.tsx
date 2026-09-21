import React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-[#1E293B] bg-[#0B0F17]/80 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
            <Scale className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Gavel
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
            </div>
            <p className="text-xs font-sans tracking-wide text-slate-400">
              Legal Intelligence Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#1E293B] bg-[#111827] px-3 py-1 text-xs text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            <span className="font-mono text-[11px]">Zero-Disk Ephemeral Privacy</span>
          </div>
        </div>
      </div>
    </header>
  );
}
