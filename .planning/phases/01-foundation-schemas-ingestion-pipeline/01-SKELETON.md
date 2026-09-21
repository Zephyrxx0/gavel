# Walking Skeleton — Gavel

**Phase:** 1 (Foundation, Schemas, & Ingestion Pipeline)  
**Generated:** 2026-09-21  
**Status:** Architectural Specification  

---

## 1. Capability Proven End-to-End

A user can open the Gavel dark legal interface, review mandatory non-dismissible legal disclaimers, upload a contract (PDF, DOCX, or JPG/PNG image) or paste legal text via the browser UI, validate the file client-side (with automatic offscreen canvas downsampling for images > 4MB), process the file in-memory via the Next.js `/api/upload` route handler with zero server-side disk persistence, and observe the parsed document metadata (character count, word count, file size, status) rendered in a pre-analysis metadata card with seamless fallback to a manual paste textarea if text extraction fails.

---

## 2. Architectural Decisions

| Decision | Choice | Rationale | Reversibility |
|---|---|---|---|
| **Framework & Runtime** | Next.js 14.2.24 App Router (Node.js runtime) | Enforces Node.js runtime (`export const runtime = 'nodejs'`) on route handlers for binary `Buffer` support required by `pdf-parse` and `mammoth`. Avoids React 19 peer-dependency collisions with Radix UI primitives. | Costly |
| **Theme & Visual System** | Tailwind CSS 3.4.17 with Obsidian (`#0B0F17`), Legal Gold (`#C5A059` / `#D4AF37`), Slate (`#1E293B`), and Traffic-Light Risk Tokens | Establishes the authoritative Editorial Authority aesthetic (per D-06) required across all downstream scorecards, badges, and drawers without Tailwind v4 breaking changes. | Costly |
| **Typography Hierarchy** | `next/font/google` with `DM Serif Display`, `DM Sans`, and `JetBrains Mono` | Delivers zero-CLS editorial hierarchy: Serif for authoritative section headings, Sans for plain-English explanations, and Mono for statutory citations and risk badges (per D-07). | Reversible |
| **Component Primitives** | Headless Radix UI suite wrapped with `class-variance-authority` + Sonner | Pre-installs Accordion, Dialog, Tabs, Tooltip, Badge, Button, and Toast in Phase 1 (per D-08) to eliminate UI primitive churn across subsequent phase workflows. | Reversible |
| **Schema Architecture** | Domain-modular Zod 3.23.8 under `lib/schemas/` (`common.ts`, `upload.ts`, `document.ts`, `situation.ts`, `comparison.ts`) | Centralizes typed envelopes and canonical enums (`RiskLevel`, `ActionTiming`, `ActionType`, `InconsistencySeverity`) (per D-09, D-10, D-12) used as single sources of truth by route handlers and AI models. | Costly |
| **Epistemic Non-UPL Defense** | Zod `.describe(...)` annotations with strict anti-advice directives | Defense-in-depth epistemic guardrails embedded directly in schema descriptions (banning "you should" and illegality declarations) to enforce objective legal guidance (per D-11). | Reversible |
| **In-Memory Document Extraction** | Serverless route handler (`/api/upload`) using `pdf-parse/lib/pdf-parse.js` and `mammoth` | Bypasses `pdf-parse` ESM auto-debug crash by importing subpath directly. Processes files purely in RAM buffers with zero filesystem persistence (`/tmp` or disk writes) (per D-01, CORE-04). | Costly |
| **Client Canvas Downsampling** | Offscreen HTML5 `HTMLCanvasElement` scaling images > 4MB to max 2048px @ JPEG 0.82 | Prevents HTTP 413 serverless payload rejection on Vercel (4.5MB ceiling) while preserving contract fine print; revokes Object URLs to prevent mobile heap leaks (per D-13). | Reversible |
| **Extraction Fallback Flow** | Automatic state switch to `<ManualPasteArea />` when extraction fails or text < 50 chars | Prevents user dead-ends when scanned image PDFs, password-protected files, or corrupt documents are uploaded (per D-02, D-16). | Reversible |
| **Legal Disclaimer Placement** | Dual placement: persistent compact bottom banner + prominent pre-report card | Guaranteed non-dismissible notice across all viewports to protect against Unauthorized Practice of Law (UPL) claims (per D-05, CORE-02). | Reversible |
| **Test Infrastructure** | Vitest 2.x configured with Node environment and `@/*` alias | Sub-second test execution for schema validation, text sanitization regex, route handlers, and client downsampling logic. | Reversible |

---

