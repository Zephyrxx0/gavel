# Phase 5: Mode 4 — Contextual Q&A, Export Tools, & Universal Polish - Context

**Gathered:** 2026-09-22  
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the contextual streaming Q&A drawer, universal dossier export tooling, and mobile responsive audit across all three core modes (Mode 1 Decoder, Mode 2 Navigator, Mode 3 Comparison):
- Server-Sent Events (SSE) streaming chat route `/api/chat` utilizing Vercel AI SDK `streamText` with Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`), grounded in active document/situation text and previous structured analysis outputs, strictly observing non-UPL epistemic guardrails.
- Universal slide-in `ChatPanel` drawer component mounted across all analysis pages (`/analyze/document`, `/analyze/situation`, `/analyze/compare`):
  - Accessible via floating action button (FAB) at bottom-right and "Ask Gavel" trigger in the sticky navigation header.
  - Full-screen sheet on mobile viewports (<640px) and slide-over panel (450px) on desktop.
  - Mode-specific dynamic starter prompt chips submitted on click.
  - Rich markdown chat message bubbles with JetBrains Mono clause citation badges and one-click copy.
  - Top persistent legal disclaimer banner and input micro-copy.
- Universal Export Tooling (CORE-03):
  - Integrated into StickyNav header across all modes and rendered as a dedicated Export Dossier Card at the report footer.
  - Supports one-click clipboard copy (Markdown format) with Sonner toast feedback and checkmark animation.
  - Supports file downloads in formatted Markdown (`.md`), clean plain text (`.txt`), and optional structured JSON (`.json`).
- Mobile Polish & System Verification:
  - Responsive StickyNav with horizontal scrolling anchor rail and compact action chips.
  - 44x44px minimum touch targets and iOS `safe-area-inset` bottom padding.
  - End-to-end Vitest test suite and typecheck verification for `/api/chat` and export utilities.

</domain>

<decisions>
## Implementation Decisions

### ChatPanel UX & Trigger Placement
- **D-01:** Drawer layout & trigger: Slide-over right drawer (400–500px on desktop) triggered by both a bottom-right floating action button and Sticky Nav "Ask Gavel" button. — **Reversibility:** reversible
- **D-02:** Dynamic starter prompt chips: Provide 3–4 mode-specific starter prompt chips in the empty state (Mode 1: "Can I terminate early?", "What are the biggest risks?"; Mode 2: "What is my immediate deadline?", "Should I talk to a lawyer now?"; Mode 3: "Which agreement favors me?", "What should I push back on?") that automatically submit when clicked. — **Reversibility:** reversible
- **D-03:** Message presentation: Rich markdown rendering with `react-markdown`, distinct JetBrains Mono clause citations, one-click copy button on assistant responses, auto-scroll to bottom, and "Clear chat" reset button in drawer header. — **Reversibility:** reversible
- **D-04:** Non-UPL compliance: Compact persistent top disclaimer banner with gold shield icon + micro-copy under the input box ("Legal information only. Not legal advice.") ensuring zero ambiguity regarding legal representation. — **Reversibility:** reversible

### Context Grounding & Streaming Citation Syntax
- **D-05:** `/api/chat` context payload: Send active mode identifier (`'document' | 'situation' | 'compare'`), previous structured analysis JSON, and raw source text (truncated to 50k chars if oversized) with each chat request for complete factual grounding. — **Reversibility:** costly — defines client-server chat payload contract.
- **D-06:** Strict epistemic boundary: When asked about topics omitted from the source document, Claude explicitly states "This document does not address [topic]", explains what is typically expected, and suggests asking legal counsel. — **Reversibility:** reversible
- **D-07:** Citation syntax & rendering: Claude formats citations in bracketed syntax like `[Clause X: Title]` or `[Section Y]`, rendered as distinct gold monospace badge chips in JetBrains Mono. — **Reversibility:** reversible
- **D-08:** Dependencies: Approved installing `@ai-sdk/react` and `react-markdown` via `pnpm add @ai-sdk/react react-markdown` (compliant with user rule "Before installing any application, ask the user"). — **Reversibility:** costly — introduces npm package dependencies into `package.json`.

### Universal Export Tooling (CORE-03)
- **D-09:** Dual export placement: Action buttons in Sticky Nav header ("Export" dropdown with Copy & Download) + prominent Export Dossier Card at report footer across Modes 1, 2, and 3. — **Reversibility:** reversible
- **D-10:** Export file formats: Formatted Markdown (`.md`) and Clean Plain Text (`.txt`), with optional clean raw JSON (`.json`) for technical users. — **Reversibility:** reversible
- **D-11:** Export report structure: Mandatory statutory legal disclaimer banner at top, metadata, Executive Summary, full clause/risk breakdowns or situation roadmap, Action Checklist, and Lawyer Prep Guide. — **Reversibility:** reversible
- **D-12:** Copy feedback: Sonner toast notification ("Report copied to clipboard in Markdown format") + button icon switches to checkmark for 2 seconds. — **Reversibility:** reversible

### Mobile Polish & Touch Optimization
- **D-13:** Mobile ChatPanel layout: Full-screen modal sheet on mobile (<640px) with fixed header and sticky bottom input field, transitioning to right slide-over on tablet/desktop (>=640px). — **Reversibility:** reversible
- **D-14:** StickyNav mobile navigation: Horizontally scrollable anchor rail (`overflow-x-auto` with touch momentum) with compact icon-plus-label action chips for Export and Ask Gavel. — **Reversibility:** reversible
- **D-15:** Touch & safe-area hardening: Min 44x44px tap targets, iOS safe-area-inset padding for sticky bars (`pb-[env(safe-area-inset-bottom)]`), and visible active/focus rings for accessibility. — **Reversibility:** reversible
- **D-16:** Quality gate & verification: Automated Vitest suite for `/api/chat` route, streaming handler, export helpers, plus end-to-end typecheck and build validation across all pages. — **Reversibility:** reversible

### the agent's Discretion
- Exact Lucide icons for chat triggers (`MessageSquareText`, `Sparkles`, `Download`, `Copy`, `Check`).
- Precise color gradients for mobile sheet transitions.
- Specific export formatting template helpers (`formatDocumentMarkdown`, `formatSituationMarkdown`, `formatComparisonMarkdown`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `prd.html` §07 F5 (lines 958–1004) & Flows 1-3 (lines 1010–1052) — Authoritative F5: Interactive Q&A requirements, `/api/chat` streaming spec, and user flows.
- `.planning/REQUIREMENTS.md` — CHAT-01, CHAT-02, CHAT-03, CORE-03, CORE-01, CORE-02, CORE-04.
- `.planning/PROJECT.md` — Epistemic non-UPL legal compliance rules, Advocates Act 1961 constraints, zero-persistence architecture.
- `.planning/ROADMAP.md` — Phase 5 goal and success criteria.

### Schemas & Contracts
- `lib/schemas/document.ts` — `DocumentAnalysisSchema` structure used for context grounding and export.
- `lib/schemas/situation.ts` — `SituationAnalysisSchema` structure used for context grounding and export.
- `lib/schemas/comparison.ts` — `ComparisonSchema` structure used for context grounding and export.
- `lib/schemas/common.ts` — Enums and shared types.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/shared/LegalDisclaimer.tsx`: Statutory disclaimer modal and footer component to embed inside ChatPanel.
- `components/shared/Header.tsx`: Global navigation header.
- `components/decoder/StickyNav.tsx`, `components/situation/SituationStickyNav.tsx`, `components/compare/ComparisonStickyNav.tsx`: Existing sticky nav bars to be upgraded with unified export and "Ask Gavel" triggers.
- `components/ui/*`: Radix / shadcn primitives (Dialog, Tabs, Accordion, Tooltip, Sonner toast).

