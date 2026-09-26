'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';
import { Button } from '@/components/ui/button';
import { FileSearch, HelpCircle, GitCompare, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col selection:bg-stone-200">
      <Header />

      <main id="main-content" tabIndex={-1} className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-14 flex-1 focus:outline-none">
        {/* Editorial Hero Section */}
        <section className="pt-6 sm:pt-12 pb-2 text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-mono tracking-wide uppercase bg-stone-100 border border-stone-200/80 text-stone-700">
            <Sparkles className="w-3.5 h-3.5 text-stone-600" />
            <span>Autonomous Legal Intelligence · Ephemeral By Design</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-stone-900 tracking-tight leading-[1.12]">
            Demystifying complex contracts with{' '}
            <span className="italic text-stone-700 font-normal">
              plain-English clarity.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 font-sans max-w-2xl mx-auto leading-relaxed">
            Translate opaque legal agreements, evaluate active disputes, and benchmark contract revisions into actionable risk breakdowns.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-stone-500 font-mono">
            <span className="flex items-center gap-1.5 bg-white border border-stone-200/80 rounded-full px-3.5 py-1 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Volatile RAM
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-stone-200/80 rounded-full px-3.5 py-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-600" />
              Gemini 2.5 Flash Reasoning
            </span>
            <span className="flex items-center gap-1.5 bg-white border border-stone-200/80 rounded-full px-3.5 py-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Traffic-Light Risk Scoring
            </span>
          </div>
        </section>

        {/* 3 Core Action Gateways: Clean Soft Pastel Editorial Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
              Choose an Intelligence Mode
            </h2>
            <span className="text-xs text-stone-500 font-mono">3 Specialized Engines</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Mode 1: Document Decoder */}
            <div className="rounded-2xl border border-[#D0E2D6] bg-[#EBF3EE]/80 p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-200 hover:bg-[#EBF3EE] hover:shadow-card-hover group">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 inline-flex items-center gap-2 rounded-full bg-white border border-[#D0E2D6] px-3.5 text-xs font-mono font-medium text-[#264D34] shadow-xs">
                    <FileSearch className="w-3.5 h-3.5 shrink-0 text-[#264D34]" />
                    <span className="whitespace-nowrap tracking-wide">Mode 1 · Document Decoder</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                  Decode a Contract
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  Upload or paste a lease, NDA, employment offer, or vendor agreement for instant plain-English summaries, clause risk triage, and counsel checklists.
                </p>
              </div>

              <div className="w-full pt-2">
                <Button
                  asChild
                  size="default"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium h-11 px-4 text-xs shadow-sm flex items-center justify-between group rounded-xl"
                >
                  <Link href="/analyze/document">
                    <span>Decode Document</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mode 2: Situation Navigator */}
            <div className="rounded-2xl border border-[#F2D8CD] bg-[#FAF0EB]/80 p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-200 hover:bg-[#FAF0EB] hover:shadow-card-hover group">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 inline-flex items-center gap-2 rounded-full bg-white border border-[#F2D8CD] px-3.5 text-xs font-mono font-medium text-[#7D432D] shadow-xs">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0 text-[#7D432D]" />
                    <span className="whitespace-nowrap tracking-wide">Mode 2 · Situation Navigator</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                  I have a legal situation
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  Describe an ongoing dispute or legal dilemma in plain English to evaluate your rights, next steps, and evidence.
                </p>
              </div>

              <div className="w-full pt-2">
                <Button
                  asChild
                  size="default"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium h-11 px-4 text-xs shadow-sm flex items-center justify-between group rounded-xl"
                >
                  <Link href="/analyze/situation">
                    <span>Situation Navigator</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mode 3: Compare Agreements */}
            <div className="rounded-2xl border border-[#D1DFF2] bg-[#EDF2FA]/80 p-6 sm:p-7 flex flex-col justify-between gap-6 transition-all duration-200 hover:bg-[#EDF2FA] hover:shadow-card-hover group">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 inline-flex items-center gap-2 rounded-full bg-white border border-[#D1DFF2] px-3.5 text-xs font-mono font-medium text-[#284A78] shadow-xs">
                    <GitCompare className="w-3.5 h-3.5 shrink-0 text-[#284A78]" />
                    <span className="whitespace-nowrap tracking-wide">Mode 3 · Compare Agreements</span>
                  </div>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                  Compare Two Contracts
                </h3>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  Upload two agreement versions to detect clause discrepancies, favorability shifts, and negotiation leverage before signing.
                </p>
              </div>

              <div className="w-full pt-2">
                <Button
                  asChild
                  size="default"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-medium h-11 px-4 text-xs shadow-sm flex items-center justify-between group rounded-xl"
                >
                  <Link href="/analyze/compare">
                    <span>Compare Documents</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Statutory Legal Disclaimer Card placed cleanly */}
        <LegalDisclaimerCard />
      </main>
    </div>
  );
}
