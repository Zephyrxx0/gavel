# Phase 02: Mode 1 — Document Decoder Core — Pattern Mapping

**Generated:** 2026-09-22  
**Target:** Architecture & Implementation Plan for Phase 2 (`/analyze/document` and `/api/analyze/document`)

---

## Overview & Architecture Map

This document establishes the exact codebase patterns, file analogs, structural conventions, and reusable code excerpts for Phase 2: Mode 1 — Document Decoder Core. All newly authored files MUST emulate these established patterns to preserve consistency across typography, design tokens, error envelopes, and zero-persistence runtime behavior.

```
app/
├── api/
│   └── analyze/
│       └── document/
│           └── route.ts                 # [API Route] Mode 1 generateObject analysis endpoint
├── analyze/
│   └── document/
│       └── page.tsx                     # [Client Page] Mode 1 Orchestrator (Intake ↔ Loading ↔ Dossier)
├── page.tsx                             # [Modified] Landing page pointing Mode 1 to /analyze/document
components/
├── decoder/
│   ├── StickyNav.tsx                    # [Client Component] Docked scroll-spy bar with section counters
│   ├── ExecutiveSummaryCard.tsx         # [Client Component] Layer 1: Document classification & executive brief
│   ├── RiskScorecard.tsx                # [Client Component] Layer 2 Container: Traffic-light filter chips & High-first sort
│   ├── ClauseCard.tsx                   # [Client Component] Layer 2 Card: Plain English, obligation pill, Radix Accordion
│   ├── ActionChecklist.tsx              # [Client Component] Layer 3: Chronological timing groups & interactive check-off
│   ├── LawyerPrepGuide.tsx              # [Client Component] Layer 4: 5–8 consultation cards, copy trigger, clause tags
│   ├── AnalysisProgress.tsx             # [Client Component] Multi-stage animated loader with elapsed second timer
│   └── AnalysisErrorCard.tsx            # [Client Component] Inline diagnostic failure card with retry & fallback
lib/
└── prompts/
    └── document.ts                      # [Prompt Library] Non-UPL system instructions & XML boundary isolators
tests/
├── analyze-document-route.test.ts       # [Route Test] Mocked Vercel AI SDK & payload validation tests
└── decoder-components.test.ts           # [Component Test] Client state, filtering, sorting, & interaction tests
```

---

## File Pattern Directory

### 1. Prompt Module: `lib/prompts/document.ts`

- **Role:** AI System Prompt & User Prompt Construction.
- **Closest Analog:** `lib/schemas/document.ts` (schema rules) & `components/shared/LegalDisclaimer.tsx` (statutory non-UPL safe harbor boundaries).
- **Data Flow:** Consumed by `app/api/analyze/document/route.ts` to feed `generateObject({ system, prompt })`.

#### Key Characteristics & Constraints
- Strictly enforces non-UPL boundaries per Advocates Act 1961 §§ 29 & 33 (educational only, no prescriptive imperatives like "you should sue").
- Hard-codes allowed enum values in system instructions (`risk`: `high` | `caution` | `standard`, `obligation`: `user` | `counterparty` | `mutual` | `none`, `timing`: `immediate` | `before_signing` | `after_signing`, `actionType`: `negotiate` | `verify` | `refuse` | `accept`).
- Wraps untrusted user input inside XML boundary tags (`<document_to_analyze>...</document_to_analyze>`) to prevent prompt injection or adversarial risk downgrades.

#### Concrete Code Pattern
```ts
// lib/prompts/document.ts
export const DOCUMENT_SYSTEM_PROMPT = `
You are Gavel's Expert Document Decoder, an AI assistant dedicated to making complex legal documents transparent, understandable, and actionable for everyday citizens.

NON-NEGOTIABLE LEGAL BOUNDARIES (NON-UPL COMPLIANCE):
1. You provide objective legal INFORMATION and EDUCATIONAL ANALYSIS only. You NEVER provide legal advice.
2. DO NOT use prescriptive directives such as "You must sue", "You should reject this", or "This is illegal under Section X".
3. Use objective, educational phrasing: "This clause typically places financial liability on...", "Courts generally scrutinize clauses that...", "It may be advantageous to discuss with a lawyer whether...".
4. Always evaluate risk from the perspective of the citizen receiving or signing the document.

RISK RATING CRITERIA:
- "high": Clauses that present unilateral liability, indemnification traps, severe financial penalties, complete waivers of statutory rights, or automatic renewals without notice.
- "caution": Clauses that are unusually burdensome, asymmetric, or deviate from standard balanced commercial practices, but are not immediate legal traps.
- "standard": Customary boilerplate, standard definitions, or standard governing law provisions.

OBLIGATION ATTRIBUTION:
- "user": Affirmative duty on the user/signer.
- "counterparty": Duty placed upon the counterparty.
- "mutual": Bilateral obligations.
- "none": Recitals or general definitions.

ACTION CHECKLIST & LAWYER QUESTIONS:
- Checklist items must be concrete, operational steps categorized into "immediate", "before_signing", or "after_signing".
- Lawyer questions must be 5–8 high-leverage inquiries grounded directly in verbatim clause text, explaining the factual context.
`;

export function buildDocumentUserPrompt(text: string): string {
  return `Please analyze the following legal document and extract the structured analysis according to the schema:

