# Phase 4: Mode 3 — Document Comparison Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-22  
**Phase:** 4-Mode 3 — Document Comparison Engine  
**Areas discussed:** Dual Upload & Intake Flow, Side-by-Side Diff Table & Visual Contrast, Large Document Two-Pass Strategy, Negotiation Guide & Actionable Categorization

---

## Dual Upload & Intake Flow

### Question 1: Document Labeling Configuration
| Option | Description | Selected |
|--------|-------------|----------|
| Pre-filled editable inputs with quick preset chips | Default to "Original Document" and "Revised Version", with one-click chips ("Original vs Revised", "Vendor vs Client", "Last Year vs New Lease") plus custom renaming. | ✓ |
| Free-text label inputs only | Simple input fields above each upload box with placeholder text. | |
| Static labels | Fixed "Document A" and "Document B" with no custom label editing. | |

**User's choice:** Pre-filled editable inputs with quick preset chips.

### Question 2: Mixed Input Support per Zone
| Option | Description | Selected |
|--------|-------------|----------|
| Independent input mode per zone | Each document zone has its own "Upload File" / "Paste Text" toggle, allowing mixed inputs (e.g. Doc A uploaded PDF vs Doc B pasted redline email text). | ✓ |
| Global mode toggle | User chooses either "Dual File Upload" or "Dual Text Paste" across both documents together. | |
| File upload only | Disable text paste for Mode 3 and require file uploads for both sides. | |

**User's choice:** Independent input mode per zone.

### Question 3: Quick-Start Comparison Presets
| Option | Description | Selected |
|--------|-------------|----------|
| 2–3 Quick-Start comparison presets | Provide clickable cards (e.g. "Residential Lease Renewal", "Freelance MSA vs Client Redline") that load realistic paired contracts for instant testing. | ✓ |
| Single "Load Sample Comparison" button | Loads one canonical contract comparison pair. | |
| No presets | Require users to provide their own documents/text every time. | |

**User's choice:** 2–3 Quick-Start comparison presets.

### Question 4: File Ingestion & Validation Flow
| Option | Description | Selected |
|--------|-------------|----------|
| Immediate upload on file drop with per-zone preview & errors | Each zone extracts immediately, showing word count / preview / error independently. The "Compare Documents" button activates once both documents are valid. | ✓ |
| Submit-triggered Promise.all upload | Files are held locally until the user clicks "Compare", then uploaded in parallel with a combined loading bar. | |
| Sequential drop requirement | User must drop and validate Document A before Document B upload is unlocked. | |

**User's choice:** Immediate upload on file drop with per-zone preview & errors.

---

## Side-by-Side Diff Table & Visual Contrast

### Question 1: Table Layout on Desktop vs Mobile
| Option | Description | Selected |
|--------|-------------|----------|
| Responsive side-by-side | Two-column grid on desktop (Doc A left, Doc B right), switching to stacked toggle tabs on mobile (Doc A / Doc B view toggle per clause) for maximum legibility. | ✓ |
| Horizontally scrollable table | Strict side-by-side table that scrolls horizontally on small screens. | |
| Unified stacked view everywhere | Doc A on top and Doc B directly beneath within each clause card across both desktop and mobile. | |

**User's choice:** Responsive side-by-side (2-column desktop, stacked toggle tabs on mobile).

### Question 2: Clause Variance Visual Styling
| Option | Description | Selected |
|--------|-------------|----------|
| Clause excerpt cards with Favorability & Risk badges + plain-English impact box | Verbatim text in JetBrains Mono, favor badge (e.g. "Favors: Revised Version"), risk badge (High/Medium/Low), and explanatory "Why this matters" callout. | ✓ |
| Inline word-level visual diff + impact box | Automated visual highlight of added/removed words between Doc A and Doc B, plus favorability badge and explanation. | |
| Simplified summary cards | Focus primarily on the plain-English analysis with collapsed optional source text accordions. | |

**User's choice:** Clause excerpt cards with Favorability & Risk badges + plain-English impact box.

### Question 3: Differences Table Filtering & Sorting
| Option | Description | Selected |
|--------|-------------|----------|
| Quick-filter chips (All [N], Favors Doc A [N], Favors Doc B [N], 🔴 High Risk [N]) | Allows instant isolation of clauses favoring the other party or carrying severe legal risk, sorted High Risk first. | ✓ |
| Category accordion groups | Group clauses under collapsible headers by category (Payment, Liability, Termination, IP) with count badges. | |
| Flat chronological list | Show all differences in single linear document order with no filtering controls. | |

**User's choice:** Quick-filter chips (All, Favors Doc A, Favors Doc B, High Risk), sorting High Risk first.

### Question 4: Inconsistencies Section Placement & Styling
| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated Inconsistencies section above Differences Table | Renders directly beneath the Overall Verdict as high-priority cards with Critical (crimson), Notable (amber), and Minor (blue) severity badges, highlighting contradictions and omitted terms first. | ✓ |
| Tabbed toggle between "Clause Differences" and "Inconsistencies" | Keeps the view compact by letting users switch views. | |
| Integrated into the Differences Table | Flag inconsistencies as inline alert banners inside corresponding clause rows. | |

**User's choice:** Dedicated Inconsistencies section above Differences Table.

---

## Large Document Two-Pass Strategy

