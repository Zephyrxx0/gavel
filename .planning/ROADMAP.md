# Roadmap: Gavel

## Overview

Gavel is an ephemeral, privacy-first GenAI legal assistance platform that empowers everyday citizens and small business owners to understand legal contracts, navigate active disputes, and compare agreements without legal jargon. This roadmap lays out a 5-phase vertical progression from foundational in-memory file ingestion and Zod validation schemas through Document Decoding (Mode 1), Situation Navigation (Mode 2), Document Comparison (Mode 3), and finally Contextual Streaming Q&A with Universal Export Tools (Mode 4). Every phase delivers an observable, testable slice of user value with strict epistemic guardrails preventing the Unauthorized Practice of Law (UPL).

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation, Schemas, & Ingestion Pipeline** - Establish core Next.js app, dark legal design system, Zod schemas, disclaimers, and ephemeral in-memory multi-format file extraction. (completed 2026-09-22)
- [x] **Phase 2: Mode 1 — Document Decoder Core** - Deliver document breakdown pipeline and UI with executive summaries, 3-tier risk scorecards, action checklists, and lawyer prep guides. (completed 2026-09-22)
- [ ] **Phase 3: Mode 2 — Situation Navigator Core** - Deliver no-document conversational intake, automatic category detection, statutory rights accordions, and urgency roadmaps.
- [ ] **Phase 4: Mode 3 — Document Comparison Engine** - Deliver dual-document upload, side-by-side diff table, favorability verdict, inconsistency flags, and negotiation guides with large-doc handling.
- [ ] **Phase 5: Mode 4 — Contextual Q&A, Export Tools, & Universal Polish** - Deliver grounded streaming SSE chat drawer, one-click export/clipboard tools, performance audits, and mobile responsiveness.

## Phase Details

### Phase 1: Foundation, Schemas, & Ingestion Pipeline

**Goal**: Establish project repository foundation, design system with dark legal aesthetic and non-dismissible disclaimers, canonical Zod schemas, and an in-memory, privacy-preserving multi-format ingestion pipeline.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: INGEST-01, INGEST-02, INGEST-03, INGEST-04, INGEST-05, INGEST-06, INGEST-07, CORE-01, CORE-02, CORE-04
**Success Criteria** (what must be TRUE):

  1. User can upload PDF, DOCX, JPG, and PNG documents up to 10MB via drag-and-drop or file picker with instant client-side size/format validation.
  2. Large camera photos exceeding 4MB are automatically downsampled on the client canvas before transmission, preventing Vercel 413 payload errors.
  3. Server extracts clean, sanitized text from PDF (via `pdf-parse`) and DOCX (via `mammoth`), and encodes JPG/PNG images into base64 payload blocks in memory with zero disk or database persistence.
  4. User is presented with clear error states and an inline fallback manual text paste textarea when an uploaded document is unreadable, corrupt, or password-protected.
  5. Application renders with the authoritative dark legal theme (DM Serif Display, DM Sans, JetBrains Mono, gold accents) and prominent universal legal disclaimers.

**Plans**: 01-01, 01-02, 01-03 (completed 2026-09-22)

### Phase 2: Mode 1 — Document Decoder Core

**Goal**: Implement the Document Decoder analysis pipeline and UI to transform uploaded contracts into plain-English summaries, 3-tier risk scorecards, prioritized checklists, and targeted lawyer questions.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DECODE-01, DECODE-02, DECODE-03, DECODE-04, DECODE-05
**Success Criteria** (what must be TRUE):

  1. User can submit an uploaded document or pasted text to `/api/analyze/document` and receive a schema-validated `DocumentAnalysis` response powered by Claude 3.5 Sonnet.
  2. Document Decoder view displays an executive plain-English summary (< 200 words), document type badge, and identified counter-parties at the top of the report.
  3. Risk Scorecard renders clauses triaged across 3 traffic-light tiers (🔴 High, 🟡 Caution, 🟢 Standard) with plain-English rationales and expandable verbatim source clause text.
  4. Actionable Checklist categorizes recommendations by timing (*Immediate*, *Before Signing*, *After Signing*) with clear action badges (*Negotiate*, *Verify*, *Refuse*, *Accept*).
  5. Tailored Lawyer Preparation Guide generates 5–8 high-leverage consultation questions directly grounded in verbatim clauses.

