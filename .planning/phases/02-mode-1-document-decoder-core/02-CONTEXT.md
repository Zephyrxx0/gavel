# Phase 2: Mode 1 — Document Decoder Core - Context

**Gathered:** 2026-09-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the complete Mode 1 Document Decoder analysis pipeline and user interface at `/analyze/document`:
- Route handler `/api/analyze/document` leveraging Vercel AI SDK `generateObject` with Claude 3.5 Sonnet and `DocumentAnalysisSchema` (`lib/schemas/document.ts`) accepting text and multimodal base64 image payloads with zero persistence.
- Document Decoder view featuring 4 output layers:
  1. Executive Summary & Document Metadata (<200 words plain-English summary, document type badge, contracting parties).
  2. Risk Scorecard with clauses triaged across 3 traffic-light tiers (🔴 High, 🟡 Caution, 🟢 Standard), plain-English rationales, obligation badges, and expandable verbatim source text.
  3. Actionable Checklist categorized by operational timing (*Immediate*, *Before Signing*, *After Signing*) with semantic action badges (*Negotiate*, *Verify*, *Refuse*, *Accept*) and interactive check-off states.
  4. Tailored Lawyer Preparation Guide providing 5–8 high-leverage consultation questions grounded in verbatim clauses with one-click copy and cross-referencing.
- Multi-stage animated loading states, inline error diagnostics with retry, and non-dismissible statutory legal disclaimers.

</domain>

<decisions>
## Implementation Decisions

### Analysis Report Layout & Routing
- **D-01:** Single-scroll legal dossier format with a sticky anchor navigation bar docked beneath the header for jumping between sections (Summary, Risks, Checklist, Lawyer Prep) with active scroll-spy highlighting and badge counts (`Summary`, `Risks [N]`, `Checklist [N]`, `Lawyer Prep [N]`). — **Reversibility:** costly — defines top-level report DOM and scroll container architecture.
- **D-02:** Dedicated route `/analyze/document` hosts the complete Document Decoder intake and analysis report, with clean back navigation to the homepage. — **Reversibility:** costly — sets page routing and URL structure.
- **D-03:** Ingestion intake (dropzone + manual paste) lives directly on `/analyze/document`, and homepage Mode 1 card links directly to `/analyze/document`. — **Reversibility:** reversible
- **D-04:** Active report includes an "Analyze Another Document" button in the sticky nav and footer, cleanly resetting ephemeral React state and returning to intake. — **Reversibility:** reversible

### Risk Scorecard Interaction & Presentation
- **D-05:** Scorecard clauses are filtered via risk-tier chips (`All [N]`, `🔴 High [N]`, `🟡 Caution [N]`, `🟢 Standard [N]`), default showing all clauses sorted High-risk first. — **Reversibility:** reversible
- **D-06:** Clause cards feature simplified plain-English rationale, risk badge, and obligation badge in the primary view, with an expandable Radix Accordion toggle revealing verbatim original legal text in `JetBrains Mono`. — **Reversibility:** reversible
- **D-07:** High-Risk clauses receive prominent visual emphasis via a red left-accent border (`border-l-4 border-red-500/80`), subtle crimson background tint (`bg-red-950/20`), and alert icon next to the clause title. — **Reversibility:** reversible
- **D-08:** Contractual obligation ownership (user vs counterparty vs mutual vs none) renders as a dedicated badge chip (e.g. `Duty: User`, `Duty: Counterparty`, `Mutual`) in `JetBrains Mono` on each clause card. — **Reversibility:** reversible

### Checklist & Lawyer Prep UX
- **D-09:** Actionable Checklist is segmented into 3 chronological sections (*Immediate*, *Before Signing*, *After Signing*) with interactive check-off checkboxes stored in ephemeral state. — **Reversibility:** reversible
- **D-10:** Action Badges (*Negotiate*, *Verify*, *Refuse*, *Accept*) are styled as semantic color-coded pills in `JetBrains Mono`: Negotiate (purple), Verify (amber), Refuse (crimson), Accept (emerald). — **Reversibility:** reversible
- **D-11:** Lawyer Preparation Guide presents 5–8 targeted consultation questions as structured cards with individual "Copy Question" buttons, strategic context notes, and clause grounding tags. — **Reversibility:** reversible
- **D-12:** Interactive clause cross-referencing: clicking `Re: Clause X` on a checklist item or lawyer question smoothly scrolls to and momentarily highlights that clause in the Risk Scorecard. — **Reversibility:** reversible