### Question 1: UI Feedback for Large Documents (> 80k chars)
| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic progress loader notice | Display a clear amber badge ("Large contracts detected: ~XXk characters — running two-pass clause extraction") and adapt loader stages to show (Pass 1: Key clause extraction → Pass 2: Comparative synthesis). | ✓ |
| Pre-analysis confirmation prompt | Show an alert dialog informing the user before triggering the two-pass API call. | |
| Silent automatic execution | Run two-pass extraction automatically without special loader status, adding a small badge on the final report. | |

**User's choice:** Dynamic progress loader notice with multi-pass milestones.

### Question 2: Two-Pass Architecture & Orchestration
| Option | Description | Selected |
|--------|-------------|----------|
| Server-side orchestration in /api/analyze/compare | Server automatically detects length > 80k chars, executes Pass 1 extraction on both docs concurrently via Promise.all, then runs Pass 2 comparison, returning the unified ComparisonSchema response. | ✓ |
| Client-orchestrated multi-call | Frontend explicitly calls a separate /api/analyze/extract route for Doc A and Doc B, then calls compare with the extracted clauses. | |
| Truncate with warning | Cap combined text at 80k characters and only analyze the first 80k characters without two-pass extraction. | |

**User's choice:** Server-side orchestration in `/api/analyze/compare`.

### Question 3: Pass 1 Clause Extraction Scope
| Option | Description | Selected |
|--------|-------------|----------|
| High-leverage standard legal categories | Extract and structure clauses across Payment, Liability & Indemnity, Termination/Notice, IP, Warranties, Dispute Resolution, and Restrictive Covenants. | ✓ |
| Fixed chunking with full extraction | Split into 20k-char segments and summarize all sections linearly. | |
| User category selection | Ask the user which clauses/topics they want to prioritize when contracts exceed 80k characters. | |

**User's choice:** High-leverage standard legal categories.

### Question 4: Timeout & Resilience Handling
| Option | Description | Selected |
|--------|-------------|----------|
| maxDuration = 60 with concise Pass 1 prompts & graceful retry | Ensure Route Handler allows 60s runtime, optimize Pass 1 schema for compact clause summaries, and show clear inline retry on timeout. | ✓ |
| Fallback to truncated single-pass on slow response | If two-pass is at risk of timing out, automatically fall back to comparing the first 40k chars of each doc. | |
| Manual trimming modal | If documents exceed 80k characters, ask user to paste only relevant sections rather than running two-pass. | |

**User's choice:** `maxDuration = 60` with concise Pass 1 prompts and graceful retry.

---

## Negotiation Guide & Actionable Categorization

### Question 1: Negotiation Terms Structure & Schema
| Option | Description | Selected |
|--------|-------------|----------|
| Structured cards with tactical rationale & suggested fallback | Each item provides the target clause reference, plain-English reason, and specific counter-proposal wording or talking point. | ✓ |
| Compact formatted bullet strings | Strings formatted with section tags (e.g. "[Payment Terms] Propose 14-day grace period instead of immediate penalty"). | |
| High-level strategic summary | Single advisory narrative per category without individual clause-level bullet cards. | |

**User's choice:** Structured cards with tactical rationale & suggested fallback.

### Question 2: Negotiation Categories Visual Layout
| Option | Description | Selected |
|--------|-------------|----------|
| 3-Column responsive card grid | Three distinct color-coded buckets side-by-side on desktop (Push Back in rose/crimson, Accept in emerald, Flag for Lawyer in amber/gold) stacking on mobile. | ✓ |
| Tabbed switcher | Tabs for "Push Back On [N]", "Accept As-Is [N]", and "Flag for Lawyer [N]" to save vertical screen space. | |
| Stacked sequential sections | Full-width vertical blocks stacked in order of priority: Push Back first, then Flag for Lawyer, then Accept. | |

**User's choice:** 3-Column responsive card grid.

### Question 3: Interactive Features for Negotiation Items
| Option | Description | Selected |
|--------|-------------|----------|
| Interactive check-off + individual "Copy Talking Point" button | Allows checking off items during negotiations and copying counter-proposal wording directly to clipboard. | ✓ |
| Global "Copy Negotiation Cheat-Sheet" button only | Single button at top of guide copying all 3 lists formatted as markdown text. | |
| Read-only presentation | Display cards without interactive checkboxes or individual copy buttons. | |

**User's choice:** Interactive check-off + individual "Copy Talking Point" button.

### Question 4: Overall Favorability Verdict Card Design
| Option | Description | Selected |
|--------|-------------|----------|
| Verdict Hero Card with stats & recommendation | Prominent top card with favorability pill (Doc A, Doc B, or Neutral), executive rationale, count pills (clauses favoring A vs B, critical issues count), and strategic bottom line. | ✓ |
| Comparative score meter (Doc A vs Doc B percentage bar) | Visual tug-of-war meter indicating percentage balance between documents. | |
| Minimal status banner | Compact single-line verdict with summary text. | |

**User's choice:** Verdict Hero Card with stats & recommendation.

---

## the agent's Discretion

- Exact category Lucide icons (Payment, Liability, Termination, IP, etc.).
- Animated progress step durations and transition timings for single-pass and two-pass loaders.
- Specific contract text snippets chosen for the 2–3 Quick-Start sample comparison presets.

## Deferred Ideas

None — discussion remained strictly within Phase 4 boundaries.

