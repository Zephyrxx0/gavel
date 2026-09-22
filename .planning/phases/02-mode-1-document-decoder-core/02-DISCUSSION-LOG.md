# Phase 2: Mode 1 — Document Decoder Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-22
**Phase:** 2-Mode 1 — Document Decoder Core
**Areas discussed:** Analysis report layout, Risk scorecard interaction, Checklist & lawyer prep UX, AI analysis loading state

---

## Analysis Report Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single-scroll legal dossier | Single-scroll legal dossier with sticky anchor navigation bar for jumping between sections | ✓ |
| Tabbed sub-views | Tabbed sub-views (Summary, Risk Scorecard, Checklist, Lawyer Prep tabs) to focus on one section at a time | |
| Split-pane layout | Split-pane layout (persistent summary card on left sidebar, scrollable details on right pane) | |

**User's choice:** Single-scroll legal dossier with sticky anchor navigation bar for jumping between sections.

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated route `/analyze/document` | Intake redirects or lives directly on `/analyze/document` with back navigation | ✓ |
| In-place state transition on homepage | Replaces dropzone with analysis report in local React state on `/` | |

**User's choice:** Dedicated route `/analyze/document`.

| Option | Description | Selected |
|--------|-------------|----------|
| Intake lives directly on `/analyze/document` | Homepage mode cards link directly to `/analyze/document` | ✓ |
| Shared ephemeral React Context / sessionStorage | Upload on homepage seamlessly hands off to `/analyze/document` | |

**User's choice:** Intake lives directly on `/analyze/document`, and homepage mode cards link directly to `/analyze/document`.

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky top bar with badge counts | Sleek sticky top bar below header with badge counts and active scroll spy | ✓ |
| Floating pill bar | Floating pill bar centered at bottom of screen with section icons | |
| Desktop left sidebar rail | Desktop left sidebar rail collapsing to top bar on mobile | |

**User's choice:** Sleek sticky top bar below header with badge counts (Summary, Risks [N], Checklist [N], Lawyer Prep [N]) and active scroll spy.

---

## Risk Scorecard Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Risk filter chips | Filter chips (All [N], 🔴 High [N], 🟡 Caution [N], 🟢 Standard [N]) with clauses sorted High-risk first | ✓ |
| Segmented 3-column risk grid | High column, Caution column, Standard column | |
| Inline search input | Search input filtering clause titles alongside filter chips | |

**User's choice:** Risk filter chips (All [N], 🔴 High [N], 🟡 Caution [N], 🟢 Standard [N]) with clauses sorted High-risk first.

| Option | Description | Selected |
|--------|-------------|----------|
| Simplified explanation with expandable source | Primary view highlights simplified plain-English rationale + badges, expandable toggle reveals verbatim original text in monospace | ✓ |
| Side-by-side view | Plain-English explanation on left, original legal excerpt on right | |
| Original excerpt first | Original excerpt displayed first, expandable translation drawer | |

**User's choice:** Primary view highlights simplified plain-English rationale + badges, with an expandable toggle to view verbatim original text in monospace font.

| Option | Description | Selected |
|--------|-------------|----------|
| Red left-accent border & crimson tint | Distinctive red left-accent border (border-l-4), subtle crimson background tint, and warning badge for high-risk items | ✓ |
| High-contrast badge chip only | Uniform neutral dark card styling for all clauses | |
| Floating callout box | Floating callout box pinning high-risk clauses to the top | |

**User's choice:** Distinctive red left-accent border (border-l-4), subtle crimson background tint, and warning badge for high-risk items.

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated obligation badge chip | Dedicated badge chip (e.g. "Duty: Tenant / User", "Duty: Counterparty", "Mutual") in JetBrains Mono | ✓ |
| Subtle icon indicator | Hover tooltip explaining duty | |
| Omit separate badge | Integrated into the plain-English explanation text | |

**User's choice:** Dedicated obligation badge chip (e.g. "Duty: Tenant / User", "Duty: Counterparty", "Mutual") in JetBrains Mono font.