**Plans**: 02-01, 02-02, 02-03, 02-04 (completed 2026-09-22)

### Phase 3: Mode 2 — Situation Navigator Core

**Goal**: Deliver the conversational dispute navigation pipeline and UI for citizens without formal contracts, identifying statutory rights, time-sensitive deadlines, and sequential next steps.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: SIT-01, SIT-02, SIT-03, SIT-04, SIT-05, SIT-06, SIT-07
**Success Criteria** (what must be TRUE):

  1. User can enter a conversational description of their legal issue, with an inline prompt warning them if input is under 20 words before analysis runs.
  2. System auto-detects and displays the legal category (Tenancy, Employment, Consumer, etc.) with a user confirmation badge.
  3. "Your Rights" section renders expandable accordion cards explaining relevant legal rights and statutory protections in plain English without prescriptive advice.
  4. Next Steps Roadmap renders an urgency-coded timeline (*Immediate*, *Within 7 Days*, *Within 30 Days*, *When Ready*) indicating which tasks are doable without an attorney.
  5. Interactive "Documents to Gather" checklist, "When to Call a Lawyer" guidance, estimated resolution timeline, and high-visibility time-sensitive deadline warnings render on the report.

**Plans**: 03-01, 03-02, 03-03, 03-04 (completed 2026-09-22)

### Phase 4: Mode 3 — Document Comparison Engine

**Goal**: Build the dual-document comparison engine and side-by-side analysis UI to detect clause discrepancies, inconsistencies, and bargaining leverage between two agreements.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07
**Success Criteria** (what must be TRUE):

  1. User can upload two documents simultaneously into labeled comparison zones (e.g., "Original" vs "Revised") with parallel ingestion handling.
  2. Overall Favorability Verdict card indicates which document benefits the user (`docA`, `docB`, or `neutral`) with plain-English justification.
  3. Side-by-side comparison table maps corresponding clauses category-by-category, showing text variances, risk ratings, and who each clause favors.
  4. Inconsistencies section highlights contradictory clauses, unexpected additions, or omitted standard protections with severity tags (Critical, Notable, Minor).
  5. Negotiation Guide segments terms into actionable categories (*Push Back*, *Accept As-Is*, *Flag for Lawyer*), and large combined documents (> 80k chars) are automatically processed via two-pass extraction without token truncation.

**Plans**: 4 plans
- [ ] 04-01-PLAN.md — Schema Upgrade & Dual-Document Comparison API Pipeline (Wave 1)
- [ ] 04-02-PLAN.md — Dual Document Intake Experience & Comparison Progress (Wave 2)
- [ ] 04-03-PLAN.md — Comparison Dossier Presentation Components (Wave 2)
- [ ] 04-04-PLAN.md — Page Controller Orchestration & Homepage Integration (Wave 3)

### Phase 5: Mode 4 — Contextual Q&A, Export Tools, & Universal Polish

**Goal**: Integrate the contextual streaming Q&A assistant anchored in active analysis results, provide universal report export tools, and audit end-to-end responsiveness and compliance.
**Mode:** mvp
**Depends on**: Phase 2, Phase 3, Phase 4
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CORE-03
**Success Criteria** (what must be TRUE):

  1. User can open a slide-in chat drawer from any active analysis report and stream real-time conversational answers (SSE) with sub-2s time-to-first-token.
  2. Chat assistant cites specific clauses and sections from the active document/situation, explicitly stating when an answer is not addressed in source text.
  3. User can copy the complete structured analysis report to clipboard or download formatted text/markdown with one click, with legal disclaimers preserved in export payloads.
  4. Entire platform operates responsively across mobile and desktop devices with complete disclaimer coverage and zero data persistence.

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, Schemas, & Ingestion Pipeline | 3/3 | Complete    | 2026-09-22 |
| 2. Mode 1 — Document Decoder Core | 4/4 | Complete    | 2026-09-22 |
| 3. Mode 2 — Situation Navigator Core | 4/4 | Complete    | 2026-09-22 |
| 4. Mode 3 — Document Comparison Engine | 0/TBD | Not started | - |
| 5. Mode 4 — Contextual Q&A, Export Tools, & Universal Polish | 0/TBD | Not started | - |