## 3. Stack Touched in Phase 1

- [x] **Project scaffold**: Next.js 14.2.24 App Router, React 18.3.1, TypeScript 5.6, Tailwind CSS 3.4.17, Vitest 2.x
- [x] **Routing**:
  - `app/layout.tsx`: Root layout hosting Google fonts, global CSS variables, and persistent legal disclaimer banner
  - `app/page.tsx`: Ingestion dropzone, pre-analysis metadata card, manual paste fallback, and viewport disclaimer card
  - `app/api/upload/route.ts`: Ephemeral in-memory file parsing route handler
- [x] **In-Memory Data Pipeline**:
  - Buffer allocation from Web API `req.formData()`
  - Direct dispatch to `pdf-parse/lib/pdf-parse.js`, `mammoth.extractRawText`, or base64 encoder
  - Text sanitization (`lib/text-utils.ts`) preserving clause hierarchy and stripping control characters
  - Typed response envelope validation via `UploadResponseSchema`
- [x] **UI & User Interaction**:
  - `DocumentDropzone.tsx`: Drag-and-drop zone with active glow, format pre-flight check, and animated error shake
  - `FilePreviewCard.tsx`: Document metadata summary (name, size, compression badge, word count, remove action)
  - `ManualPasteArea.tsx`: Manual input mode with character/word counter and clipboard paste button
  - `LegalDisclaimer.tsx`: Dual disclaimer components (bottom banner with amber shield + pre-report card)
  - Radix UI primitives: Accordion, Dialog, Tabs, Tooltip, Badge, Button, Sonner Toaster
- [x] **Verification & Test Suite**:
  - `tests/disclaimer.test.ts`: Asserts required legal copy and non-dismissible props
  - `tests/schemas.test.ts`: Asserts Zod schema validation and canonical enum coverage
  - `tests/text-cleaning.test.ts`: Asserts whitespace normalization and control code stripping
  - `tests/upload-route.test.ts`: Asserts in-memory route handling across PDF, DOCX, JPG/PNG, and error envelopes
  - `tests/canvas-downsample.test.ts`: Asserts client image resizing bounds and memory revocation

---

## 4. Out of Scope (Deferred to Later Slices)

> Explicitly deferred to prevent future phases from re-litigating Phase 1's minimalism.

- **AI Model Inference**: Vercel AI SDK `generateObject` / `streamText` calls to Anthropic Claude 3.5 Sonnet (deferred to Phase 2).
- **Mode 1 (Document Decoder Report UI)**: Executive plain-English summaries, 3-tier risk scorecard, prioritized checklists, and lawyer prep questions (deferred to Phase 2).
- **Mode 2 (Situation Navigator UI & Intake)**: Conversational dispute intake, legal category auto-detection, statutory rights accordions, and urgency timeline (deferred to Phase 3).
- **Mode 3 (Document Comparison Diffing)**: Dual-document comparison engine, side-by-side diff table, favorability verdict, and >80k character chunking (deferred to Phase 4).
- **Mode 4 (Contextual Streaming Q&A & Exports)**: Slide-in chat drawer with SSE streaming and 1-click clipboard/file export tools (deferred to Phase 5).
- **Persistent Storage**: User authentication, database tables (PostgreSQL/Supabase), and cloud object storage (S3) (permanently excluded to maintain strict zero-data retention privacy posture).

---

## 5. Subsequent Slice Plan

Each later phase builds directly on this walking skeleton without altering its foundational architectural decisions:

- **Phase 2 (Mode 1 — Document Decoder Core)**:
  Wires the in-memory parsed text from Phase 1's ingestion pipeline to `/api/analyze/document`, executing Claude 3.5 Sonnet structured extraction via `DocumentAnalysisSchema` and rendering the 3-tier Risk Scorecard.
- **Phase 3 (Mode 2 — Situation Navigator Core)**:
  Expands the intake system to accept conversational dispute descriptions without documents, invoking `/api/analyze/situation` via `SituationAnalysisSchema` and rendering statutory rights accordions.
- **Phase 4 (Mode 3 — Document Comparison Engine)**:
  Duplicates the `DocumentDropzone` into side-by-side comparison slots ("Doc A" vs "Doc B"), invoking `/api/analyze/compare` via `ComparisonSchema` and rendering diff matrices.
- **Phase 5 (Mode 4 — Contextual Q&A, Export Tools, & Universal Polish)**:
  Attaches the streaming `ChatPanel` drawer over active analysis results, enables universal formatted plain-text/markdown report downloads, and conducts final mobile/accessibility polish.
