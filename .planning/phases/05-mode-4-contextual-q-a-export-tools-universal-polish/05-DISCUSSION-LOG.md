# Phase 5: Mode 4 — Contextual Q&A, Export Tools, & Universal Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-22  
**Phase:** 05-mode-4-contextual-q-a-export-tools-universal-polish  
**Areas discussed:** ChatPanel UX & Trigger Placement, Context Grounding & Streaming Citation Syntax, Universal Export Tooling, Mobile Polish & Touch Optimization

---

## ChatPanel UX & Trigger Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Slide-over right drawer (400-500px on desktop) | Triggered by both floating action button and Sticky Nav "Ask Gavel" button | ✓ |
| Docked bottom collapsible panel / split view | Keeps analysis visible side-by-side | |
| Modal dialog centered over screen | Popup overlay | |

**User's choice:** Slide-over right drawer (400-500px on desktop) triggered by both floating action button and Sticky Nav "Ask Gavel" button.  
**Notes:** Provides a non-intrusive drawer experience that keeps report visible while interacting with AI assistant.

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic mode-specific starter prompt chips | Submit on click (Mode 1: "Can I terminate early?", Mode 2: "What is my immediate deadline?", Mode 3: "What should I push back on?") | ✓ |
| Pre-fills input field | User can edit before sending | |
| Clean empty state | Greeting and disclaimer only, no prompt chips | |

**User's choice:** Dynamic mode-specific starter prompt chips that submit on click.

| Option | Description | Selected |
|--------|-------------|----------|
| Rich markdown rendering | JetBrains Mono clause citations, one-click copy on assistant messages, "Clear chat" reset button in drawer header | ✓ |
| Plain markdown with auto-scroll only | No per-message copy buttons | |

**User's choice:** Rich markdown rendering with JetBrains Mono clause citations, one-click copy on assistant messages, and "Clear chat" reset button in drawer header.

| Option | Description | Selected |
|--------|-------------|----------|
| Compact persistent top disclaimer banner | Gold shield icon + micro-copy under input box ("Legal information only. Not legal advice.") | ✓ |
| System disclaimer bubble | First message in chat history stream | |
| Expandable accordion | Full disclaimer inside chat header | |

**User's choice:** Compact persistent top disclaimer banner with gold shield icon + micro-copy under the input box ("Legal information only. Not legal advice.").

---

## Context Grounding & Streaming Citation Syntax

| Option | Description | Selected |
|--------|-------------|----------|
| Full payload | Active mode identifier, previous structured analysis JSON, and raw source text (truncated to 50k chars if oversized) | ✓ |
| Only raw source text | Without previous structured analysis | |
| Only structured analysis summary | Without raw source text | |

**User's choice:** Full payload: active mode identifier, previous structured analysis JSON, and raw source text (truncated to 50k chars if oversized).

| Option | Description | Selected |
|--------|-------------|----------|
| Strict epistemic guardrail | Explicitly state "This document does not address [topic]", explain typical expectations, suggest legal counsel | ✓ |
| Soft guidance | Provide general industry norms without explicitly highlighting document omission | |

**User's choice:** Strict epistemic guardrail: explicitly state "This document does not address [topic]", explain what is typically expected, and suggest asking legal counsel.

| Option | Description | Selected |
|--------|-------------|----------|
| Bracketed citation format | E.g. [Clause X: Title] or [Section Y] rendered as distinct gold monospace badge chips in JetBrains Mono | ✓ |
| Standard bold inline text | E.g. **Clause 4.2 (Termination)** | |
| Numbered footnotes | References at the bottom of the reply | |

**User's choice:** Bracketed format e.g. [Clause X: Title] or [Section Y] rendered as distinct gold monospace badge chips in JetBrains Mono.

| Option | Description | Selected |
|--------|-------------|----------|
| Approve installing @ai-sdk/react and react-markdown via pnpm | Matches STACK.md and PRD spec | ✓ |
| Build lightweight custom React streaming hook | Standard fetch/ReadableStream without new packages | |

