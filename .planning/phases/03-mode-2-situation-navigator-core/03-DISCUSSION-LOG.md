# Phase 3: Mode 2 — Situation Navigator Core - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-22  
**Phase:** 3-Mode 2 — Situation Navigator Core  
**Areas discussed:** Intake UX & dispute starter presets, Schema alignment & urgency tiering, Dossier layout & deadline warnings, Category confirmation & override UX  

---

## Intake UX & dispute starter presets

### Question 1: Presentation of dispute starter presets
| Option | Description | Selected |
|--------|-------------|----------|
| Quick-start preset cards | Clickable dispute cards (Security deposit withheld, Termination without notice, Undelivered consumer goods, Unpaid invoice) pre-filling textarea for instant evaluation | ✓ |
| Minimalist intake | Clean textarea only with dynamic placeholder examples, no clickable preset cards | |
| Dropdown scenario loader | Compact select menu above textarea with pre-loaded dispute templates | |

**User's choice:** Quick-start preset cards  
**Notes:** Provides fast onboarding and sets expectations on dispute context.

### Question 2: Word count validation (< 20 words)
| Option | Description | Selected |
|--------|-------------|----------|
| Inline warning banner + disable submit | Live word counter with contextual prompt suggestions, preventing wasted API calls | ✓ |
| Soft confirmation dialog on submit | Allow submit, show warning dialog asking for more context if <20 words | |
| Real-time inline feedback badge | Color-shifting badge without blocking submit | |

**User's choice:** Inline warning banner + disable submit  
**Notes:** Prevents low-quality responses and unnecessary LLM spend on empty inputs.

### Question 3: Route architecture
| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated route /analyze/situation | Hosts intake form and transforms to dossier on completion (matches Mode 1 /analyze/document) | ✓ |
| Unified /analyze hub with tabs | Single route /analyze with tabs | |
| Homepage modal overlay | Dispute intake in modal overlay | |

**User's choice:** Dedicated route /analyze/situation  
**Notes:** Maintains consistent route hierarchy with `/analyze/document`.

### Question 4: Draft persistence
| Option | Description | Selected |
|--------|-------------|----------|
| Draft auto-save to sessionStorage | Saves typed dispute text locally so accidental page refresh doesn't wipe user input | ✓ |
| Pure ephemeral memory only | Zero browser storage, refreshing wipes input back to empty state | |
| You decide | Agent discretion | |

**User's choice:** Draft auto-save to sessionStorage  
**Notes:** Avoids frustrating user loss of multi-paragraph typed narratives.

---

## Schema alignment & urgency tiering

### Question 1: RoadmapUrgencyEnum structure
| Option | Description | Selected |
|--------|-------------|----------|
| Update to 4-tier enum | `immediate`, `within-7-days`, `within-30-days`, `when-ready` (matches SIT-05 & PRD) | ✓ |
| Keep 3-tier enum | `immediate`, `soon`, `informational` | |
| 5-tier granular timeline | `today`, `within-7-days`, `within-30-days`, `within-90-days`, `when-ready` | |

**User's choice:** Update to 4-tier enum  
**Notes:** Strictly satisfies SIT-05 and PRD requirements.

### Question 2: documentsToGather structure
| Option | Description | Selected |
|--------|-------------|----------|
| Structured object { document, why } | Matches PRD; renders evidence name with dedicated explanation for why it matters | ✓ |
| Enhanced object with priority | Adds priority badge field | |
| Flat string array | Simple string array | |

**User's choice:** Structured object { document, why }  
**Notes:** Helps user understand the legal/evidentiary necessity of each document.

### Question 3: Estimated resolution timeline in schema
| Option | Description | Selected |
|--------|-------------|----------|
| Add estimatedTimeline: z.string() | Plain-English estimate fulfilling SIT-06 & PRD | ✓ |
| Structured timeline object | Separate duration from common resolution path | |
| Per-step durations only | Duration on steps only | |

**User's choice:** Add estimatedTimeline: z.string()  
**Notes:** Captures overall macro timeline expectation for dispute resolution.

### Question 4: whenToCallLawyer field format
| Option | Description | Selected |
|--------|-------------|----------|
| Array of specific trigger conditions z.array(z.string()) | Renders bulleted escalation cards | ✓ |
| Single narrative paragraph z.string() | Plain guidance block | |
| Two-part object | Narrative overview plus bullet triggers | |

**User's choice:** Array of specific trigger conditions z.array(z.string())  
**Notes:** Concrete bulleted escalation points are easier to scan.

---

## Dossier layout & deadline warnings