### Established Patterns
- Next.js 14 App Router Node.js runtime (`export const runtime = 'nodejs'`, `export const maxDuration = 60`) for API routes.
- Vercel AI SDK `streamText` with Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`).
- Ephemeral processing with zero server-side file or database persistence.
- Obsidian dark mode theme (`#0B0F17`), Legal Gold accents (`#D4AF37`), slate borders (`#1E293B`), typography (`DM Serif Display`, `DM Sans`, `JetBrains Mono`).
- Epistemic non-UPL guardrails: negative system prompts forbidding "you should", enforcing objective informational framing.

### Integration Points
- `app/api/chat/route.ts`: Streaming SSE route handler.
- `components/chat/ChatPanel.tsx`: Universal slide-in chat drawer.
- `components/chat/ChatTriggerButton.tsx`: Floating action button.
- `lib/export-utils.ts`: Universal report formatters (Markdown, Plain text, JSON).
- `components/export/ExportDossierCard.tsx`: Dedicated report footer export card.
- `app/analyze/document/page.tsx`, `app/analyze/situation/page.tsx`, `app/analyze/compare/page.tsx`: Page controllers to mount ChatPanel and wire export helpers.

</code_context>

<deferred>
## Deferred Ideas

None — all discussed items mapped cleanly into Phase 5 scope.

</deferred>