---

## Checklist & Lawyer Prep UX

| Option | Description | Selected |
|--------|-------------|----------|
| 3 chronological sections with checkboxes | Immediate, Before Signing, After Signing with interactive check-off checkboxes in ephemeral state | ✓ |
| Read-only task cards | Clean read-only task cards with action badges | |
| Unified task table | Filter toggles by timing and action type | |

**User's choice:** 3 chronological sections (Immediate, Before Signing, After Signing) with interactive check-off checkboxes in ephemeral state.

| Option | Description | Selected |
|--------|-------------|----------|
| Semantic color-coded badge pills | JetBrains Mono font (Negotiate: purple, Verify: amber, Refuse: crimson, Accept: emerald) | ✓ |
| Monochrome slate/gold badge pills | Differentiated solely by Lucide action icons | |
| Subtle text prefix | No badge pill container | |

**User's choice:** Semantic color-coded badge pills in JetBrains Mono font (Negotiate: purple, Verify: amber, Refuse: crimson, Accept: emerald).

| Option | Description | Selected |
|--------|-------------|----------|
| Structured question cards with copy button | Question cards with individual "Copy Question" button, grounding clause tag, and strategic context note | ✓ |
| Consultation cheat-sheet layout | Top-level "Copy All Questions" button with numbered items | |
| Collapsible question accordions | Revealing why to ask and what answers to watch out for | |

**User's choice:** Structured question cards with individual "Copy Question" button, grounding clause reference link/tag, and strategic context note.

| Option | Description | Selected |
|--------|-------------|----------|
| Interactive link to clause | Clicking "Re: Clause X" smoothly scrolls to and briefly highlights that clause in the Risk Scorecard | ✓ |
| Hover tooltip | Hovering over tag displays popover with clause summary | |
| Static text tag | Non-interactive badge | |

**User's choice:** Interactive link: clicking "Re: Clause X" smoothly scrolls to and briefly highlights that clause in the Risk Scorecard.

---

## AI Analysis Loading State

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-stage progress card | Cycling through analysis milestones (Parsing structure → Scoring clause risks → Formulating action checklist & counsel prep) with elapsed timer | ✓ |
| Shimmering skeleton wireframe | Mirroring the report's 4 sections | |
| Minimalist indeterminate bar | Status text and elapsed seconds counter | |

**User's choice:** Multi-stage progress card cycling through analysis milestones with elapsed timer.

| Option | Description | Selected |
|--------|-------------|----------|
| Prominent inline error card | Clear failure explanation, "Retry Analysis" button, and link to switch/adjust input | ✓ |
| Toast notification | Toast notification with error message and reset | |
| Blocking modal dialog | Error details and retry button | |

**User's choice:** Prominent inline error card with clear failure explanation, "Retry Analysis" button, and link to switch/adjust input.

| Option | Description | Selected |
|--------|-------------|----------|
| JSON body matching UploadData | JSON body with { text?, imageBase64?, mimeType?, fileName? } | ✓ |
| FormData payload | Taking raw file directly on analyze route | |

**User's choice:** JSON body with { text?: string, imageBase64?: string, mimeType?: string, fileName?: string } matching Phase 1 upload envelope data.

| Option | Description | Selected |
|--------|-------------|----------|
| "Analyze Another Document" button | Action button in sticky nav and footer resetting ephemeral state | ✓ |
| Top nav menu | Menu with "Analyze New Document" and "Print / Save PDF" | |
| Simple back link | Back link in header | |

**User's choice:** "Analyze Another Document" action button in sticky nav and footer, cleanly resetting ephemeral report state and returning to intake.

---

## the agent's Discretion

- Animation timing and easing curves for scroll-spy transitions and clause highlight flashes.
- Specific Lucide icons for action badge types and milestone loading stages.

## Deferred Ideas

- None — discussion remained focused strictly on Phase 2 scope.