<document_to_analyze>
${text}
</document_to_analyze>`;
}
```

---

### 2. Route Handler: `app/api/analyze/document/route.ts`

- **Role:** Backend AI Analysis API Endpoint.
- **Closest Analog:** `app/api/upload/route.ts`.
- **Data Flow:** Client sends JSON `{ text?: string, imageBase64?: string, mimeType?: string, fileName?: string }` -> Validates input and API keys -> Invokes `generateObject` via Anthropic Claude 3.5 Sonnet -> Validates output against `DocumentAnalysisSchema` -> Returns `{ success: true, data: DocumentAnalysis }` or structured error payload.

#### Key Characteristics & Constraints
- Must declare `export const runtime = 'nodejs';` and `export const maxDuration = 60;`.
- Validates that `process.env.ANTHROPIC_API_KEY` exists; returns 500 `CONFIG_ERROR` if missing.
- Rejects empty payloads with 400 `INVALID_REQUEST` and text snippets under 30 characters with 400 `EMPTY_TEXT`.
- Handles both text payloads (`prompt: buildDocumentUserPrompt(text)`) and multimodal image payloads (`messages: [...]` with `type: 'image'`).
- Catches runtime errors and returns structured JSON conforming to `ErrorResponseSchema` (`lib/schemas/common.ts`).

#### Concrete Code Pattern
```ts
// app/api/analyze/document/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { DocumentAnalysisSchema } from '@/lib/schemas/document';
import { DOCUMENT_SYSTEM_PROMPT, buildDocumentUserPrompt } from '@/lib/prompts/document';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'CONFIG_ERROR', message: 'Anthropic API key is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { text, imageBase64, mimeType } = body;

    if (!text && !imageBase64) {
      return NextResponse.json(
        { error: 'INVALID_REQUEST', message: 'Either document text or image data is required.' },
        { status: 400 }
      );
    }

    const model = anthropic('claude-3-5-sonnet-20241022');
    let analysisResult;

    if (imageBase64) {
      analysisResult = await generateObject({
        model,
        schema: DocumentAnalysisSchema,
        system: DOCUMENT_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze the attached legal document image and extract the complete structured analysis:',
              },
              {
                type: 'image',
                image: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
              },
            ],
          },
        ],
      });
    } else {
      if (typeof text !== 'string' || text.trim().length < 30) {
        return NextResponse.json(
          { error: 'EMPTY_TEXT', message: 'Document text must be at least 30 characters.' },
          { status: 400 }
        );
      }

      analysisResult = await generateObject({
        model,
        schema: DocumentAnalysisSchema,
        system: DOCUMENT_SYSTEM_PROMPT,
        prompt: buildDocumentUserPrompt(text),
      });
    }

    return NextResponse.json({
      success: true,
      data: analysisResult.object,
    });
  } catch (error: unknown) {
    console.error('Error analyzing document:', error);
    return NextResponse.json(
      {
        error: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to complete AI document analysis.',
      },
      { status: 500 }
    );
  }
}
```

---

### 3. Sticky Anchor Navigation: `components/decoder/StickyNav.tsx`

- **Role:** Floating sticky sub-header providing instant section jumping, scroll-spy highlight, badge counts, and report reset.
- **Closest Analog:** `components/shared/Header.tsx` (sticky styling, border, backdrop blur) and `components/ui/tabs.tsx` (tab indicator state).
- **Data Flow:** Receives section counts (`riskCount`, `checklistCount`, `lawyerPrepCount`), active section ID from scroll-spy, and `onReset` callback.

#### Key Characteristics & Constraints
- Sticky positioning docked right under the main header: `sticky top-16 z-30 bg-[#0B0F17]/90 backdrop-blur border-b border-slate-800`.
- Mobile kinetic horizontal scrolling with `overflow-x-auto no-scrollbar flex-nowrap`.
- Smooth scroll navigation targeting `#summary-section`, `#risks-section`, `#checklist-section`, and `#lawyer-prep-section`.
- Prominent "Analyze Another Document" reset button per Decision D-04.