### AI Pipeline & Loading States
- **D-13:** Multi-stage progress card during the ~10–15s analysis window cycling through animated milestone stages (*Parsing structure* → *Scoring clause risks* → *Formulating action checklist & counsel prep*) with elapsed timer and legal security notice. — **Reversibility:** reversible
- **D-14:** Inline diagnostic error card replaces the progress indicator on API failure or timeout, providing a clear non-technical explanation, "Retry Analysis" button, and option to adjust input or fallback to manual paste. — **Reversibility:** reversible
- **D-15:** `/api/analyze/document` accepts a JSON body `{ text?: string, imageBase64?: string, mimeType?: string, fileName?: string }`, matching Phase 1's `UploadData` envelope, supporting both raw text and multimodal Claude Vision analysis. — **Reversibility:** costly — defines backend analysis contract for Mode 1.

### the agent's Discretion
- Exact animation timing and easing for the scroll-spy anchor links and clause highlight flashes (e.g. 200ms ease-out).
- Specific Lucide icon choices for action badge types and milestone loading stages.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `prd.html` — Mode 1 Document Decoder specifications, 4 output layers, and UX flow.
- `.planning/REQUIREMENTS.md` — Authoritative requirements for Phase 2 (DECODE-01 through DECODE-05, CORE-01, CORE-02, CORE-04).
- `.planning/PROJECT.md` — Non-UPL guardrails, zero-persistence privacy constraints, and Claude 3.5 Sonnet engine choice.
- `.planning/ROADMAP.md` — Phase 2 goals and success criteria.

### Schemas & Contracts
- `lib/schemas/document.ts` — Canonical `DocumentAnalysisSchema`, `ClauseSchema`, `ActionItemSchema`, and `LawyerQuestionSchema`.
- `lib/schemas/upload.ts` — Input `UploadData` envelope structure.
- `lib/schemas/common.ts` — Shared enums: `RiskLevelEnum`, `ActionTimingEnum`, `ActionTypeEnum`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/upload/DocumentDropzone.tsx`: Drag-and-drop file ingestion component.
- `components/upload/FilePreviewCard.tsx`: Pre-analysis document metadata card with downsample info.
- `components/upload/ManualPasteArea.tsx`: Full-featured manual text input with word/char counters.
- `components/shared/Header.tsx`: Global navigation header with legal branding.
- `components/shared/LegalDisclaimer.tsx`: Mandatory non-dismissible legal disclaimer banner and card.
- `components/ui/*`: Pre-installed Radix UI primitives (`Accordion`, `Badge`, `Button`, `Dialog`, `Tabs`, `Tooltip`, `Sonner`).

### Established Patterns
- Next.js 14 App Router route handlers with Node.js runtime (`export const runtime = 'nodejs'`).
- Ephemeral in-memory data flow: zero database or disk persistence.
- Design tokens: Obsidian background (`#0B0F17`), Legal Gold accents (`#C5A059` / `#D4AF37`), slate card borders (`#1E293B`), typography (`DM Serif Display`, `DM Sans`, `JetBrains Mono`).

### Integration Points
- Homepage (`app/page.tsx`) links to `/analyze/document`.
- `/analyze/document/page.tsx` renders intake when idle, multi-stage loader during analysis, and 4-layer dossier on completion.
- `/api/analyze/document/route.ts` consumes `{ text, imageBase64, mimeType }` and returns validated `DocumentAnalysis`.

</code_context>

<specifics>
## Specific Ideas

- Executive Brief feel: The report should look like an authoritative intelligence dossier prepared by a high-end legal analyst, with clear risk hierarchies and actionable takeaways.
- Cross-referencing: Seamless jump from lawyer questions directly to the underlying clause anchors connects high-level inquiries to factual source text.

</specifics>

<deferred>
## Deferred Ideas

- None — all discussion items remained strictly within Phase 2 Mode 1 Document Decoder scope.

</deferred>

---

*Phase: 2-Mode 1 — Document Decoder Core*
*Context gathered: 2026-09-22*