**User's choice:** Approve installing @ai-sdk/react and react-markdown via pnpm (matches STACK.md and PRD spec).

---

## Universal Export Tooling

| Option | Description | Selected |
|--------|-------------|----------|
| Dual placement | Action buttons in Sticky Nav header ("Export" dropdown with Copy & Download) + prominent Export Dossier Card at report footer | ✓ |
| Only in Sticky Nav header | Compact icon buttons | |
| Floating action bar | Docked at screen bottom alongside Ask Gavel | |

**User's choice:** Dual placement: Action buttons in Sticky Nav header ("Export" dropdown with Copy & Download) + prominent Export Dossier Card at report footer.

| Option | Description | Selected |
|--------|-------------|----------|
| Formatted Markdown (.md) and Clean Plain Text (.txt) with optional raw JSON (.json) | For both citizens and technical users | ✓ |
| Clean Plain Text (.txt) and Formatted Markdown (.md) only | | |
| Clean Plain Text (.txt) only | | |

**User's choice:** Formatted Markdown (.md) and Clean Plain Text (.txt) with optional raw JSON (.json) for technical users.

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive report | Statutory legal disclaimer banner at top, metadata, Executive Summary, full clause/risk breakdowns, Action Checklist, and Lawyer Prep Guide | ✓ |
| Executive summary and action checklist only | Without clause excerpts | |

**User's choice:** Comprehensive report: Statutory legal disclaimer banner at top, metadata, Executive Summary, full clause/risk breakdowns, Action Checklist, and Lawyer Prep Guide.

| Option | Description | Selected |
|--------|-------------|----------|
| Sonner toast notification + checkmark icon switch | "Report copied to clipboard in Markdown format" + button icon switches to checkmark for 2s | ✓ |
| Button checkmark switch only | Without floating toast | |

**User's choice:** Sonner toast notification ("Report copied to clipboard in Markdown format") + button icon switches to checkmark for 2s.

---

## Mobile Polish & Touch Optimization

| Option | Description | Selected |
|--------|-------------|----------|
| Full-screen modal sheet on mobile (<640px) | Fixed header and sticky bottom input field, transitioning to right slide-over on tablet/desktop (>=640px) | ✓ |
| Bottom sheet drawer modal | Occupying 85% viewport height on mobile | |

**User's choice:** Full-screen modal sheet on mobile (<640px) with fixed header and sticky bottom input field, transitioning to right slide-over on tablet/desktop (>=640px).

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontally scrollable anchor rail | Overflow-x-auto with touch momentum + compact icon-plus-label action chips for Export and Ask Gavel | ✓ |
| Collapsible hamburger dropdown | With persistent Export and Ask buttons | |

**User's choice:** Horizontally scrollable anchor rail (overflow-x-auto with touch momentum) with compact icon-plus-label action chips for Export and Ask Gavel.

| Option | Description | Selected |
|--------|-------------|----------|
| Full touch hardening | Min 44x44px tap targets, iOS safe-area-inset padding for sticky bars, visible active/focus rings for accessibility | ✓ |
| Standard Tailwind button sizing | Without specific safe-area padding | |

**User's choice:** Full touch hardening: min 44x44px tap targets, iOS safe-area-inset padding for sticky bars, and visible active/focus rings for accessibility.

| Option | Description | Selected |
|--------|-------------|----------|
| Comprehensive verification | Automated Vitest suite for /api/chat & export helpers + end-to-end typecheck & build validation across all pages | ✓ |
| Focused tests for /api/chat route only | Without universal export helper tests | |

**User's choice:** Comprehensive verification: Automated Vitest suite for /api/chat & export helpers + end-to-end typecheck & build validation across all pages.

---

## the agent's Discretion

- Exact Lucide icons for chat triggers (`MessageSquareText`, `Sparkles`, `Download`, `Copy`, `Check`).
- Precise color gradients for mobile sheet transitions.
- Specific export formatting template helpers (`formatDocumentMarkdown`, `formatSituationMarkdown`, `formatComparisonMarkdown`).

## Deferred Ideas

None.