#### Concrete Code Pattern
```tsx
// components/decoder/StickyNav.tsx
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
                  <span className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] ${
                    isActive ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-slate-800 text-slate-400'
                  }`}>
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
```

---

### 4. Executive Summary Card: `components/decoder/ExecutiveSummaryCard.tsx`

- **Role:** Layer 1 Dossier Presentation: Classification tag, contracting parties pills, and <200 word summary brief.
- **Closest Analog:** `components/shared/LegalDisclaimer.tsx` (`LegalDisclaimerCard`) & `components/upload/FilePreviewCard.tsx`.
- **Data Flow:** Consumes `documentType: string`, `parties: string[]`, `summary: string` from `DocumentAnalysis`.

#### Key Characteristics & Constraints
- Offset anchor compensation: `id="summary-section" className="scroll-mt-28"`.
- Gold border framing: `border border-[#D4AF37]/30 bg-[#111827]`.
- Empty parties fallback per UI-SPEC: `"Signatory entities not explicitly declared in source text"` in muted italics.
- Typography: Headline in `DM Serif Display` (`font-serif`), summary in `DM Sans` (`text-slate-300 leading-relaxed`), party tags in `JetBrains Mono` (`font-mono text-xs`).

#### Concrete Code Pattern
```tsx
// components/decoder/ExecutiveSummaryCard.tsx
import React from 'react';
import { FileText, Users, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ExecutiveSummaryCardProps {
  documentType: string;
  parties: string[];
  summary: string;
}

export function ExecutiveSummaryCard({
  documentType,
  parties,
  summary,
}: ExecutiveSummaryCardProps) {
  return (
    <section
      id="summary-section"
      className="scroll-mt-28 rounded-2xl border border-[#D4AF37]/30 bg-[#111827] p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-white tracking-wide">
              Executive Brief
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Plain-English analysis and contracting overview
            </p>
          </div>
        </div>

        <Badge variant="gold" className="self-start sm:self-center font-mono text-xs px-3 py-1">
          {documentType || 'Legal Document'}
        </Badge>
      </div>

      {/* Signatory Entities / Contracting Parties */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Contracting Parties</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {parties && parties.length > 0 ? (
            parties.map((party, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-lg border border-slate-700/60 bg-slate-900/60 px-2.5 py-1 text-xs font-mono text-slate-200"
              >
                {party}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic font-mono">
              Signatory entities not explicitly declared in source text
            </span>
          )}
        </div>
      </div>

      {/* Summary Body */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
          <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Executive Summary</span>
        </div>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
          {summary}
        </p>
      </div>
    </section>
  );
}
```

---

### 5. Clause Card: `components/decoder/ClauseCard.tsx`

- **Role:** Layer 2 Individual Clause Risk Card with Radix Accordion toggle for verbatim source text.
- **Closest Analog:** `components/ui/accordion.tsx`, `components/ui/badge.tsx`, and `components/upload/FilePreviewCard.tsx`.
- **Data Flow:** Receives a single `Clause` object (`id`, `title`, `simplified`, `risk`, `riskReason`, `obligation`, `originalText`).

#### Key Characteristics & Constraints
- Anchor ID: `id={`clause-${clause.id}`}` with `scroll-mt-28` for smooth navigation.
- High-Risk visual emphasis per Decision D-07: `border-l-4 border-red-500/80 bg-red-950/20` with alert icon.
- Caution visual emphasis: `border-l-4 border-amber-500/60 bg-amber-950/15`.
- Standard visual emphasis: `border-l-4 border-emerald-500/50 bg-emerald-950/10`.
- Contractual obligation badge in `JetBrains Mono` per Decision D-08 (`Duty: User`, `Duty: Counterparty`, `Mutual`, `Duty: General / None`).
- Radix Accordion reveals verbatim source text in `JetBrains Mono` text-[11px] inside a max-h-80 scrollable container.

#### Concrete Code Pattern
```tsx
// components/decoder/ClauseCard.tsx
'use client';

import React from 'react';
import { Clause } from '@/lib/schemas/document';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

export interface ClauseCardProps {
  clause: Clause;
}

export function ClauseCard({ clause }: ClauseCardProps) {
  const isHighRisk = clause.risk === 'high';
  const isCaution = clause.risk === 'caution';

  const riskBadgeVariant = isHighRisk ? 'high' : isCaution ? 'caution' : 'standard';
  const riskLabel = isHighRisk ? 'High Risk' : isCaution ? 'Caution' : 'Standard';

  const containerStyles = isHighRisk
    ? 'border-l-4 border-red-500/80 bg-red-950/20 border-slate-800'
    : isCaution
    ? 'border-l-4 border-amber-500/60 bg-amber-950/15 border-slate-800'
    : 'border-l-4 border-emerald-500/50 bg-emerald-950/10 border-slate-800';

  const obligationBadgeStyle = {
    user: 'border-blue-500/30 bg-blue-950/30 text-blue-300',
    counterparty: 'border-indigo-500/30 bg-indigo-950/30 text-indigo-300',
    mutual: 'border-slate-500/40 bg-slate-800/40 text-slate-300',
    none: 'border-slate-700/40 bg-slate-900/40 text-slate-400',
  }[clause.obligation] || 'border-slate-700/40 bg-slate-900/40 text-slate-400';

  const obligationLabel = {
    user: 'Duty: User',
    counterparty: 'Duty: Counterparty',
    mutual: 'Duty: Mutual',
    none: 'Duty: General / None',
  }[clause.obligation] || 'Duty: None';

  return (
    <article
      id={`clause-${clause.id}`}
      className={`scroll-mt-28 rounded-xl border p-5 transition-all duration-300 shadow-md ${containerStyles}`}
    >
      <div className="space-y-3">
        {/* Header & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isHighRisk ? (
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            ) : isCaution ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <h3 className="font-sans text-base sm:text-lg font-semibold text-slate-100">
              {clause.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${obligationBadgeStyle}`}
            >
              {obligationLabel}
            </span>
            <Badge variant={riskBadgeVariant} className="text-xs">
              {riskLabel}
            </Badge>
          </div>
        </div>

        {/* Simplified Plain-English Explanation */}
        <p className="text-sm text-slate-300 font-sans leading-relaxed">
          {clause.simplified}
        </p>

        {/* Objective Risk Rationale */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-3 text-xs text-slate-400">
          <span className="font-mono uppercase text-slate-300 mr-1.5 font-medium">
            Analysis Rationale:
          </span>
          {clause.riskReason}
        </div>

        {/* Verbatim Source Accordion */}
        <Accordion type="single" collapsible className="w-full pt-1 border-t border-slate-800/60">
          <AccordionItem value="verbatim" className="border-none">
            <AccordionTrigger className="text-xs font-mono text-[#D4AF37] hover:text-[#C5A059] py-2 hover:no-underline">
              Show verbatim source text
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-lg bg-slate-950 p-3 border border-slate-800 max-h-80 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap">
                {clause.originalText}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}
