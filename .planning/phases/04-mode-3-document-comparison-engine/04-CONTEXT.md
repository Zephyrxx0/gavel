# Phase 4: Mode 3 — Document Comparison Engine - Context

**Gathered:** 2026-09-22  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the dual-document ingestion pipeline, comparison API, and comparative legal dossier at `/analyze/compare`:
- Route handler `/api/analyze/compare` utilizing Vercel AI SDK `generateObject` with Claude 3.5 Sonnet and updated `ComparisonSchema` (`lib/schemas/comparison.ts`) with zero disk or database persistence.
- Dual-document comparison intake interface:
  - Side-by-side comparison zones for Document A and Document B with customizable label text inputs and pre-fill presets.
  - Independent "Upload File" (PDF, DOCX, JPG, PNG up to 10MB) and "Paste Text" tabs per zone, supporting mixed input combinations.
  - Immediate per-zone upload and text extraction via `/api/upload` with independent file previews, word counts, and error states.
  - 2–3 Quick-Start comparison preset cards (Residential Lease Renewal, Freelance MSA vs Client Redline) for 1-click test evaluations.
- Comparison Dossier featuring 4 core presentation layers:
  1. Overall Favorability Verdict Hero Card (COMP-03) indicating whether terms favor Document A, Document B, or are neutral, with comparative statistics chips and an executive rationale.
  2. Inconsistencies Section (COMP-05) situated prominently above the differences table with severity badges (Critical, Notable, Minor) highlighting direct contradictions, omissions, or unilateral additions.
  3. Side-by-Side Differences Table (COMP-04) mapping clause variances across categories with desktop 2-column grid vs mobile stacked tabs, verbatim clause text in `JetBrains Mono`, favorability badges, risk ratings, and plain-English "Why this matters" impact callouts, with multi-facet quick-filter chips (`All`, `Favors Doc A`, `Favors Doc B`, `🔴 High Risk`).
  4. Negotiation Guide (COMP-06) organizing tactical advice into a 3-column responsive card grid (*Push Back On*, *Accept As-Is*, *Flag for Lawyer*) with interactive check-off states and individual "Copy Talking Point" clipboard buttons.
- Large Document Two-Pass Strategy (COMP-07):
  - Server-side auto-detection when combined documents exceed 80,000 characters.
  - Concurrent Pass 1 key clause extraction via `Promise.all` across high-leverage categories (Payment, Liability, Termination, IP, Warranties, Dispute Resolution, Restrictive Covenants), followed by Pass 2 comparative synthesis.
  - Dynamic progress loader notice displaying an amber badge and stage transitions for Pass 1 and Pass 2.
- Sticky navigation bar with anchor targets (`Verdict`, `Inconsistencies [N]`, `Differences [N]`, `Negotiation [N]`), scroll-spy active highlighting, and "Compare Another Pair" reset button.

</domain>

<decisions>
## Implementation Decisions

### Dual Upload & Intake Flow
- **D-01:** Document labeling: Pre-filled editable input fields with quick preset chips ("Original vs Revised", "Vendor vs Client", "Last Year vs New Lease"), defaulting to "Original Document (Doc A)" and "Revised Version (Doc B)" with custom inline renaming. — **Reversibility:** reversible
- **D-02:** Mixed input support: Each zone independently provides its own "Upload File" / "Paste Text" tabs, enabling mixed format comparisons (e.g. Doc A uploaded PDF vs Doc B pasted redline email text). — **Reversibility:** reversible
- **D-03:** Quick-Start presets: Provide 2–3 clickable preset cards (e.g. "Residential Lease Renewal", "Freelance MSA vs Client Redline") that populate realistic contract pairs for instant 1-click testing. — **Reversibility:** reversible
- **D-04:** Immediate per-zone validation: Each zone triggers `/api/upload` immediately upon file drop or text entry, displaying word counts, file previews, and local error messages independently. The "Compare Documents" submit button unlocks only when both zones contain valid content. — **Reversibility:** reversible

### Differences Table & Visual Contrast
- **D-05:** Responsive layout: Desktop displays a 2-column side-by-side grid (`lg:grid-cols-2`) with Doc A on the left and Doc B on the right; mobile automatically switches to stacked toggle tabs (Doc A / Doc B view switcher per clause) for maximum legibility without horizontal scrolling. — **Reversibility:** reversible
- **D-06:** Clause variance presentation: Each clause row renders verbatim excerpts in `JetBrains Mono`, an explicit favorability badge (e.g. `Favors: Revised Version`), a risk tier badge (`High`, `Medium`, `Low`), and a distinct plain-English "Why this matters" impact callout box. — **Reversibility:** reversible
- **D-07:** Filter & sort controls: Multi-facet quick-filter chips docked above the table (`All [N]`, `Favors Doc A [N]`, `Favors Doc B [N]`, `🔴 High Risk [N]`), sorting High Risk differences first by default. — **Reversibility:** reversible
- **D-08:** Inconsistencies placement: Dedicated high-visibility section rendered directly beneath the Overall Verdict Hero Card (before the Differences Table), highlighting internal contradictions, unusual additions, and omitted standard protections with Critical (crimson), Notable (amber), and Minor (blue) badges. — **Reversibility:** reversible