### Question 1: Sticky navigation sections
| Option | Description | Selected |
|--------|-------------|----------|
| 5-section sticky anchor nav | `Summary`, `Your Rights [N]`, `Roadmap [N]`, `Evidence [N]`, `Counsel Triggers [N]` with scroll-spy | ✓ |
| 3 consolidated sections | `Overview & Rights`, `Action Roadmap`, `Legal Guidance` | |
| Floating table-of-contents rail | Side navigation rail | |

**User's choice:** 5-section sticky anchor nav  
**Notes:** Parallels Mode 1 dossier UX.

### Question 2: Time-sensitive deadline warnings (SIT-07)
| Option | Description | Selected |
|--------|-------------|----------|
| Top-level critical warning banner | Above all sections with amber/crimson border, clock icon, and highlighted deadline notice cards | ✓ |
| Embedded inside Summary Card | Alert callout box within Summary card | |
| Roadmap "Urgent Deadlines" section | First stage of Procedural Roadmap | |

**User's choice:** Top-level critical warning banner  
**Notes:** Maximum visibility for urgent statute of limitation / legal notice deadlines.

### Question 3: "Your Rights" statutory accordion cards (SIT-04)
| Option | Description | Selected |
|--------|-------------|----------|
| Radix Accordion with statute badge | Shield icon, right title, statute citation in `JetBrains Mono` badge on header; expandable body; first expanded | ✓ |
| All expanded by default | Full-card list without collapse | |
| Split view | List on left, viewer on right | |

**User's choice:** Radix Accordion with statute badge  
**Notes:** Balances clean initial presentation with deep statutory detail.

### Question 4: Interactivity on Roadmap & Evidence (SIT-05, SIT-06)
| Option | Description | Selected |
|--------|-------------|----------|
| Interactive check-off on both Roadmap & Evidence | Ephemeral completion state with counter, emerald "Doable Solo" vs amber "Counsel Recommended" badges | ✓ |
| Interactive Evidence only | Checkboxes on documents only | |
| Static informational display | Read-only cards | |

**User's choice:** Interactive check-off on both Roadmap & Evidence  
**Notes:** Empowers citizens to actively work through tasks and track progress.

---

## Category confirmation & override UX

### Question 1: Dispute category intake selection
| Option | Description | Selected |
|--------|-------------|----------|
| Optional pre-filter chips + AI auto-detect | User can optionally select category pill or leave as auto-detect | ✓ |
| Pure AI auto-detect | No pills on intake; auto-classified by Claude | |
| Mandatory intake selector | Required selection before submitting | |

**User's choice:** Optional pre-filter chips + AI auto-detect  
**Notes:** Offers user control while preserving frictionless freeform entry.

### Question 2: Category confirmation badge on report (SIT-03)
| Option | Description | Selected |
|--------|-------------|----------|
| Category badge with "Change" dropdown | Displays detected category with edit trigger to re-run with explicit domain hint | ✓ |
| Static confirmation badge | Verified badge without in-place re-run | |
| "Refine Situation" drawer | Side drawer to tweak and re-analyze | |

**User's choice:** Category badge with "Change" dropdown  
**Notes:** Provides effortless correction if Claude miscategorizes edge cases.

### Question 3: Animated loader progress stages
| Option | Description | Selected |
|--------|-------------|----------|
| 3-stage situation progress card | "Classifying dispute domain..." → "Evaluating statutory protections..." → "Mapping urgency roadmap, evidence & deadlines..." | ✓ |
| Simplified 2-stage loader | Narrative analysis → Rights & roadmap | |
| You decide | Builder discretion | |

**User's choice:** 3-stage situation progress card  
**Notes:** Matches Mode 1 loader quality and provides reassuring feedback during LLM generation.

### Question 4: Non-UPL epistemic guardrails
| Option | Description | Selected |
|--------|-------------|----------|
| Dual guardrail | Strict system prompt negative rules + inline educational advisory badge on report | ✓ |
| Prompt-only guardrail | Rely strictly on system prompt | |
| You decide | Builder discretion | |

**User's choice:** Dual guardrail  
**Notes:** Essential compliance safeguard against Unauthorized Practice of Law under Advocates Act 1961.

---

## the agent's Discretion

- Category Lucide icons mapping for all categories in `DisputeCategoryEnum`.
- Exact animation timing and progress milestone durations for the 3-stage loader.

## Deferred Ideas

- Voice/Audio dispute intake (LANG-02 in REQUIREMENTS.md for v2).
- Formal legal notice generator or email drafting assistant (REDL-02 for v2).

