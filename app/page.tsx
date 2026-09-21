import React from 'react';
import { Header } from '@/components/shared/Header';
import { LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-legal-obsidian text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Prominent Statutory Legal Disclaimer Card placed directly above analysis viewports */}
        <LegalDisclaimerCard />

        {/* Workspace Staging / Foundation Placeholder */}
        <div className="rounded-xl border border-slate-800 bg-[#111827]/60 p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] mb-2">
            <span className="font-serif text-xl font-bold">G</span>
          </div>
          <h2 className="font-serif text-2xl font-semibold text-white tracking-wide">
            Legal Intelligence Workspace
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Gavel transforms complex legal agreements, lease contracts, and disputes into transparent, plain-English breakdowns with verified statutory non-UPL protection.
          </p>
        </div>
      </main>
    </div>
  );
}
