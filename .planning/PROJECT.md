# Gavel

## What This Is

Gavel is a GenAI-powered legal assistance platform that makes legal information accessible, comprehensible, and actionable for everyday citizens and small business owners. Users can upload legal documents (PDF, DOCX, or images), describe an active legal dispute in plain conversational language, or compare two versions of a contract to receive instant plain-English summaries, traffic-light risk-rated clause breakdowns, actionable checklists, and targeted questions for legal counsel.

Gavel strictly provides legal information and guidance to bridge the gap between confusion and informed consultation—it is not a substitute for professional legal advice or attorney-client representation.

## Core Value

Translate opaque legal jargon and documents into clear, risk-scored, plain-English explanations with immediate, concrete next steps so citizens know their rights, obligations, and what to ask a lawyer.

## Business Context

- **Customer / Target Audience**: Everyday citizens (tenants, employees, freelancers, consumers) facing contracts or disputes without legal counsel, and small business owners/solopreneurs negotiating agreements without an in-house legal team.
- **Revenue Model**: Free hackathon / open-access public utility v1 (future: tiered API or premium consultation-prep reports).
- **Success Metric**: Time from upload/input to complete analysis rendered < 15 seconds; 100% of analyses include ≥ 3 actionable next steps; 100% legal disclaimer compliance; 7/7 problem statement use cases addressed.
- **Strategy Notes**: Detailed specifications provided in [gavel-prd-frd.html](file:///home/zeph/Code/gavel/gavel-prd-frd.html).

## Requirements

### Validated

- [x] **FILE-01**: In-memory file upload supporting PDF, Word (.docx), JPG, and PNG up to 10MB with drag-and-drop and client-side validation. — Phase 1
- [x] **EXTR-01**: Server-side text extraction using `pdf-parse` for PDFs, `mammoth` for DOCX, and Claude Vision base64 handling for images. — Phase 1
- [x] **EXTR-02**: Text cleaning, sanitization, and fallback manual text paste when file extraction yields unreadable content or fails. — Phase 1
- [x] **UX-01**: Dark, elegant, accessible typography and palette (DM Serif Display, DM Sans, JetBrains Mono, gold accents) built with Tailwind CSS and Radix/shadcn UI. — Phase 1
- [x] **UX-02**: Universal Prominent Legal Disclaimer present on all output screens, cards, and page footers. — Phase 1
- [x] **MODE1-01**: Document Decoder AI pipeline generating typed Zod structured output (`DocumentAnalysisSchema`) via `generateObject` with Claude 3.5 Sonnet. — Phase 2
- [x] **MODE1-02**: Document Decoder UI displaying Document Type badge, Executive Plain-English Summary, and Parties Identified. — Phase 2
- [x] **MODE1-03**: Risk Scorecard component rating clauses (High 🔴, Caution 🟡, Standard 🟢) with simplified explanations and expandable original clause excerpts. — Phase 2
- [x] **MODE1-04**: Actionable Checklist categorized by priority (Immediate, Before Signing, After Signing) with actionable tags (Negotiate, Verify, Refuse, Accept). — Phase 2
- [x] **MODE1-05**: Tailored Lawyer Preparation Guide offering 5–8 specific, context-aware questions derived directly from the document. — Phase 2
- [x] **MODE2-01**: Situation Navigator input interface with conversational text input, situation category chips (auto-detected or selectable), and pre-submit prompt if input is < 20 words. — Phase 3
- [x] **MODE2-02**: Situation Navigator AI pipeline returning typed `SituationAnalysisSchema` with auto-detected category (Tenancy, Employment, Consumer, etc.). — Phase 3
- [x] **MODE2-03**: Situation Navigator UI presenting Situation Summary, "Your Rights" accordion cards, and Time-Sensitive Warning Flags. — Phase 3
- [x] **MODE2-04**: Next Steps Roadmap timeline with urgency tags (Immediate, Within 7 Days, Within 30 Days, When Ready) and "doable without a lawyer" indicators. — Phase 3
- [x] **MODE2-05**: Interactive "Documents to Gather" checklist and "When to Call a Lawyer" guidance with estimated dispute timeline. — Phase 3

### Active

- [ ] **MODE3-01**: Document Comparison dual upload interface (Document A vs Document B) with customizable label inputs and parallel upload handling.
- [ ] **MODE3-02**: Document Comparison AI pipeline generating typed `ComparisonSchema` with clause-by-clause diffs and overall favorability verdict (`docA`, `docB`, or `neutral`).
- [ ] **MODE3-03**: Document Comparison UI displaying Side-by-Side Differences Table, Inconsistency alerts (Critical, Notable, Minor), and Negotiation Guide (Push Back, Accept, Flag for Lawyer).
- [ ] **MODE4-01**: Interactive Q&A chat endpoint (`/api/chat`) with streaming SSE via Vercel AI SDK `streamText` anchored in the document/situation context and prior analysis.
- [ ] **MODE4-02**: Slide-in or persistent ChatPanel component utilizing `@ai-sdk/react` (`useChat`) for progressive real-time answers citing specific clauses.
- [ ] **UX-03**: Report export tools allowing users to copy complete analysis to clipboard or download formatted text.
- [ ] **PERF-01**: Responsive, one-handed mobile-optimized layout with sub-15s analysis time and sub-2s streaming time-to-first-token.

### Out of Scope

- **User Accounts / Auth**: No user registration, authentication, login, or user profiles in V1 — zero friction and zero PII storage.
- **Server-Side Document Storage**: No persistence of uploaded documents, database tables, or S3/cloud storage; files processed in memory and immediately discarded.
- **Lawyer Referral / Directory Network**: No matching users with legal professionals or directory listings in V1.
- **Automated Legal Document Drafting**: No form-filling or legal contract generation; focus is purely on comprehension, navigation, and review.
- **Jurisdiction-Specific Real-Time Statute Lookups**: No live scraping of legal databases or court APIs; uses general common law principles and flagged Indian statutes where relevant.
- **Multi-language Input/Output**: V1 is English-first (input and output).
- **Court Filing or Process Automation**: No filing cases or submission to court portals.
- **Real-Time Collaboration**: Single-session usage only; no multi-user document sharing.

## Context

- **Source Specifications**: Derived directly from `gavel-prd-frd.html` v1.0.
- **Hackathon Goals**: 100% compliance across all 7 problem statement use cases (UC1: simplifying docs, UC2: comparing agreements, UC3: highlighting risks/clauses, UC4: contextual Q&A, UC5: next steps guidance, UC6: summaries & checklists, UC7: lawyer preparation).
- **Architecture**: Next.js 14+ App Router, Vercel AI SDK 3.x, Anthropic Claude 3.5 Sonnet (`claude-sonnet-4-6`), Tailwind CSS + shadcn/ui.
- **Strict Privacy Posture**: In-memory file processing buffer, ephemeral state in browser memory (React state), zero PII collected.

## Constraints

- **Tech Stack**: Next.js 14+ App Router, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`), Zod, `pdf-parse`, `mammoth`.
- **LLM Selection**: Anthropic Claude 3.5 Sonnet (`claude-sonnet-4-6`) for deep legal reasoning, structured Zod object output (`generateObject`), and vision analysis for document images.
- **Context Limit / Large Document Strategy**: Two-pass clause extraction and comparison strategy if combined comparison docs exceed ~80,000 characters.
- **Privacy & Security**: Zero disk or database persistence of uploaded legal documents. Ephemeral processing only.
- **Legal Compliance**: Disclaimer mandatory on all pages and outputs; AI system prompt explicitly forbids giving prescriptive legal advice or saying "you should", enforcing objective phrasing like "people in this situation often..." and "it may be worth asking a lawyer about...".

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router + Vercel AI SDK 3.x | Seamless TypeScript ergonomics, native Zod structured generation (`generateObject`), and streaming SSE routes (`streamText`) without LangChain boilerplate | Validated in Phase 1-3 |
| Anthropic Claude 3.5 Sonnet | Superior legal reasoning, 200k token window, native base64 vision processing for image scans | Validated in Phase 1-3 |
| Zero Server Persistence / In-Memory Processing | Extreme user privacy and data security for sensitive legal contracts; zero PII liability | Validated in Phase 1-3 |
| Single Zod Schema Layer (`lib/schemas/`) | Strict type-safety contract between AI generation, API response, and React UI components | Validated in Phase 1-3 |
| Dual Non-UPL Guardrails | Advocates Act 1961 §§ 29 & 33 compliance via negative prompt directives + inline statutory safe harbor badges | Validated in Phase 2-3 |
| XML Boundary Sanitization | Enclose untrusted user narratives in `<situation_to_analyze>` XML tags to eliminate prompt injection | Validated in Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-21 after initialization*