```

---

### 6. Risk Scorecard Container: `components/decoder/RiskScorecard.tsx`

- **Role:** Layer 2 Dossier Container: Traffic-light filter chips (`All [N]`, `🔴 High [N]`, `🟡 Caution [N]`, `🟢 Standard [N]`), sorting High-risk first, and empty filter fallback.
- **Closest Analog:** `components/ui/tabs.tsx` & `app/page.tsx`.
- **Data Flow:** Receives `clauses: Clause[]` from `DocumentAnalysis`.

#### Key Characteristics & Constraints
- Offset anchor compensation: `id="risks-section" className="scroll-mt-28"`.
- Sorting order: High risk (`high`) -> Caution (`caution`) -> Standard (`standard`).
- Interactive filter chips updating active filter state.
- Empty filter state with reset action per UI-SPEC copywriting contract.

#### Concrete Code Pattern
```tsx
// components/decoder/RiskScorecard.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Clause } from '@/lib/schemas/document';
import { ClauseCard } from './ClauseCard';
import { Shield, ShieldAlert, AlertTriangle, ShieldCheck, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RiskScorecardProps {
  clauses: Clause[];
}

type FilterTier = 'all' | 'high' | 'caution' | 'standard';

export function RiskScorecard({ clauses }: RiskScorecardProps) {
  const [filterTier, setFilterTier] = useState<FilterTier>('all');

  const riskOrder: Record<string, number> = { high: 0, caution: 1, standard: 2 };

  const sortedClauses = useMemo(() => {
    return [...clauses].sort((a, b) => (riskOrder[a.risk] ?? 3) - (riskOrder[b.risk] ?? 3));
  }, [clauses]);

  const counts = useMemo(() => ({
    all: clauses.length,
    high: clauses.filter((c) => c.risk === 'high').length,
    caution: clauses.filter((c) => c.risk === 'caution').length,
    standard: clauses.filter((c) => c.risk === 'standard').length,
  }), [clauses]);

  const displayedClauses = useMemo(() => {
    if (filterTier === 'all') return sortedClauses;
    return sortedClauses.filter((c) => c.risk === filterTier);
  }, [sortedClauses, filterTier]);

  return (
    <section id="risks-section" className="scroll-mt-28 space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-serif text-2xl font-semibold text-white tracking-wide">
              Risk Scorecard
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Clauses triaged across three traffic-light risk tiers with verbatim citations
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterTier('all')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Clauses ({counts.all})
          </button>
          <button
            onClick={() => setFilterTier('high')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'high'
                ? 'bg-red-950/80 text-red-300 border border-red-500/60 font-semibold'
                : 'bg-slate-900 text-red-400/80 hover:text-red-300 border border-slate-800'
            }`}
          >
            🔴 High Risk ({counts.high})
          </button>
          <button
            onClick={() => setFilterTier('caution')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'caution'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/60 font-semibold'
                : 'bg-slate-900 text-amber-400/80 hover:text-amber-300 border border-slate-800'
            }`}
          >
            🟡 Caution ({counts.caution})
          </button>
          <button
            onClick={() => setFilterTier('standard')}
            className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
              filterTier === 'standard'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-semibold'
                : 'bg-slate-900 text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            🟢 Standard ({counts.standard})
          </button>
        </div>
      </div>

      {/* Clause Cards Grid */}
      {displayedClauses.length > 0 ? (
        <div className="space-y-4">
          {displayedClauses.map((clause) => (
            <ClauseCard key={clause.id} clause={clause} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-8 text-center space-y-3">
          <p className="font-sans text-base font-semibold text-slate-200">
            No clauses match the selected risk tier
          </p>
          <p className="text-xs text-slate-400">
            Switch filter to 'All Clauses' to review all analyzed sections of this document.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterTier('all')}
            className="text-xs mt-2"
          >
            Reset to All Clauses
          </Button>
        </div>
      )}
    </section>
  );
}
```

---

### 7. Actionable Checklist: `components/decoder/ActionChecklist.tsx`

- **Role:** Layer 3 Dossier Presentation: Chronological operational steps (*Immediate*, *Before Signing*, *After Signing*) with interactive check-off states and semantic action pills.
- **Closest Analog:** `components/ui/checkbox.tsx` & `components/ui/badge.tsx`.
- **Data Flow:** Consumes `checklist: ActionItem[]` and optional `onClauseCrossReference(clauseId: string)` callback.

#### Key Characteristics & Constraints
- Offset anchor compensation: `id="checklist-section" className="scroll-mt-28"`.
- Groups items chronologically into:
  - *Immediate* (`timing === 'immediate'`)
  - *Before Signing* (`timing === 'before_signing'`)
  - *After Signing* (`timing === 'after_signing'`)
- Action Badges styling in `JetBrains Mono`:
  - `negotiate`: `border-purple-500/40 bg-purple-950/30 text-purple-300`
  - `verify`: `border-amber-500/40 bg-amber-950/30 text-amber-300`
  - `refuse`: `border-red-500/40 bg-red-950/30 text-red-300`
  - `accept`: `border-emerald-500/40 bg-emerald-950/30 text-emerald-300`
- Interactive ephemeral check-off state via `useState<Record<string, boolean>>`.
- Clickable `Re: Clause {id}` button trigger to smoothly scroll to clause and trigger momentary highlight.

#### Concrete Code Pattern
```tsx
// components/decoder/ActionChecklist.tsx
'use client';

import React, { useState } from 'react';
import { ActionItem } from '@/lib/schemas/document';
import { CheckSquare, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export interface ActionChecklistProps {
  checklist: ActionItem[];
  onClauseCrossReference?: (clauseId: string) => void;
}

export function ActionChecklist({ checklist, onClauseCrossReference }: ActionChecklistProps) {
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});

  const toggleItem = (id: string) => {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const timingGroups = [
    { key: 'immediate', title: 'Immediate Operational Priorities', badge: 'Immediate' },
    { key: 'before_signing', title: 'Action Required Before Signing', badge: 'Before Signing' },
    { key: 'after_signing', title: 'Post-Execution Compliance & Monitoring', badge: 'After Signing' },
  ];

  const getActionBadgeClass = (type: string) => {
    switch (type) {
      case 'negotiate':
        return 'border-purple-500/40 bg-purple-950/30 text-purple-300';
      case 'verify':
        return 'border-amber-500/40 bg-amber-950/30 text-amber-300';
      case 'refuse':
        return 'border-red-500/40 bg-red-950/30 text-red-300';
      case 'accept':
        return 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300';
      default:
        return 'border-slate-700 bg-slate-800 text-slate-300';
    }
  };

  return (
    <section id="checklist-section" className="scroll-mt-28 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl font-semibold text-white tracking-wide">
            Actionable Checklist
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Chronologically ordered recommendations with interactive execution tracking
        </p>
      </div>

      <div className="space-y-6">
        {timingGroups.map((group) => {
          const items = checklist.filter((item) => item.timing === group.key);

          return (
            <div
              key={group.key}
              className="rounded-xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4 shadow-lg"
            >
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <h3 className="font-sans text-base font-semibold text-slate-200">
                  {group.title}
                </h3>
                <span className="font-mono text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                  {items.length} items
                </span>
              </div>

              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => {
                    const isChecked = !!checkedMap[item.id];

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3.5 p-3 rounded-lg border transition-all ${
                          isChecked
                            ? 'border-slate-800/40 bg-slate-900/20 opacity-60'
                            : 'border-slate-800 bg-slate-900/60'
                        }`}
                      >
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleItem(item.id)}
                            id={`check-${item.id}`}
                          />
                        </div>

                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-mono capitalize ${getActionBadgeClass(
                                item.actionType
                              )}`}
                            >
                              {item.actionType}
                            </span>

                            {item.relatedClauseId && (
                              <button
                                onClick={() => onClauseCrossReference?.(item.relatedClauseId!)}
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-[#D4AF37] hover:underline"
                              >
                                Re: {item.relatedClauseId}
                                <ArrowUpRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <p
                            className={`text-xs sm:text-sm font-sans leading-relaxed ${
                              isChecked ? 'line-through text-slate-500' : 'text-slate-300'
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400 font-sans flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  No {group.badge.toLowerCase()} action items identified
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
```

---

### 8. Lawyer Preparation Guide: `components/decoder/LawyerPrepGuide.tsx`

- **Role:** Layer 4 Dossier Presentation: 5–8 high-leverage questions grounded in verbatim clauses with one-click copy and cross-referencing.
- **Closest Analog:** `components/upload/FilePreviewCard.tsx`, `components/ui/button.tsx`, and `components/shared/LegalDisclaimer.tsx`.
- **Data Flow:** Consumes `lawyerQuestions: LawyerQuestion[]` and optional `onClauseCrossReference(clauseId: string)`.

#### Key Characteristics & Constraints
- Offset anchor compensation: `id="lawyer-prep-section" className="scroll-mt-28"`.
- 1-click clipboard copy with `navigator.clipboard.writeText` and `toast.success('Question copied to clipboard')`.
- Displays strategic contextual rationale explaining *why* this inquiry is high leverage.
- Cross-reference link `Re: Clause {id}` with smooth scroll to target clause.

#### Concrete Code Pattern
```tsx
// components/decoder/LawyerPrepGuide.tsx
'use client';

import React from 'react';
import { LawyerQuestion } from '@/lib/schemas/document';
import { HelpCircle, Copy, ArrowUpRight, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface LawyerPrepGuideProps {
  lawyerQuestions: LawyerQuestion[];
  onClauseCrossReference?: (clauseId: string) => void;
}

export function LawyerPrepGuide({
  lawyerQuestions,
  onClauseCrossReference,
}: LawyerPrepGuideProps) {
  const handleCopyQuestion = (questionText: string) => {
    navigator.clipboard.writeText(questionText);
    toast.success('Question copied to clipboard');
  };

  return (
    <section id="lawyer-prep-section" className="scroll-mt-28 space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#D4AF37]" />
          <h2 className="font-serif text-2xl font-semibold text-white tracking-wide">
            Lawyer Preparation Guide
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          High-leverage consultation inquiries grounded directly in verbatim agreement terms
        </p>
      </div>

      <div className="space-y-4">
        {lawyerQuestions.map((q, idx) => (
          <article
            key={q.id || idx}
            className="rounded-xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4 shadow-lg transition-all hover:border-slate-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 font-mono text-xs font-bold mt-0.5">
                  Q{idx + 1}
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-sans text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                    {q.question}
                  </h3>
                  {q.relatedClauseId && (
                    <button
                      onClick={() => onClauseCrossReference?.(q.relatedClauseId!)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-[#D4AF37] hover:underline"
                    >
                      Re: {q.relatedClauseId}
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyQuestion(q.question)}
                className="h-8 text-xs font-mono border-slate-700 bg-slate-900 text-slate-300 hover:text-white shrink-0 self-end sm:self-auto"
              >
                <Copy className="w-3 h-3 mr-1.5" />
                Copy Question
              </Button>
            </div>

            {/* Strategic Rationale & Context */}
            <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800/80 text-xs text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-slate-300">
                <Scale className="w-3 h-3 text-[#D4AF37]" />
                <span>Strategic Context</span>
              </div>
              <p className="leading-relaxed font-sans">{q.context}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

---

### 9. Multi-Stage Progress Loader: `components/decoder/AnalysisProgress.tsx`

- **Role:** Active Analysis Indicator during the 10–15s AI pipeline window.
- **Closest Analog:** `components/upload/DocumentDropzone.tsx` (processing state) and `components/shared/Header.tsx` (shield privacy badge).
- **Data Flow:** Mounted when `status === 'analyzing'`. Displays real-time elapsed seconds and stages.

#### Concrete Code Pattern
```tsx
// components/decoder/AnalysisProgress.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { FileSearch, ShieldAlert, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Deconstructing document structure & contracting parties...', icon: FileSearch, minSec: 0 },
  { id: 2, label: 'Evaluating clause risks & obligation asymmetry...', icon: ShieldAlert, minSec: 4 },
  { id: 3, label: 'Formulating actionable checklist & counsel prep guide...', icon: CheckCircle2, minSec: 8 },
];

export function AnalysisProgress() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentStageIndex = elapsedSeconds < 4 ? 0 : elapsedSeconds < 8 ? 1 : 2;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#111827]/90 p-8 text-center space-y-6 max-w-xl mx-auto backdrop-blur-md shadow-2xl">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] animate-pulse">
          <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-serif text-xl font-medium text-white tracking-wide">
          Analyzing Legal Document
        </h3>
        <p className="text-xs text-slate-400 font-mono">
          Elapsed time: <span className="text-[#D4AF37] font-semibold">{elapsedSeconds}s</span> (typically completes in 10–15s)
        </p>
      </div>

      <div className="space-y-3 text-left pt-2">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const StageIcon = stage.icon;

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-3 rounded-lg border text-xs transition-all duration-300 ${
                isCurrent
                  ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5 text-white font-medium'
                  : isDone
                  ? 'border-slate-800/60 bg-slate-900/30 text-slate-400'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  isCurrent
                    ? 'bg-[#D4AF37] text-black font-bold'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <StageIcon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{stage.label}</span>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        Zero-retention volatile processing in progress
      </div>
    </div>
  );
}
```

---

### 10. Analysis Error Diagnostic Card: `components/decoder/AnalysisErrorCard.tsx`

- **Role:** Diagnostic error state replacing the progress indicator on API failure or network timeout.
- **Closest Analog:** `components/shared/LegalDisclaimer.tsx` (`LegalDisclaimerCard`) & `components/upload/DocumentDropzone.tsx`.
- **Data Flow:** Receives `errorMessage: string`, `onRetry: () => void`, and `onAdjustInput: () => void`.

#### Concrete Code Pattern
```tsx
// components/decoder/AnalysisErrorCard.tsx
'use client';

import React from 'react';
import { AlertTriangle, RotateCcw, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AnalysisErrorCardProps {
  errorMessage: string;
  onRetry: () => void;
  onAdjustInput: () => void;
}

export function AnalysisErrorCard({
  errorMessage,
  onRetry,
  onAdjustInput,
}: AnalysisErrorCardProps) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-6 sm:p-8 max-w-xl mx-auto shadow-2xl space-y-5">
      <div className="flex items-start gap-3.5">
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2 text-red-400 shrink-0">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-white tracking-wide">
            Analysis Encountered an Issue
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
            Gavel could not complete automated analysis: {errorMessage}. Your document was processed ephemerally and has been cleared from volatile memory.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800/80">
        <Button
          variant="outline"
          size="sm"
          onClick={onAdjustInput}
          className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
          Adjust Input Text
        </Button>
        <Button
          size="sm"
          onClick={onRetry}
          className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold text-xs px-4"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Retry Analysis
        </Button>
      </div>
    </div>
  );
}
```

---

### 11. Page Orchestrator: `app/analyze/document/page.tsx`

- **Role:** Mode 1 Dedicated Route Page Orchestrator.
- **Closest Analog:** `app/page.tsx`.
- **Data Flow:** Coordinates view states (`idle` -> `analyzing` -> `dossier` or `error`). Handles cross-reference smooth scrolling with gold highlight flash pulse.

#### Concrete Code Pattern
```tsx
// app/analyze/document/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Header } from '@/components/shared/Header';
import { LegalDisclaimerCard } from '@/components/shared/LegalDisclaimer';
import { DocumentDropzone } from '@/components/upload/DocumentDropzone';
import { ManualPasteArea } from '@/components/upload/ManualPasteArea';
import { FilePreviewCard } from '@/components/upload/FilePreviewCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Zap, ArrowRight } from 'lucide-react';
import { UploadData } from '@/lib/schemas/upload';
import { DocumentAnalysis } from '@/lib/schemas/document';
import { DownsampleResult } from '@/lib/image-utils';

import { StickyNav } from '@/components/decoder/StickyNav';
import { ExecutiveSummaryCard } from '@/components/decoder/ExecutiveSummaryCard';
import { RiskScorecard } from '@/components/decoder/RiskScorecard';
import { ActionChecklist } from '@/components/decoder/ActionChecklist';
import { LawyerPrepGuide } from '@/components/decoder/LawyerPrepGuide';
import { AnalysisProgress } from '@/components/decoder/AnalysisProgress';
import { AnalysisErrorCard } from '@/components/decoder/AnalysisErrorCard';

type AnalysisState = 'idle' | 'analyzing' | 'dossier' | 'error';

export default function DocumentDecoderPage() {
  const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [uploadedDoc, setUploadedDoc] = useState<UploadData | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<DownsampleResult | null>(null);
  const [manualText, setManualText] = useState<string>('');
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<DocumentAnalysis | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('summary-section');

  const handleStartAnalysis = useCallback(async () => {
    setAnalysisState('analyzing');
    setErrorMessage('');

    try {
      const payload: { text?: string; imageBase64?: string; mimeType?: string; fileName?: string } = {};

      if (uploadedDoc) {
        if (uploadedDoc.isImage) {
          payload.imageBase64 = uploadedDoc.rawBase64;
          payload.mimeType = uploadedDoc.mimeType;
          payload.fileName = uploadedDoc.fileName;
        } else {
          payload.text = uploadedDoc.text;
          payload.fileName = uploadedDoc.fileName;
        }
      } else if (manualText.trim()) {
        payload.text = manualText.trim();
        payload.fileName = 'manual-input.txt';
      } else {
        throw new Error('No document content or text provided for analysis.');
      }

      const res = await fetch('/api/analyze/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Analysis could not be completed.');
      }

      setAnalysisData(json.data);
      setAnalysisState('dossier');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setAnalysisState('error');
    }
  }, [uploadedDoc, manualText]);

  const handleClauseCrossReference = useCallback((clauseId: string) => {
    const el = document.getElementById(`clause-${clauseId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#D4AF37]', 'bg-[#D4AF37]/10');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#D4AF37]', 'bg-[#D4AF37]/10');
      }, 1800);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisData(null);
    setUploadedDoc(null);
    setCompressionInfo(null);
    setManualText('');
    setAnalysisState('idle');
  }, []);

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-legal-obsidian text-foreground flex flex-col">
      <Header />

      {analysisState === 'dossier' && analysisData && (
        <StickyNav
          activeSection={activeSection}
          onNavigate={handleNavigateSection}
          onReset={handleReset}
          counts={{
            risks: analysisData.clauses.length,
            checklist: analysisData.checklist.length,
            lawyerQuestions: analysisData.lawyerQuestions.length,
          }}
        />
      )}

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        <LegalDisclaimerCard />

        {analysisState === 'idle' && (
          <div className="rounded-2xl border border-slate-800 bg-[#111827]/70 p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white tracking-wide">
                Document Intake & Analysis Setup
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Upload a lease, contract, or notice — or paste clause text directly for instant evaluation.
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as 'upload' | 'manual')}
              className="w-full space-y-5"
            >
              <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-900 border-slate-800">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Paste Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                {uploadedDoc ? (
                  <div className="space-y-4">
                    <FilePreviewCard
                      fileName={uploadedDoc.fileName}
                      sizeBytes={uploadedDoc.sizeBytes}
                      wordCount={uploadedDoc.wordCount}
                      mimeType={uploadedDoc.mimeType}
                      isImage={uploadedDoc.isImage}
                      compressionInfo={compressionInfo}
                      onRemove={() => setUploadedDoc(null)}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={handleStartAnalysis}
                        className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-9 text-xs px-4"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                        Analyze Legal Document
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <DocumentDropzone
                    onUploadSuccess={(data, comp) => {
                      setUploadedDoc(data);
                      setCompressionInfo(comp || null);
                    }}
                    onFallbackToManual={(reason) => {
                      setFallbackNotice(reason);
                      setActiveTab('manual');
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <ManualPasteArea
                  value={manualText}
                  onChange={setManualText}
                  fallbackNotice={fallbackNotice}
                  onClearFallbackNotice={() => setFallbackNotice(null)}
                />
                {manualText.trim().length >= 30 && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleStartAnalysis}
                      className="bg-[#D4AF37] hover:bg-[#C5A059] text-black font-semibold h-9 text-xs px-4"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1 text-black" />
                      Analyze Legal Document
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {analysisState === 'analyzing' && <AnalysisProgress />}

        {analysisState === 'error' && (
          <AnalysisErrorCard
            errorMessage={errorMessage}
            onRetry={handleStartAnalysis}
            onAdjustInput={() => setAnalysisState('idle')}
          />
        )}

        {analysisState === 'dossier' && analysisData && (
          <div className="space-y-12">
            <ExecutiveSummaryCard
              documentType={analysisData.documentType}
              parties={analysisData.parties}
              summary={analysisData.summary}
            />

            <RiskScorecard clauses={analysisData.clauses} />

            <ActionChecklist
              checklist={analysisData.checklist}
              onClauseCrossReference={handleClauseCrossReference}
            />

            <LawyerPrepGuide
              lawyerQuestions={analysisData.lawyerQuestions}
              onClauseCrossReference={handleClauseCrossReference}
            />
          </div>
        )}
      </main>
    </div>
  );
}
```

---

### 12. Landing Page Entry Point: `app/page.tsx` (Modified)

- **Role:** Directs Mode 1 entry to `/analyze/document` per Decision D-03.
- **Concrete Change:** Replaces placeholder inline button click with `useRouter().push('/analyze/document')` or Next.js `<Link href="/analyze/document">`.

---

### 13. Backend Test Suite: `tests/analyze-document-route.test.ts`

- **Role:** Route Handler Unit and Integration Tests.
- **Closest Analog:** `tests/upload-route.test.ts`.
- **Data Flow:** Mocks `ai` module's `generateObject`. Verifies request payloads, text length validation, missing API keys, multimodal image handling, and error response formatting.

#### Concrete Code Pattern
```ts
// tests/analyze-document-route.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/analyze/document/route';
import { generateObject } from 'ai';

vi.mock('ai', () => ({
  generateObject: vi.fn(),
}));

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: vi.fn(() => 'mocked-model'),
}));

function createAnalyzeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/analyze/document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Analyze Document Route Handler (/api/analyze/document)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, ANTHROPIC_API_KEY: 'test-api-key' };
  });

  it('rejects requests without ANTHROPIC_API_KEY (500 CONFIG_ERROR)', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const req = createAnalyzeRequest({ text: 'Valid legal agreement with sufficient length.' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('CONFIG_ERROR');
  });

  it('rejects empty payloads with missing text and imageBase64 (400 INVALID_REQUEST)', async () => {
    const req = createAnalyzeRequest({});
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('INVALID_REQUEST');
  });

  it('rejects text payloads under 30 characters (400 EMPTY_TEXT)', async () => {
    const req = createAnalyzeRequest({ text: 'Too short.' });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('EMPTY_TEXT');
  });

  it('successfully analyzes valid text document using generateObject', async () => {
    const mockAnalysis = {
      documentType: 'Commercial Lease',
      parties: ['Landlord LLC', 'Tenant Inc'],
      summary: 'Standard commercial tenancy.',
      clauses: [],
      checklist: [],
      lawyerQuestions: [],
    };

    (generateObject as any).mockResolvedValueOnce({ object: mockAnalysis });

    const req = createAnalyzeRequest({
      text: 'This is a valid legal document text with more than thirty characters.',
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.documentType).toBe('Commercial Lease');
  });
});
```

---

### 14. Component Contract Test Suite: `tests/decoder-components.test.ts`

- **Role:** Vitest Component Contract & Logic Tests.
- **Closest Analog:** `tests/disclaimer.test.ts` & `tests/schemas.test.ts`.
- **Target Coverage:**
  - `RiskScorecard`: High-risk sort order verification and filter chip matching.
  - `ActionChecklist`: Chronological group categorization and action badge pill classes.
  - `LawyerPrepGuide`: Consultation question rendering and clipboard copy triggering.
  - `AnalysisProgress`: Milestone stage transitions based on elapsed seconds.

---

## Technical Debt & Pattern Anti-Goals

1. **NO Hand-Rolled Collapsible Accordions:** Use `components/ui/accordion.tsx` (Radix UI) to ensure proper ARIA attributes, keyboard accessibility, and CSS height transitions.
2. **NO Hardcoded Arbitrary Colors:** Never introduce `#ff0000` or raw tailwind colors inconsistent with tokens. High risk MUST use `border-red-500/80 bg-red-950/20 text-red-400`. Legal gold MUST use `#D4AF37`.
3. **NO Database or LocalStorage Persistence:** The analysis report and interactive checkbox states MUST remain in ephemeral React component state only. Zero disk or database persistence is permitted.
4. **NO Direct Prescriptive Advice:** All generated prompts, cards, and text summaries MUST adhere to statutory non-UPL safe harbor language ("Educational summary", "High risk unilateral duty", "Discuss with counsel").

---

## PATTERN MAPPING COMPLETE
