# Phase 3: Mode 2 — Situation Navigator Core - Context

**Gathered:** 2026-09-22  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the conversational dispute intake pipeline and legal guidance dossier at `/analyze/situation`:
- Backend route handler `/api/analyze/situation` utilizing Vercel AI SDK `generateObject` with Claude 3.5 Sonnet and updated `SituationAnalysisSchema` (`lib/schemas/situation.ts`) with zero persistence.
- Dispute intake interface:
  - Large free-text narrative textarea with `<20` words inline warning banner, live word counter, and contextual prompt helpers ("Who was involved? What was promised? What dates?").
  - Clickable quick-start dispute scenario cards (Security deposit withheld, Termination without notice, Undelivered consumer goods, Unpaid freelance invoice) that pre-fill the intake.
  - Optional dispute category pre-filter chips (with default "Auto-Detect").
  - `sessionStorage` auto-save preserving draft narratives across accidental browser refreshes with clear/reset capability.
- Situation Navigator Dossier featuring 6 key presentation layers:
  1. Top-level Critical Deadline Alert Banner (SIT-07) displaying time-sensitive limitation windows or notice deadlines with amber/crimson accents and clock indicators.
  2. Executive Summary & Category Confirmation Card (SIT-02, SIT-03, SIT-06) featuring an auto-detected category badge with a "Change" dropdown to re-run, plain-English situation recap, and overall estimated resolution timeline.
  3. "Your Rights" Section (SIT-04) rendering Radix Accordions with shield icons, statutory citation badges (`JetBrains Mono`), and objective plain-English rights breakdowns.
  4. Next Steps Roadmap (SIT-05) structured across a 4-tier urgency timeline (`immediate`, `within-7-days`, `within-30-days`, `when-ready`) with emerald "Doable Solo" vs amber "Counsel Recommended" badges and interactive check-off states.
  5. "Documents to Gather" Checklist (SIT-06) structured as `{ document, why }` evidentiary cards with interactive check-off states and progress counter.
  6. "When to Call a Lawyer" Guidance (SIT-06) rendering concrete escalation threshold trigger cards.
- Navigation & Feedback:
  - 5-section StickyNav (`Summary`, `Your Rights [N]`, `Roadmap [N]`, `Evidence [N]`, `Counsel Triggers [N]`) with scroll-spy active state and "Start New Situation" reset button.
  - 3-stage animated loader cycling through dispute classification, rights evaluation, and roadmap synthesis.
  - Dual non-UPL epistemic guardrails (strict negative system prompts avoiding second-person imperative advice + inline educational notice badge).

</domain>

<decisions>
## Implementation Decisions

### Intake UX & Prompt Assistance
- **D-01:** Quick-start dispute scenario cards: provide 4 clickable starter cards (Tenancy Security Deposit, Employment Termination, Consumer Undelivered Goods, Freelance Unpaid Invoice) above or below the textarea to pre-fill realistic scenarios for rapid evaluation. — **Reversibility:** reversible
- **D-02:** Word count validation: live counter below textarea; if under 20 words, submit button is disabled and an inline warning banner renders with guided contextual prompt suggestions ("Who is involved? What was promised or agreed? Roughly when did this happen?"). — **Reversibility:** reversible
- **D-03:** Dedicated route `/analyze/situation` hosts the dispute intake form and smoothly renders the multi-stage loader and final dossier upon completion (matching Mode 1 `/analyze/document` architecture). — **Reversibility:** costly — establishes top-level routing and navigation URLs.
- **D-04:** Draft persistence: typed dispute narrative auto-saves to browser `sessionStorage` to prevent data loss on accidental page refresh, clearing automatically upon starting a new analysis or clicking "Clear". — **Reversibility:** reversible

### Schema Alignment & Urgency Tiering
- **D-05:** Update `RoadmapUrgencyEnum` in `lib/schemas/situation.ts` to 4 tiers: `immediate`, `within-7-days`, `within-30-days`, `when-ready` (aligns strictly with SIT-05 and PRD requirements). — **Reversibility:** costly — defines backend Zod output contract and client timeline rendering types.
- **D-06:** Structure `documentsToGather` as `z.array(z.object({ document: z.string(), why: z.string() }))` to provide actionable evidentiary rationale for each item rather than flat strings. — **Reversibility:** costly — changes schema definition and component props.
- **D-07:** Add top-level `estimatedTimeline: z.string()` to `SituationAnalysisSchema` to provide an objective resolution timeframe (e.g., "Typically 1–3 months via formal demand letter, or 6–12 months in consumer forum"). — **Reversibility:** costly — schema contract addition.
- **D-08:** Maintain `whenToCallLawyer` as `z.array(z.string())` representing concrete trigger thresholds that warrant attorney consultation, rendering as distinct bulleted warning cards. — **Reversibility:** reversible

