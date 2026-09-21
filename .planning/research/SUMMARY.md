# Project Research Summary

**Project:** Gavel (GenAI Legal Assistance Platform)  
**Domain:** Legal Information & Citizen Guidance (LegalTech)  
**Researched:** 2026-09-21  
**Confidence:** HIGH  

## Executive Summary

Gavel is an ephemeral, privacy-first GenAI legal assistance platform designed to make legal contracts and dispute navigation accessible, comprehensible, and actionable for everyday citizens (tenants, employees, consumers, freelancers) and small business owners. Unlike enterprise Contract Lifecycle Management (CLM) suites (e.g., Ironclad, SpotDraft) built for corporate attorneys, or traditional legal self-help sites (e.g., LegalZoom, Rocket Lawyer) that push boilerplate forms or attorney referrals, Gavel focuses strictly on instant comprehension, objective risk triage, actionable checklists, and attorney-consultation preparation.

The recommended architectural approach is a Next.js 14+ App Router application backed by the Vercel AI SDK 3.x and Anthropic Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`). To guarantee deterministic UI rendering without brittle JSON parsing or runtime hallucination, Gavel uses `generateObject` enforced by strict, bounded Zod schemas (`DocumentAnalysisSchema`, `SituationAnalysisSchema`, `ComparisonSchema`). Real-time follow-up is delivered via streaming Server-Sent Events (SSE) using `streamText` in a contextual slide-in chat drawer. To ensure complete user privacy and eliminate data breach liabilities, the platform maintains a zero-persistence architecture: files are parsed strictly in server RAM via `pdf-parse`, `mammoth`, or direct base64 image vision processing, immediately garbage-collected, and retained solely in ephemeral browser React state.

The primary operational risks center on the Unauthorized Practice of Law (UPL) and LLM hallucinations. Under US, UK, and Indian regulatory statutes (e.g., Advocates Act 1961), providing prescriptive, directive legal advice ("you should sue", "this is illegal") creates severe regulatory liability. Gavel mitigates this through epistemic system prompt guardrails that enforce objective informational phrasing ("contracts of this type typically...", "questions to raise with counsel..."), multi-layer non-dismissible disclaimers, verbatim clause-grounding requirements, and defensive Zod schema design with bounded array lengths to prevent serverless function timeouts.

---

## Key Findings

### Recommended Stack

The chosen stack prioritizes extreme ephemeral privacy, deterministic schema guarantees, sub-15s end-to-end analysis times, and authoritative typography. Full details and setup commands are documented in [STACK.md](file:///home/zeph/Code/gavel/.planning/research/STACK.md).

Next.js 14 App Router (Node.js runtime) provides the full-stack foundation, hosting both the dark-mode presentation layer and serverless route handlers for file ingestion and AI inference. Vercel AI SDK 3.x paired with `@ai-sdk/anthropic` connects to Claude 3.5 Sonnet, providing gold-standard legal reasoning, a 200,000 token context window, and native multimodal vision to parse scanned documents without OCR bloat. Zod serves as the single source of truth across the application, binding AI structured outputs directly to typed React components.

**Core technologies:**
- **Next.js 14.2.24 (App Router, React 18.3.1):** Full-stack framework — chosen for Node.js Route Handlers (`/api/upload`, `/api/analyze/*`, `/api/chat`), native SSE streaming, and rock-solid Radix/shadcn compatibility without React 19 peer-dependency collisions.
- **Vercel AI SDK 3.4.33 (`ai` & `@ai-sdk/anthropic`):** AI orchestration — chosen for native `generateObject` Zod enforcement with schema retries and `streamText` SSE chat hooks without LangChain bundle bloat.
- **Anthropic Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`):** Foundational LLM & Multimodal Vision — chosen for superior contract reasoning, 200k context window, and direct base64 image reading for scanned agreements.
- **Zod 3.23.8:** Runtime validation & type inference — provides deterministic JSON structure contracts between Claude, API handlers, and React UI components.
- **Tailwind CSS 3.4.17 & Radix UI / shadcn:** Design system — provides an authoritative dark legal aesthetic (`DM Serif Display`, `DM Sans`, `JetBrains Mono`, gold accents `#C9A55C`) with accessible accordions, drawers, and dialog primitives.
- **pdf-parse & mammoth:** In-memory document extraction — server-side extraction for PDF and DOCX files directly from Node.js RAM buffers with zero disk writes.

---

### Expected Features

Gavel delivers four core user modes satisfying all 7 Problem Statement use cases defined in [PROJECT.md](file:///home/zeph/Code/gavel/.planning/PROJECT.md). A complete feature landscape and anti-feature analysis is detailed in [FEATURES.md](file:///home/zeph/Code/gavel/.planning/research/FEATURES.md).

**Must have (table stakes):**
- **Multi-Format In-Memory File Upload:** Ingest PDF, DOCX, JPG, PNG up to 10MB (downscaled client-side if camera photos) with manual text paste fallback; zero server-side file persistence.
- **Executive Plain-English Summary & Counterparty Identification:** Rapid 10th-grade reading level distillation of core obligations and identified legal parties.
- **3-Tier Traffic-Light Risk Scorecard (🔴 High, 🟡 Caution, 🟢 Standard):** Visual triage of problematic clauses with verbatim original excerpts and plain-English explanations.
- **Actionable Checklist with Decision Verbs:** Concrete operational steps categorized by timing (*Immediate*, *Before Signing*, *After Signing*) with action verbs (*Negotiate*, *Verify*, *Refuse*, *Accept*).
- **Targeted Lawyer Preparation Guide:** 5–8 specific, document-grounded questions citing exact clauses to maximize consultation efficiency and minimize billable hours.
- **Situation Navigator (No-Document Dispute Guidance):** Conversational free-text intake, automatic dispute categorization, statutory rights breakdown, and urgency roadmap.
- **Contract Comparison Redlining & Favorability Verdict:** Side-by-side diff table, inconsistency alerts, negotiation triaging (*Push Back*, *Accept*, *Flag for Lawyer*), and overall favorability badge.
- **Contextual Streaming Q&A Chat (Mode 4):** Persistent/slide-in chat drawer streaming tokens via SSE (`< 2s` time-to-first-token), anchored in active document text and prior structured analysis.
- **Universal Prominent Legal Disclaimer:** Multi-layer non-dismissible disclaimers across all screens, cards, clipboard copies, and text export files.

**Should have (competitive differentiators):**
- **Pre-Submit Input Completeness Guardrail:** Client-side heuristic catching dispute descriptions < 20 words and prompting for missing facts before API execution.
- **Two-Pass Large Document Engine:** Automatic fallback strategy for dual contract comparisons exceeding 80,000 characters to prevent token dilution.
- **One-Click Export & Clipboard Tools:** Formatted text and markdown export containing analysis summaries, clause flags, lawyer questions, and the legal disclaimer.

**Defer (v2+):**
- **Multi-Language Legal Localization:** Defer regional legal translations (Hindi, Tamil, Spanish) until plain-English legal accuracy is fully validated.
- **Verified Attorney Referral Portal:** Avoid complex legal fee-splitting regulations in V1; empower users with pre-compiled briefs instead.
- **Automated Contract Drafting:** Strictly avoid generative drafting of binding legal contracts to prevent unauthorized practice of law liabilities.
- **User Accounts & Cloud Storage:** Omit user logins, databases, and persistent document vaults to maintain zero-PII liability.

---

### Architecture Approach

Gavel follows a decoupled, ephemeral architecture separating file extraction from AI inference, as detailed in [ARCHITECTURE.md](file:///home/zeph/Code/gavel/.planning/research/ARCHITECTURE.md). Client components coordinate user state in React memory, dispatching requests to Node.js Route Handlers. 

`/api/upload` parses binary buffers in RAM and returns sanitized plain text. Mode-specific endpoints (`/api/analyze/document`, `/api/analyze/situation`, `/api/analyze/compare`) execute `generateObject` against Claude 3.5 Sonnet using canonical Zod schemas from `lib/schemas.ts`. Interactive follow-up Q&A is routed through `/api/chat`, where `streamText` injects the source document and existing structured analysis into Claude's system prompt to ensure grounded conversational SSE streaming.

```
[Browser Client: React State Tree]
       │
       ├── (1) In-Memory Upload ──────► [/api/upload (Node.js Buffer / pdf-parse / mammoth)]
       │                                         │
       │                                         ▼ (Sanitized Text / Image Base64)
       ├── (2) Structured Analysis ───► [/api/analyze/[mode] (generateObject + Zod)]
       │                                         │
       │                                         ▼ (Typed JSON Schema)
       └── (3) Grounded Follow-up ────► [/api/chat (streamText SSE + Context Anchoring)]
```

**Major components:**
1. **In-Memory Ingestion Pipeline (`/api/upload` & `FileUpload.tsx`):** Multipart stream parser converting PDF/DOCX to sanitized text and images to base64 with client-side canvas downsampling.
2. **Deterministic Schema Layer (`lib/schemas.ts` & `lib/prompts.ts`):** Canonical Zod definitions and rigorously engineered system prompts enforcing non-prescriptive, objective legal framing.
3. **Structured Domain Visualizers (`RiskScorecard`, `Checklist`, `NextStepsTimeline`, `ComparisonTable`):** High-density accessible UI components rendering traffic-light risks, decision tags, and side-by-side contract diffs.
4. **Context-Anchored Streaming Drawer (`ChatPanel.tsx` & `/api/chat`):** Real-time conversational interface utilizing `@ai-sdk/react` (`useChat`) to answer user queries grounded in active contract text and prior findings.

---

### Critical Pitfalls

A comprehensive breakdown of failure modes, technical debt, and prevention strategies is detailed in [PITFALLS.md](file:///home/zeph/Code/gavel/.planning/research/PITFALLS.md). The top pitfalls requiring rigorous mitigation are:

1. **Unauthorized Practice of Law (UPL) Liability & Regulatory Exposure:** LLMs default to directive language ("you should sue", "this is illegal").  
   *Mitigation:* Strictly forbid prescriptive modal verbs in system prompts (`lib/prompts.ts`); mandate informational framing ("contracts of this type typically...", "questions to raise with counsel"); embed prominent, universal disclaimers across all views and export payloads.
2. **Clause Citation Hallucinations & Fabricated Legal Citations:** LLMs fill gaps in missing or ambiguous contract terms using generic parametric boilerplate.  
   *Mitigation:* Enforce strict verbatim clause grounding in `DocumentAnalysisSchema` (`originalText: z.string()`); require exact substring matches; explicitly instruct Claude to declare absence when topics are not covered.
3. **Output Token Truncation & Schema Parse Failures:** Large contracts generating 15+ clauses cause JSON payloads to exceed Claude's output token limits, crashing `generateObject` with unrecoverable syntax errors.  
   *Mitigation:* Bound array lengths in Zod schemas (`clauses.max(10)`); enforce concise word limits on explanation fields (≤ 40 words); implement a two-pass extraction engine for documents > 80,000 characters.
4. **Messy Extraction, Two-Column PDFs, & Scanned Bitmaps:** `pdf-parse` fails on image-only scanned PDFs and scrambles multi-column layouts.  
   *Mitigation:* Implement `cleanText()` to de-hyphenate and normalize text; detect scanned PDFs (size > 100KB with < 100 extracted chars) and trigger immediate user alerts; route camera photos directly to Claude Vision via base64; provide an always-accessible manual text paste fallback.
5. **Vercel Serverless Function Timeouts & 4.5MB Payload Limits:** Default 15s serverless limits fail during complex schema generations, while smartphone photos (8MB+) hit Vercel's 4.5MB proxy barrier.  
   *Mitigation:* Set `export const maxDuration = 60;` on all Node.js route handlers; limit `maxRetries: 1` with permissive `.catch()` schema enums; implement client-side HTML5 canvas image downsampling (to max 1600px / 400KB) before transmission.

---

## Implications for Roadmap

Based on the research findings and component dependencies, the development work should follow a structured 5-phase progression:

### Phase 1: Foundation, Schemas, & Ingestion Pipeline
**Rationale:** The canonical Zod schemas, text sanitization utilities, and file ingestion engine are prerequisites for all downstream analysis modes. Testing cannot proceed without reliable text extraction.  
**Delivers:** Core repository setup (Next.js 14, Tailwind, Radix UI), `lib/schemas.ts`, `lib/prompts.ts`, `lib/text-utils.ts`, `/api/upload` endpoint, and `FileUpload.tsx` with drag-and-drop, paste fallback, and client-side image downsampling.  
**Addresses:** `FILE-01`, `EXTR-01`, `EXTR-02`, `UX-01`, `UX-02`.  
**Avoids:** Pitfall 4 (messy PDF/scanned failures), Pitfall 6 (Vercel 4.5MB payload limit), Pitfall 7 (prompt injection via boundary tags).

### Phase 2: Mode 1 — Document Decoder Core
**Rationale:** Document decoding is Gavel's flagship capability and proves the end-to-end value proposition (simplification, risk scorecards, action checklists, and lawyer prep questions).  
**Delivers:** `/api/analyze/document` endpoint with `generateObject`, `DocumentAnalysisSchema` integration, `RiskScorecard.tsx`, `Checklist.tsx`, `LawyerQuestions.tsx`, and `/analyze/document` page controller.  
**Addresses:** `MODE1-01`, `MODE1-02`, `MODE1-03`, `MODE1-04`, `MODE1-05`, `PERF-01`.  
**Avoids:** Pitfall 2 (clause citation hallucinations via verbatim grounding), Pitfall 3 (output token truncation via bounded arrays), Pitfall 9 ("wall of red" risk inflation via calibrated criteria).

### Phase 3: Mode 2 — Situation Navigator Core
**Rationale:** Extends Gavel to users without written contracts (dispute narratives), reusing the structured generation architecture established in Phase 2.  
**Delivers:** `/api/analyze/situation` endpoint, `SituationAnalysisSchema`, `SituationInput.tsx` with < 20 words pre-submit validation, `RightsAccordion.tsx`, `NextStepsTimeline.tsx` with urgency badges, `DocumentsChecklist.tsx`, and `/analyze/situation` page controller.  
**Addresses:** `MODE2-01`, `MODE2-02`, `MODE2-03`, `MODE2-04`, `MODE2-05`.  
**Avoids:** Pitfall 1 (UPL violations via epistemic guidance framing), Pitfall 8 (jurisdiction confabulation via common law disclaimers).

### Phase 4: Mode 3 — Document Comparison Engine
**Rationale:** Dual-document comparison is the most cognitively demanding mode, requiring parallel upload handling and semantic diffing. Building it after Modes 1 and 2 ensures stable extraction patterns.  
**Delivers:** `/api/analyze/compare` endpoint with two-pass fallback for documents > 80k characters, `ComparisonSchema`, dual-slot upload UI, `ComparisonTable.tsx`, inconsistency alerts, `NegotiationGuide.tsx`, and `/analyze/compare` page controller.  
**Addresses:** `MODE3-01`, `MODE3-02`, `MODE3-03`.  
**Avoids:** Pitfall 3 (comparison context blowout), Pitfall 5 (retry loops during large JSON comparison generation).

### Phase 5: Mode 4 — Contextual Q&A, Export Tools, & Universal Polish
**Rationale:** Interactive Q&A chat and report export tools depend on having existing analysis outputs from Modes 1, 2, or 3 to anchor context. This final phase unifies the experience, hardens compliance, and ensures responsive polish.  
**Delivers:** `/api/chat` streaming endpoint (`streamText` SSE), slide-in `ChatPanel.tsx` using `useChat`, `ExportActions.tsx` (clipboard copy and markdown download), universal legal disclaimer audit, homepage navigation cards, and mobile optimization.  
**Addresses:** `MODE4-01`, `MODE4-02`, `UX-03`, `PERF-01`.  
**Avoids:** Pitfall 1 (UPL in conversational chat via non-prescriptive system prompts), Pitfall 8 (omitted disclaimers on exported briefs).

---

### Phase Ordering Rationale

- **Foundation Before Features:** Zod schemas (`lib/schemas.ts`) must exist before API routes or UI components can be statically typed. Text extraction (`/api/upload`) must be functional to provide realistic test documents for AI pipelines.
- **Single-Document Decoder Before Multi-Document Comparison:** Mode 1 establishes prompt calibration, risk triage heuristics, and UI cards. Mode 3 builds upon these exact primitives by comparing two versions of what Mode 1 analyzes.
- **Structured Engines Before Chat Drawer:** Mode 4 Q&A requires both raw document text *and* the structured analysis JSON to anchor Claude's responses. Building Q&A after the structured engines ensures the chat drawer has rich contextual data to ingest.
- **Compliance Hardening Throughout:** Disclaimers and UPL guardrails are baked into Phase 1 schema/prompt definitions and verified across all export tools and chat interactions in Phase 5.

---

### Research Flags

**Phases likely needing deeper research during planning:**
- **Phase 4 (Mode 3 Comparison):** Two-pass extraction heuristics for large contracts (> 80k chars) requires token budget tuning to ensure prompt latency stays within 15–20s.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation & Ingestion):** In-memory `pdf-parse`, `mammoth`, and Next.js App Router `FormData` handling are standard, well-documented Node.js patterns.
- **Phase 2 (Mode 1 Decoder):** Standard Vercel AI SDK `generateObject` paired with Zod schemas and Radix accordion primitives.
- **Phase 3 (Mode 2 Navigator):** Mirrors Mode 1 structured generation with a free-text input schema and vertical timeline component.
- **Phase 5 (Mode 4 Q&A & Polish):** Vercel AI SDK `streamText` SSE and `useChat` hook provide established, turnkey streaming ergonomics.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 14 App Router, Vercel AI SDK 3.x, Claude 3.5 Sonnet, and Zod are verified, compatible LTS releases. Node.js runtime handles in-memory file buffers seamlessly. |
| Features | HIGH | 100% alignment with the 7 Problem Statement use cases in `PROJECT.md` and detailed specifications in `gavel-prd-frd.html`. Scope boundaries (zero persistence, no auth, no drafting) are clear. |
| Architecture | HIGH | Ephemeral in-memory pipeline, Zod schema contracts, and SSE streaming chat have been thoroughly mapped with code blueprints and component trees. |
| Pitfalls | HIGH | UPL legal risks, token truncation, Vercel 4.5MB payload limits, two-column PDF errors, and hallucination vectors are fully analyzed with concrete architectural mitigations. |

**Overall confidence:** HIGH

---

### Gaps to Address

- **Two-Pass Comparison Threshold Calibration:** The 80,000 character cutoff for activating two-pass extraction in Mode 3 is a calculated estimate (~20k tokens); benchmark real-world 30-page commercial leases during Phase 4 implementation to refine this trigger.
- **Client-Side Image Downsampling Tuning:** Ensure HTML5 canvas downsampling in `FileUpload.tsx` balances OCR clarity for Claude Vision with strict `< 4.0MB` file payload constraints.
- **Local Jurisdiction Notice Fine-Tuning:** Ensure that when users specify a municipal or state-specific issue in Mode 2, the prompt includes a clear caveat stating that local acts (e.g., state rent control laws) supersede general principles.

---

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK Core Documentation](https://sdk.vercel.ai/docs) — `generateObject`, `streamText`, `toDataStreamResponse`, and Zod schema bindings.
- [Anthropic Claude 3.5 Sonnet Specifications](https://docs.anthropic.com/en/docs/models-overview) — Tool-calling structured extraction, 200k context window, and base64 vision limits.
- [Next.js 14 App Router Documentation](https://nextjs.org/docs/app) — Route Handlers, `serverComponentsExternalPackages`, and Node.js runtime configuration.
- [Gavel PRD & FRD v1.0 Specification (`gavel-prd-frd.html`)](file:///home/zeph/Code/gavel/gavel-prd-frd.html) — Core functional requirements, visual specifications, and target personas.
- [Gavel Project Roadmap & Context (`.planning/PROJECT.md`)](file:///home/zeph/Code/gavel/.planning/PROJECT.md) — Problem statement alignment, active requirements, and out-of-scope boundaries.

### Secondary (MEDIUM confidence)
- LegalTech Industry Benchmarks (SpotDraft, Ironclad, Harvey AI) — Feature landscape analysis, clause triage conventions, and enterprise redlining standards.
- Regulatory Case Law on AI Legal Assistance (FTC v. DoNotPay, 2024–2025; US State Bar Ethics Opinions; Indian Advocates Act 1961 §§ 29 & 33) — Boundaries distinguishing legal information from unauthorized practice of law.
- Mammoth.js & pdf-parse Documentation — Buffer extraction mechanics and Node.js module resolution.

### Tertiary (LOW confidence)
- None. All architectural layers and technical dependencies are verified against official documentation or project specifications.

---
*Research completed: 2026-09-21*  
*Ready for roadmap: yes*  