### Large Document Two-Pass Strategy (COMP-07)
- **D-09:** UI progress feedback: Dynamic progress loader displays an amber notice badge (*"Large contracts detected: ~XXk characters — running two-pass clause extraction"*) and updates status milestones (Pass 1: Key clause extraction → Pass 2: Comparative synthesis). — **Reversibility:** reversible
- **D-10:** Server-side orchestration: Route `/api/analyze/compare` inspects combined character count; if > 80,000 characters, it automatically executes Pass 1 extraction on Doc A and Doc B concurrently via `Promise.all` using a concise clause extraction prompt, then feeds the extracted clauses into Pass 2 comparison, returning a unified `ComparisonSchema` response. — **Reversibility:** costly — defines backend execution model and prompt pipeline.
- **D-11:** Pass 1 category scope: Focused extraction targeting high-leverage legal domains: Payment & Penalties, Liability & Indemnity, Termination & Notice, Intellectual Property, Warranties & Representations, Dispute Resolution & Jurisdiction, and Unilateral/Restrictive Covenants. — **Reversibility:** costly — governs extraction fidelity for large contracts.
- **D-12:** Route timeout & resilience: Set `export const maxDuration = 60` on `/api/analyze/compare` with concise Pass 1 schemas and clean inline error diagnostics with retry handling. — **Reversibility:** reversible

### Negotiation Guide & Favorability Verdict
- **D-13:** Schema alignment for Negotiation Guide: Upgrade `lib/schemas/comparison.ts` from a flat string array to structured tactical cards for each of the three categories (`pushBack`, `acceptAsIs`, `flagForLawyer`), containing `{ clauseTitle: string, rationale: string, suggestedAlternative?: string }`, plus an overall summary `recommendation: string`. — **Reversibility:** costly — defines backend Zod output contract and client component props.
- **D-14:** 3-Column responsive card grid: Render the three negotiation categories side-by-side on desktop (Push Back in rose/crimson, Accept As-Is in emerald, Flag for Lawyer in amber/gold), stacking vertically on mobile. — **Reversibility:** reversible
- **D-15:** Interactive negotiation actions: Support client-side check-off states for completed negotiation points, paired with individual "Copy Talking Point" buttons to copy counter-proposal wording directly to the clipboard. — **Reversibility:** reversible
- **D-16:** Overall Verdict Hero Card: Top card displays a prominent favorability verdict pill (`Doc A`, `Doc B`, or `Neutral`), executive rationale, comparative metric chips (`X clauses favor Doc A`, `Y clauses favor Doc B`, `Z critical inconsistencies`), and strategic bottom-line advice. — **Reversibility:** reversible

### the agent's Discretion
- Exact Lucide icons for clause categories (DollarSign for Payment, ShieldAlert for Liability, FileX for Termination, Scale for Dispute Resolution, etc.).
- Exact animation timing and progress step intervals for single-pass vs two-pass comparison loaders.
- Specific sample contract excerpts chosen for the 2–3 Quick-Start presets.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `prd.html` §06 F4 (lines 918–954) & Flow 3 (lines 1040–1052) — Authoritative F4: Document Comparison requirements, schema, and user flow.
- `.planning/REQUIREMENTS.md` — COMP-01 through COMP-07, CORE-01, CORE-02, CORE-04.
- `.planning/PROJECT.md` — Non-UPL legal compliance rules, Advocates Act 1961 constraints, zero-persistence architecture.
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria.

### Schemas & Contracts
- `lib/schemas/comparison.ts` — Canonical `ComparisonSchema`, `ClauseDiffSchema`, `InconsistencyItemSchema`, `FavorabilityEnum`.
- `lib/schemas/common.ts` — Shared enums (`RiskLevelEnum`, `InconsistencySeverityEnum`).
- `lib/schemas/upload.ts` — `UploadData` and `UploadResponseSchema`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/upload/DocumentDropzone.tsx`: Drag-and-drop file ingestion with client-side downsampling and validation.
- `components/upload/FilePreviewCard.tsx`: Preview card showing file name, size, word count, and delete button.
- `components/upload/ManualPasteArea.tsx`: Manual text paste component with fallback notification support.
- `components/shared/Header.tsx` & `components/shared/LegalDisclaimer.tsx`: Global branding and mandatory non-dismissible statutory disclaimers.
- `components/decoder/StickyNav.tsx`: Baseline sticky anchor nav with scroll-spy highlighting.
- `components/decoder/AnalysisProgress.tsx` & `components/decoder/AnalysisErrorCard.tsx`: Established multi-stage loader and inline error card patterns.
- `lib/image-utils.ts`: Client-side image downsampling for high-res scans.

### Established Patterns
- Next.js 14 App Router Node.js runtime (`export const runtime = 'nodejs'`, `export const maxDuration = 60`) for analysis endpoints.
- Vercel AI SDK `generateObject` with `claude-3-5-sonnet-20241022`.
- Ephemeral in-memory handling with zero server disk or database persistence.
- Obsidian dark mode theme (`#0B0F17`), Legal Gold accents (`#D4AF37`), slate borders (`#1E293B`), typography (`DM Serif Display`, `DM Sans`, `JetBrains Mono`).
- Epistemic non-UPL guardrails: negative system prompts prohibiting prescriptive legal advice ("you should", "you must") with objective third-person framing ("Parties typically consider...", "The revised term shifts liability to...").

### Integration Points
- Homepage `app/page.tsx`: Mode 3 card linking to `/analyze/compare`.
- Dedicated route `/analyze/compare/page.tsx`: Hosts the dual intake view when idle, animated progress loader when comparing, and full Comparison Dossier when complete.
- API route handler `/api/analyze/compare/route.ts`: Accepts `{ docA: string, docB: string, labelA: string, labelB: string }` and returns validated `ComparisonAnalysis`.

</code_context>

<specifics>
## Specific Ideas

- Realistic Presets: Provide pre-loaded lease renewal and freelance redline examples so users can immediately experience the side-by-side diffing and negotiation guidance without having two contracts on hand.
- Actionable Copying: Giving users individual "Copy Talking Point" buttons on Push Back cards turns the comparison report directly into an email negotiation drafting tool.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 4-Mode 3 — Document Comparison Engine*  
*Context gathered: 2026-09-22*