### Dossier Layout & Presentation
- **D-09:** Sticky navigation bar docked below global header with 5 anchor targets (`Summary`, `Your Rights [N]`, `Roadmap [N]`, `Evidence [N]`, `Counsel Triggers [N]`), scroll-spy active state, and "Start New Situation" reset button. — **Reversibility:** reversible
- **D-10:** Critical Deadline Warnings (SIT-07): when `deadlineFlags` are present, render a prominent top-level alert banner above all sections with amber/crimson styling, clock icon, and actionable deadline warning cards. — **Reversibility:** reversible
- **D-11:** "Your Rights" Section (SIT-04): Radix Accordion with shield icon, right title, and statute citation in `JetBrains Mono` badge on the header; body contains objective plain-English explanation without prescriptive legal advice. Default first right expanded. — **Reversibility:** reversible
- **D-12:** Interactive check-off states: both Roadmap steps and Documents to Gather checklist support client-side ephemeral check-off with completion counters (e.g. "3 of 6 documents collected"). Roadmap steps display emerald `Doable Solo` vs amber `Counsel Recommended` pill badges. — **Reversibility:** reversible

### Category Confirmation & Non-UPL Guardrails
- **D-13:** Category selection: intake provides optional category filter chips (with default "Auto-Detect"), allowing users to pre-hint or let Claude classify automatically. — **Reversibility:** reversible
- **D-14:** Category confirmation badge: report header displays an auto-detected category badge (e.g. `✓ Verified: Tenancy Dispute`) with a "Change" dropdown to re-run analysis with an explicit domain override. — **Reversibility:** reversible
- **D-15:** Multi-stage animated loader: cycles through 3 domain-specific milestone stages (*Classifying dispute domain & context...* → *Evaluating statutory protections & rights...* → *Mapping urgency roadmap, evidence checklist & deadline warnings...*) with elapsed timer and privacy notice. — **Reversibility:** reversible
- **D-16:** Dual non-UPL epistemic guardrails: system prompt strictly forbids second-person imperative commands ("you should", "you must", "file a lawsuit"), enforcing third-person objective framing ("Citizens in this situation often...", "Applicable statutory codes typically provide...") plus an inline educational advisory badge on the report. — **Reversibility:** costly — core legal compliance contract.

### the agent's Discretion
- Specific Lucide icons used for categories (Home for Tenancy, Briefcase for Employment, ShoppingBag for Consumer, Scale for Civil, Users for Family, Landmark for Property, DollarSign for Financial, AlertCircle for Other).
- Exact animation timing and progress milestone durations for the 3-stage loader.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `prd.html` §05 (lines 876–916) & User Flows (Flow 2, lines 1024–1035) — Authoritative F3: Situation Navigator requirements and schemas.
- `.planning/REQUIREMENTS.md` — SIT-01 through SIT-07, CORE-01, CORE-02, CORE-04.
- `.planning/PROJECT.md` — Non-UPL legal compliance rules, Advocates Act 1961 constraints, zero-persistence architecture.
- `.planning/ROADMAP.md` — Phase 3 goal and success criteria.

### Schemas & Contracts
- `lib/schemas/situation.ts` — Canonical `SituationAnalysisSchema`, `StatutoryRightSchema`, `RoadmapStepSchema`, `DisputeCategoryEnum`, `RoadmapUrgencyEnum`.
- `lib/schemas/common.ts` — Shared enums and type definitions.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/shared/Header.tsx` & `components/shared/LegalDisclaimer.tsx`: Global branding, header navigation, and mandatory non-dismissible legal disclaimers.
- `components/decoder/StickyNav.tsx`: Baseline architecture for sticky anchor navigation and scroll-spy handling.
- `components/decoder/AnalysisProgress.tsx` & `components/decoder/AnalysisErrorCard.tsx`: Established patterns for multi-stage animated loaders and inline diagnostic error states.
- `components/ui/*`: Radix UI primitives (`accordion.tsx`, `badge.tsx`, `button.tsx`, `checkbox.tsx`, `card.tsx`, `dropdown-menu.tsx` / `dialog.tsx`).

### Established Patterns
- Next.js 14 App Router Node.js runtime (`export const runtime = 'nodejs'`) for `/api/analyze/situation`.
- Vercel AI SDK `generateObject` with `claude-3-5-sonnet-20241022`.
- Ephemeral in-memory handling with zero disk or database persistence.
- Styling: Obsidian dark mode (`#0B0F17`), Legal Gold accents (`#C5A059`), slate borders (`#1E293B`), typography (`DM Serif Display`, `DM Sans`, `JetBrains Mono`).

### Integration Points
- Homepage card 2 ("I have a situation" / "Situation Navigator") in `app/page.tsx` links directly to `/analyze/situation`.
- `/analyze/situation/page.tsx`: Hosts intake view when idle, progress card when analyzing, and full Situation Navigator dossier when complete.
- `/api/analyze/situation/route.ts`: API endpoint accepting `{ description: string, category?: string }` and returning validated `SituationAnalysis`.

</code_context>

<specifics>
## Specific Ideas

- Fast-start presets: Providing 4 realistic preset cards allows instant testing and sets user expectations on what level of detail yields optimal legal insights.
- Evidentiary checklist: Explaining *why* each document matters turns a dry list of documents into an educational evidence-building tool for small claims or negotiations.

</specifics>

<deferred>
## Deferred Ideas

- Voice/Audio input for describing disputes (tracked in REQUIREMENTS.md as LANG-02 for v2).
- Formal legal notice generator or email drafting assistant based on roadmap steps (tracked as REDL-02 for v2).

</deferred>

---

*Phase: 3-Mode 2 — Situation Navigator Core*  
*Context gathered: 2026-09-22*
