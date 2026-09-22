# Phase 4: Mode 3 — Document Comparison Engine
## RESEARCH.md

**Researched:** 2026-09-22  
**Phase:** 04 — Mode 3 — Document Comparison Engine  
**Requirements:** COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07  
**Confidence:** HIGH (all claims drawn from direct code inspection + PRD reading)

---

## User Constraints

From `04-CONTEXT.md` decisions (locked/costly):

- **D-10 (costly):** Route `/api/analyze/compare` auto-detects >80k chars and executes two-pass extraction — this defines the backend execution model.
- **D-11 (costly):** Pass 1 extraction targets 7 specific legal domains (Payment, Liability, Termination, IP, Warranties, Dispute Resolution, Restrictive Covenants).
- **D-13 (costly):** `negotiationGuide` upgraded from `z.array(z.string())` to structured 3-key object with typed cards — defines the Zod output contract and client props.

All other decisions (D-01–D-09, D-12, D-14–D-16) are **reversible** in implementation detail.

---

## Phase Requirements

| ID | Requirement |
|----|-------------|
| COMP-01 | Dual side-by-side upload zones with customizable labels and parallel upload handling |
| COMP-02 | `/api/analyze/compare` generates typed, schema-validated `ComparisonAnalysis` via `generateObject` |
| COMP-03 | Overall Favorability Verdict card (docA / docB / neutral) with plain-English rationale |
| COMP-04 | Side-by-side differences table: clause variances by category, text, favors indicator, risk rating |
| COMP-05 | Inconsistencies section with severity badges: Critical, Notable, Minor |
| COMP-06 | Negotiation Guide: three actionable lists (Push Back On / Accept As-Is / Flag for Lawyer) |
| COMP-07 | Large doc two-pass extraction pipeline when combined text > 80,000 characters |

---

## Summary

Phase 4 builds the document comparison engine on top of the established ingestion pipeline (Phase 1) and analysis architecture (Phases 2–3). Key findings:

1. **Schema upgrade is straightforward** — `comparison.ts` currently has a flat `negotiationGuide: z.array(z.string())`. D-13 upgrades this to three structured card arrays. The PRD (prd.html §06 F4 lines 947–950) used flat string arrays (`clausesToNegotiate`, `clausesToAccept`, `flagForLawyer`); D-13 supersedes this with richer typed cards.

2. **DocumentDropzone is directly reusable** — The component is fully self-contained with its own upload state, and the `onUploadSuccess`/`onFallbackToManual` prop interface means dual-zone can be achieved by rendering two independent instances.

3. **Two-pass via `Promise.all`** — Node.js runtime with `maxDuration = 60` is established. The two-pass can be implemented cleanly: one `Promise.all` for Pass 1 extractions, then one `generateObject` call for Pass 2. The 60s wall time is tight but achievable with the concise Pass 1 schema.

4. **Page architecture follows the `situation/page.tsx` pattern** exactly: `idle → analyzing → dossier → error` state machine, scroll-spy IntersectionObserver, StickyNav with counts.

5. **New component directory** `components/comparison/` contains all net-new presentation components.

6. **Test patterns** follow vitest + `renderToString` for component tests and mocked `generateObject` for route tests.

---

## Architectural Responsibility Map

```
app/page.tsx                     — Mode 3 card (new Card block linking to /analyze/compare)
app/analyze/compare/page.tsx     — Page orchestrator: idle/analyzing/dossier/error states
app/api/analyze/compare/route.ts — POST handler: two-pass detection, generateObject, ComparisonSchema

lib/schemas/comparison.ts        — UPGRADED ComparisonSchema (D-13) + Pass1ClauseSchema
lib/prompts/comparison.ts        — NEW: COMPARISON_SYSTEM_PROMPT + buildComparisonPrompt()
                                          + PASS1_SYSTEM_PROMPT + buildPass1UserPrompt()

components/comparison/
  ComparisonProgress.tsx         — Two-phase-aware progress loader (amber badge for large docs)
  ComparisonErrorCard.tsx        — Comparison-specific error card (dual-doc context)
  ComparisonStickyNav.tsx        — 4-item nav (Verdict / Inconsistencies / Differences / Negotiation)
  FavorabilityVerdictCard.tsx    — COMP-03: Hero verdict card
  InconsistenciesSection.tsx     — COMP-05: Inconsistency cards with severity badges
  ClauseComparisonTable.tsx      — COMP-04: Side-by-side table with filters
  NegotiationGuide.tsx           — COMP-06: 3-column card grid with check-off + copy

components/comparison/intake/
  DualDocumentIntake.tsx         — Orchestrates two DocumentZone instances + submit button
  DocumentZone.tsx               — Single upload zone (wraps DocumentDropzone + ManualPasteArea + label)
  ComparisonPresetCards.tsx      — 2-3 quick-start preset cards

Reused verbatim:
  components/upload/DocumentDropzone.tsx
  components/upload/FilePreviewCard.tsx
  components/upload/ManualPasteArea.tsx
  components/shared/Header.tsx
  components/shared/LegalDisclaimer.tsx
```

---

## Standard Stack

[VERIFIED: direct code inspection]

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router, `'use client'` directive |
| Runtime | `export const runtime = 'nodejs'`; `export const maxDuration = 60` |
| AI | Vercel AI SDK `generateObject`, `claude-3-5-sonnet-20241022` via `@ai-sdk/anthropic` |
| Schema | Zod — same `z.object` patterns as `document.ts` and `situation.ts` |
| UI | Tailwind CSS + Radix UI/shadcn + custom `legal-*` color tokens |
| Typography | `font-serif` (DM Serif Display), `font-sans` (DM Sans), `font-mono` (JetBrains Mono) |
| Colors | Obsidian `#0B0F17`, Gold `#D4AF37`, risk colors: crimson `#EF4444`, amber `#F59E0B`, emerald `#10B981` |
| Testing | Vitest + `renderToString` (components), mocked `generateObject` (routes) |

---

## Package Legitimacy Audit

No new packages are required for Phase 4. All functionality is achieved with:

[VERIFIED: direct code inspection of existing imports across project files]

- `zod` — schema validation (existing)
- `ai` + `@ai-sdk/anthropic` — generateObject (existing)
- `next` — App Router (existing)
- `lucide-react` — icons (existing)
- `sonner` — toast notifications (existing)
- `tailwind-merge` / `clsx` via `cn()` utility (existing)
- `@radix-ui/*` via shadcn components (existing — `tabs`, `accordion`, `badge`, `button`, `checkbox`)

The `checkbox` UI component (at `components/ui/checkbox.tsx`) is already present and covers the negotiation guide's interactive check-off requirement (D-15).

---

## Architecture Patterns

### 1. Zod Schema Design

**Current state** (`lib/schemas/comparison.ts`):
```ts
// Flat string array — must be upgraded per D-13
negotiationGuide: z.array(z.string())
```

**PRD F4 schema** (prd.html lines 947–950) used three flat string arrays:
```ts
clausesToNegotiate: z.array(z.string()),
clausesToAccept:    z.array(z.string()),
flagForLawyer:      z.array(z.string()),
recommendation:     z.string()
```

**D-13 upgraded schema** (supersedes PRD — this is the source of truth):
```ts
const NegotiationCardSchema = z.object({
  clauseTitle: z.string().describe('Brief label for this negotiation point'),
  rationale: z.string().describe('Objective reason for this categorization'),
  suggestedAlternative: z.string().optional().describe('Optional counter-proposal wording'),
});

const NegotiationGuideSchema = z.object({
  pushBack: z.array(NegotiationCardSchema).describe('Terms that typically warrant counter-proposal'),
  acceptAsIs: z.array(NegotiationCardSchema).describe('Terms that are standard and reasonable'),
  flagForLawyer: z.array(NegotiationCardSchema).describe('Terms requiring licensed legal review'),
  recommendation: z.string().describe('Overall strategic summary without prescriptive advice'),
});
```

**Full upgraded ComparisonSchema** satisfying all 5 success criteria:
```ts
export const ClauseDiffSchema = z.object({
  category: z.string(),          // "Payment Terms", "Termination"
  textDocA: z.string(),          // Verbatim excerpt from Document A
  textDocB: z.string(),          // Verbatim excerpt from Document B
  favors: FavorabilityEnum,      // docA | docB | neutral
  riskRating: RiskLevelEnum,     // high | caution | standard
  notes: z.string(),             // Plain-English impact callout
});

export const InconsistencyItemSchema = z.object({
  clauseTitle: z.string(),
  description: z.string(),
  severity: InconsistencySeverityEnum, // critical | notable | minor
});

// Metric chips for D-16 (COMP-03)
export const FavorabilityMetricsSchema = z.object({
  clausesFavoringDocA: z.number().int().nonnegative(),
  clausesFavoringDocB: z.number().int().nonnegative(),
  criticalInconsistencies: z.number().int().nonnegative(),
});

export const ComparisonSchema = z.object({
  // COMP-03: Overall verdict
  favorabilityVerdict: FavorabilityEnum,
  verdictRationale: z.string(),
  favorabilityMetrics: FavorabilityMetricsSchema,

  // COMP-04: Side-by-side clause table
  differences: z.array(ClauseDiffSchema),

  // COMP-05: Inconsistencies
  inconsistencies: z.array(InconsistencyItemSchema),

  // COMP-06: Negotiation guide (D-13 upgrade)
  negotiationGuide: NegotiationGuideSchema,
});
export type ComparisonAnalysis = z.infer<typeof ComparisonSchema>;
```

**Key reconciliation — PRD vs D-13:**
- PRD used `overallFavorability` + `overallSummary` field names → reconcile to `favorabilityVerdict` + `verdictRationale` (existing schema names, kept for backward compat with existing tests in `schemas.test.ts` lines 371–403)
- PRD used `riskLevel: z.enum(['high', 'medium', 'low'])` but existing codebase uses `RiskLevelEnum = z.enum(['high', 'caution', 'standard'])` → **use `RiskLevelEnum` from `common.ts`** (existing tests validate this)
- PRD `analysis` field → renamed `notes` (existing `ClauseDiffSchema` uses `notes`)
- PRD `docAVersion`/`docBVersion` → renamed `textDocA`/`textDocB` (existing schema)
- D-13 upgrades flat `negotiationGuide` string array → structured object (**breaking change** requiring test updates in `schemas.test.ts`)

**Pass 1 extraction schema** (intermediate, not exported from schemas/index):
```ts
const ExtractedClauseSchema = z.object({
  category: z.string(),
  excerpt: z.string().describe('Key clause text, max ~200 chars'),
});
const Pass1ExtractionSchema = z.object({
  clauses: z.array(ExtractedClauseSchema),
});
```

### 2. Two-Pass Large Document Strategy

[VERIFIED: code inspection of route patterns + CONTEXT.md D-09 through D-12]

**Threshold detection:**
```ts
const combined = (docA + docB).length; // after cleanText()
const isLargeDoc = combined > 80_000;
```

**Pass 1 — concurrent extraction:**
```ts
const [extractedA, extractedB] = await Promise.all([
  generateObject({ model, schema: Pass1ExtractionSchema, prompt: buildPass1UserPrompt(docA) }),
  generateObject({ model, schema: Pass1ExtractionSchema, prompt: buildPass1UserPrompt(docB) }),
]);
```

**Pass 2 — comparative synthesis:**
```ts
const result = await generateObject({
  model,
  schema: ComparisonSchema,
  system: COMPARISON_SYSTEM_PROMPT,
  prompt: buildComparisonPrompt(
    JSON.stringify(extractedA.object.clauses),
    JSON.stringify(extractedB.object.clauses),
    labelA, labelB
  ),
});
```

**Timeout considerations:**
- `maxDuration = 60` on Vercel Hobby/Pro — this is a hard wall-clock limit.
- Two-pass means 3 total `generateObject` calls (2 + 1). Each call typically takes 8–20s for concise schemas.
- Risk: 3 × 20s = 60s ceiling hit. Mitigation: Pass 1 schema is minimal (no nested objects, short excerpts), Pass 2 receives pre-extracted text instead of raw documents. Concurrency of Pass 1 via `Promise.all` means wall time = max(passA, passB) not passA + passB.
- Vercel Hobby plan caps at 10s — project must be on **Pro plan** for `maxDuration = 60`. [ASSUMED — not verified in deployment config]

**UI progress feedback (D-09):**
The compare page orchestrator tracks a `twoPassStage: 'idle' | 'extracting' | 'synthesizing' | 'done'` state alongside `AnalysisState`, passed as props to `ComparisonProgress` which renders stage-appropriate messages and the amber "large contract" badge.

### 3. Dual Upload UX Patterns

**State machine per zone** (independent):
```
empty → uploading → uploaded (text available)
                 ↘ error → empty (retry)
```

**Page-level state:**
```
idle (both zones show intake)
  → analyzing (at least one zone uploading, or compare API running)
  → dossier (result rendered)
  → error (compare API failed)
```

**DocumentDropzone reuse assessment:**

`DocumentDropzone` (275 lines, fully self-contained) is **directly reusable without modification**. The interface is:
```ts
interface DocumentDropzoneProps {
  onUploadSuccess: (data: UploadData, compressionInfo?: DownsampleResult | null) => void;
  onFallbackToManual: (reason: string) => void;
  disabled?: boolean;
}
```
The component manages its own `isProcessing` and `isDragging` state internally. Rendering two instances with different `onUploadSuccess` callbacks naturally gives independent zone behavior.

**DocumentZone wrapper** (new) encapsulates one zone's full UX:
```ts
interface DocumentZoneProps {
  label: string;                   // "Original Document (Doc A)"
  zoneId: 'docA' | 'docB';
  uploadedDoc: UploadData | null;
  manualText: string;
  onUploadSuccess: (data: UploadData) => void;
  onTextChange: (text: string) => void;
  onRemove: () => void;
  onFallbackToManual: (reason: string) => void;
  disabled?: boolean;
}
```
This wraps:
- Editable label input (per D-01 quick preset chips)
- Tabs (`upload` | `paste`) using existing `Tabs` component
- `DocumentDropzone` in upload tab
- `ManualPasteArea` in paste tab
- `FilePreviewCard` when uploaded
- Word count / character count badges
- Per-zone error state display

**ManualPasteArea** is **directly reusable** — all props are generic.

**`DualDocumentIntake.tsx`** (new orchestrator) renders two `DocumentZone` components in a CSS grid:
```
lg:grid-cols-2 gap-4 (desktop: side-by-side)
grid-cols-1 (mobile: stacked)
```

**"Compare Documents" submit button** unlocks when:
- Zone A has content (either `uploadedDoc.text` OR `manualText.trim().length >= 50`)
- Zone B has content (same condition)
- Neither zone is currently uploading

**Quick-Start presets (D-03):** Follow the `QuickStartCards.tsx` pattern from Phase 3 — a horizontal row of 2–3 preset cards that populate both zones simultaneously with sample contract pair text.

### 4. Side-by-Side Comparison Table Component

[VERIFIED: CONTEXT.md D-05, D-06, D-07]

**Component:** `components/comparison/ClauseComparisonTable.tsx`

**Layout decision:**
- **Desktop:** `lg:grid-cols-2` grid — true two-column layout per D-05. Each row is a `div` pair, not an HTML `<table>`, because the content is variable-height clause text that doesn't benefit from strict column alignment.
- **Mobile:** Tab switcher per clause row — a `Tabs` component above each clause row with "Doc A" / "Doc B" toggle, avoiding horizontal scroll.
- **Alternative rejected:** Card-based diff view (e.g., showing only the differences highlighted inline) — the CONTEXT.md explicitly mandates "verbatim excerpts" in `JetBrains Mono` for both documents, so the two-column verbatim approach is correct.

**Clause row structure:**
```
┌── Category header (badge: DollarSign icon + category name) ────────────┐
│  [DocA label]                    │  [DocB label]                        │
│  <JetBrains Mono verbatim text>  │  <JetBrains Mono verbatim text>     │
├──────────────────────────────────┴──────────────────────────────────────┤
│  Favors: [docA badge]  Risk: [🔴 High]  Why this matters: [notes text] │
└─────────────────────────────────────────────────────────────────────────┘
```

**Risk color mapping** (from existing `tailwind.config.ts`):
- `high` → `border-red-500/80`, `bg-red-950/20`, `text-red-400`
- `caution` → `border-amber-500/60`, `bg-amber-950/20`, `text-amber-400`
- `standard` → `border-emerald-500/50`, `bg-emerald-950/20`, `text-emerald-400`

**Favorability badge colors:**
- `docA` → `text-[#D4AF37]` (legal gold)
- `docB` → `text-blue-400`
- `neutral` → `text-slate-400`

**Filter chips** (D-07):
```
All [N] | Favors Doc A [N] | Favors Doc B [N] | 🔴 High Risk [N]
```
Implemented as client-side filter on the `differences` array — no server round-trip needed. Default: `All` with high-risk sorted first.

**JetBrains Mono usage:** `className="font-mono text-sm"` — this maps to `var(--font-jetbrains-mono)` per `tailwind.config.ts`. [VERIFIED: tailwind.config.ts line 78]

### 5. Existing Component Reuse

[VERIFIED: direct code inspection]

| Component | Reuse Strategy |
|-----------|---------------|
| `DocumentDropzone.tsx` | **Reuse verbatim** — wrap in `DocumentZone.tsx` |
| `FilePreviewCard.tsx` | **Reuse verbatim** — same props, render inside `DocumentZone` |
| `ManualPasteArea.tsx` | **Reuse verbatim** — same props |
| `Header.tsx` | **Reuse verbatim** |
| `LegalDisclaimer.tsx` | **Reuse verbatim** |
| `AnalysisErrorCard.tsx` | **Adapt** — `onAdjustInput` label ("Adjust Input Text") needs to become "Adjust Both Documents"; create `ComparisonErrorCard.tsx` as a thin wrapper with different button labels |
| `AnalysisProgress.tsx` | **Do NOT reuse directly** — it's single-doc-specific. Create `ComparisonProgress.tsx` with two-phase stage awareness and the amber "large document" badge |
| `StickyNav.tsx` | **Adapt** — `StickyNav` has hardcoded decoder section IDs (Summary, Risks, Checklist, Lawyer Prep) and counts interface. Create `ComparisonStickyNav.tsx` with: Verdict / Inconsistencies [N] / Differences [N] / Negotiation [N] and "Compare Another Pair" reset label |
| `components/ui/*` | **Reuse verbatim** — `Tabs`, `Badge`, `Button`, `Checkbox`, `Accordion` |

**Net-new components to build:**

In `components/comparison/intake/`:
- `DocumentZone.tsx` — single zone wrapper
- `DualDocumentIntake.tsx` — two-zone orchestrator
- `ComparisonPresetCards.tsx` — quick-start presets

In `components/comparison/`:
- `ComparisonProgress.tsx` — two-phase progress loader
- `ComparisonErrorCard.tsx` — comparison-specific error card
- `ComparisonStickyNav.tsx` — 4-item sticky nav
- `FavorabilityVerdictCard.tsx` — COMP-03 hero card
- `InconsistenciesSection.tsx` — COMP-05 with severity badges
- `ClauseComparisonTable.tsx` — COMP-04 table with filters
- `NegotiationGuide.tsx` — COMP-06 3-column grid

**Count: 3 intake + 7 presentation = 10 net-new components**

### 6. API Route Design

**File:** `app/api/analyze/compare/route.ts`

**Request body:**
```ts
{
  docA: string;      // Extracted text from zone A (or empty string if image)
  docB: string;      // Extracted text from zone B
  labelA: string;    // User-assigned label for Document A
  labelB: string;    // User-assigned label for Document B
  imageA?: string;   // Base64 for image-only doc A
  mimeTypeA?: string;
  imageB?: string;   // Base64 for image-only doc B
  mimeTypeB?: string;
}
```

**Mixed input handling:**
- Text + Text: standard path
- Image + Text: Call `generateObject` with multimodal messages for image doc, standard text for other
- Image + Image: Two multimodal `generateObject` calls
- In two-pass mode for images: Pass 1 uses multimodal messages; Pass 2 uses extracted text

**System prompt structure** (follows `DOCUMENT_SYSTEM_PROMPT` pattern):
```
You are Gavel's Document Comparison Engine...
NON-NEGOTIABLE LEGAL BOUNDARIES: [same UPL guardrails]
COMPARISON FRAMING:
- Evaluate from the perspective of the party receiving the document
- Use objective framing: "The revised term shifts liability to...", "Doc A provides broader..."
- NEVER state which document the user should sign
RISK CRITERIA: [same as decoder]
FAVORABILITY CRITERIA:
- "docA": Document A terms are more commercially protective for the reviewing party
- "docB": Document B terms are more commercially protective
- "neutral": Terms are substantially equivalent or bilateral
INCONSISTENCY DETECTION: Flag internal contradictions, material omissions vs standard...
NEGOTIATION GUIDE: Categorize purely based on commercial norms, not legal strategy
Security tags: <doc_a_to_compare> and <doc_b_to_compare> XML tags for untrusted input
```

**Route handler pseudocode:**
```ts
export const runtime = 'nodejs';
export const maxDuration = 60;

const TWO_PASS_THRESHOLD = 80_000;

export async function POST(req: NextRequest) {
  // 1. Validate API key
  // 2. Parse body, validate docA/docB or imageA/imageB presence
  // 3. Validate minimum text length (>= 30 chars each for text docs)
  // 4. Detect large document: (docA + docB).length > TWO_PASS_THRESHOLD
  // 5. Branch:
  //    if !isLargeDoc: single generateObject(ComparisonSchema)
  //    if isLargeDoc:
  //      a. Promise.all([extractClauses(docA), extractClauses(docB)])
  //      b. generateObject(ComparisonSchema, extracted clauses as input)
  // 6. Return { success: true, data: result.object, isLargeDoc }
}
```

**The frontend needs `isLargeDoc` in the response** to show the amber badge on the dossier header.

**Error codes to add:**
- `BOTH_DOCUMENTS_REQUIRED` — 400
- `DOCUMENT_TOO_SHORT` — 400 (either doc < 30 chars text)
- `ANALYSIS_FAILED` — 500 (same as existing pattern)
- `CONFIG_ERROR` — 500 (same)

### 7. Homepage Mode 3 Card Integration

[VERIFIED: `app/page.tsx` inspected — Mode 2 card is at lines 47–72]

**Placement:** Add a new card block adjacent to the Mode 2 Situation Navigator card. Given the tab metaphor of Mode 1 being the "primary" use case (the whole intake section), placing Mode 3 card adjacent to Mode 2 card is cleanest.

**Recommended layout:** Two discovery cards side-by-side (or stacked on mobile):
```
[Mode 2: Situation Navigator card]  [Mode 3: Compare Documents card]
```
Implemented as `sm:grid-cols-2 gap-4` grid replacing the current single Mode 2 card row.

**Mode 3 card copy:**
```
Mode 3 · Document Comparison        [tag pill]
Compare Two Agreements              [h3]
Upload two contract versions to     [p]
detect clause discrepancies,
favorability shifts, and
negotiation leverage.
                       [Compare Documents →]
```

**Icon choice (agent's discretion):** `ArrowLeftRight` from lucide-react represents document comparison clearly. `GitCompareArrows` is an alternative if available.

**Gold accent:** Use the same `bg-gradient-to-r from-[#111827] via-[#161f30] to-[#111827]` gradient with `border-[#D4AF37]/30` as Mode 2 card.

### 8. Error Handling & Edge Cases

[VERIFIED: AnalysisErrorCard.tsx, DocumentDropzone.tsx, route.ts patterns]

**Case A — Only one document uploaded, user attempts compare:**
- **Prevention at UI level:** "Compare Documents" button `disabled` until both zones have content. No API call made.
- **Server fallback:** Validate both `docA`/`docB` non-empty in route; return `BOTH_DOCUMENTS_REQUIRED` 400.

**Case B — Both documents are images:**
- Pass both as `imageA`/`imageB` in request body. Route detects image pair and calls `generateObject` with multimodal `messages` format for both.
- In large-doc mode with images: images cannot have character count measured client-side reliably. Strategy: **always use single-pass for image pairs** (images are already summarized by vision model, context not an issue).

**Case C — One text, one image:**
- Mixed input supported per D-02. Route handles: text doc uses `prompt` path; image doc uses multimodal `messages` path. Combined into single `generateObject` call using `messages` format with both text (as `type: 'text'`) and image (as `type: 'image'`).

**Case D — Two-pass produces empty clause lists:**
- Pass 1 may yield empty `clauses` arrays if documents are very short or non-contract content.
- Guard: if `extractedA.object.clauses.length === 0 || extractedB.object.clauses.length === 0`, fall back to single-pass with original text (if below context limit) or return error `EXTRACTION_FAILED`.

**Case E — Combined text exceeds Anthropic's context window:**
- Claude 3.5 Sonnet context window: 200,000 tokens ≈ ~600,000 characters. [ASSUMED]
- Two-pass strategy with 80k threshold keeps Pass 2 input well within limits (extracted clauses are ~1–3k chars total).
- Single-pass at ~80k chars: ~20,000 tokens — well within limits.
- True risk is **timeout**, not context overflow.

**`ComparisonErrorCard` customizations vs `AnalysisErrorCard`:**
- Replace "Your document was processed ephemerally" → "Both documents were processed ephemerally and cleared from volatile memory."
- Replace "Adjust Input Text" button → "Adjust Documents" (returns to dual-intake idle state).
- Replace "Retry Analysis" → "Retry Comparison" (re-submits both documents).

---

## Don't Hand-Roll

[ASSUMED unless noted otherwise]

- **Scroll-spy IntersectionObserver:** Copy exact implementation from `app/analyze/situation/page.tsx` lines 88–130. The `rootMargin: '-100px 0px -50% 0px'` tuning is already battle-tested.
- **Toast notifications:** Use `sonner` (already imported in `DocumentDropzone`).
- **Clipboard copy:** Use `navigator.clipboard.writeText()` for "Copy Talking Point" buttons — same pattern as `ManualPasteArea.tsx` line 36.
- **Tabs component:** Use existing `components/ui/tabs.tsx` (Radix-based) for zone tab switching and mobile clause switcher.
- **Checkbox for check-off:** Use existing `components/ui/checkbox.tsx` — already installed.
- **File size/word counting:** Reuse `countWords` and `countCharacters` from `lib/text-utils.ts`.
- **Character threshold detection:** Use `(docA + docB).length > 80_000` after extraction.

---

## Common Pitfalls

[ASSUMED from pattern analysis]

1. **Shared `isProcessing` state across zones:** If zone A is uploading and user drops a file on zone B, the state must remain independent. Each `DocumentDropzone` manages its own `isProcessing` internally — this is correct. But the parent page must not set a global `isAnalyzing` flag prematurely.

2. **Two-pass `maxDuration = 60` timeout:** Calling `generateObject` 3 times serially would likely exceed 60s. Using `Promise.all` for Pass 1 is mandatory. If Vercel invocation times out, the frontend receives a network error — handle this as `ANALYSIS_FAILED` with a user message suggesting retry.

3. **Schema breaking change:** Upgrading `negotiationGuide` from `z.array(z.string())` to a structured object is a **breaking change** to `schemas.test.ts` test at lines 391–396 which passes plain string arrays. The test must be updated alongside the schema.

4. **`RiskLevelEnum` vs PRD's 'medium':** PRD uses `z.enum(['high', 'medium', 'low'])` but the codebase uses `z.enum(['high', 'caution', 'standard'])`. Do NOT introduce a new risk enum. Use `RiskLevelEnum` from `common.ts`. The system prompt must map the model's understanding of "medium" risk to `caution`.

5. **Label injection in prompts:** User-supplied `labelA`/`labelB` strings go into the system prompt. Sanitize them (strip `<>` characters, max 50 chars) before prompt inclusion to prevent prompt injection via malicious label names.

6. **Mobile horizontal scroll:** The two-column comparison table must NOT allow horizontal overflow. The mobile stacked tab approach (D-05) is the correct solution — do not render both columns simultaneously on small screens.

7. **`isLargeDoc` flag in response:** The frontend needs to know if two-pass was used to show the amber badge on the dossier. Add `isLargeDoc: boolean` to the API response envelope alongside `success` and `data`.

8. **`FilePreviewCard` in dual-zone:** `FilePreviewCard` expects `compressionInfo?: DownsampleResult | null`. Zone state should track this per-zone.

9. **Consistent section IDs for scroll-spy:** Define section IDs as constants: `'verdict-section'`, `'inconsistencies-section'`, `'differences-section'`, `'negotiation-section'` — used in both the sticky nav and the dossier section elements.

---

## Code Examples

### Upgraded `comparison.ts` — Key Addition

```ts
// NEW: Structured negotiation card (D-13)
export const NegotiationCardSchema = z.object({
  clauseTitle: z.string().describe('Brief label identifying this negotiation point'),
  rationale: z.string().describe('Objective explanation without prescriptive legal advice'),
  suggestedAlternative: z.string().optional().describe(
    'Optional counter-proposal wording phrased as a party preference, not a legal directive'
  ),
});

export const NegotiationGuideSchema = z.object({
  pushBack: z.array(NegotiationCardSchema).describe(
    'Terms where counter-proposal is commercially typical'
  ),
  acceptAsIs: z.array(NegotiationCardSchema).describe(
    'Terms that reflect standard market practice'
  ),
  flagForLawyer: z.array(NegotiationCardSchema).describe(
    'Terms that typically require qualified legal review before signing'
  ),
  recommendation: z.string().describe(
    'Overall strategic plain-English summary without prescriptive directives'
  ),
});

// NEW: Favorability metrics for D-16 metric chips
export const FavorabilityMetricsSchema = z.object({
  clausesFavoringDocA: z.number().int().nonnegative(),
  clausesFavoringDocB: z.number().int().nonnegative(),
  criticalInconsistencies: z.number().int().nonnegative(),
});

// MODIFIED: ComparisonSchema (replaces existing)
export const ComparisonSchema = z.object({
  favorabilityVerdict: FavorabilityEnum,
  verdictRationale: z.string(),
  favorabilityMetrics: FavorabilityMetricsSchema, // NEW
  differences: z.array(ClauseDiffSchema),
  inconsistencies: z.array(InconsistencyItemSchema),
  negotiationGuide: NegotiationGuideSchema,       // UPGRADED from z.array(z.string())
});
```

### Two-Pass Route Handler Skeleton

```ts
export const runtime = 'nodejs';
export const maxDuration = 60;

const TWO_PASS_THRESHOLD = 80_000;

export async function POST(req: NextRequest) {
  // ... validation ...

  const combinedLength = (docA + docB).length;
  const isLargeDoc = combinedLength > TWO_PASS_THRESHOLD;

  let result;

  if (isLargeDoc) {
    // Pass 1: Concurrent clause extraction
    const [extractedA, extractedB] = await Promise.all([
      generateObject({ model, schema: Pass1ExtractionSchema, prompt: buildPass1UserPrompt(docA, labelA) }),
      generateObject({ model, schema: Pass1ExtractionSchema, prompt: buildPass1UserPrompt(docB, labelB) }),
    ]);

    // Pass 2: Comparative synthesis on extracted clauses
    result = await generateObject({
      model,
      schema: ComparisonSchema,
      system: COMPARISON_SYSTEM_PROMPT,
      prompt: buildPass2ComparisonPrompt(
        extractedA.object.clauses, labelA,
        extractedB.object.clauses, labelB
      ),
    });
  } else {
    result = await generateObject({
      model,
      schema: ComparisonSchema,
      system: COMPARISON_SYSTEM_PROMPT,
      prompt: buildComparisonUserPrompt(docA, labelA, docB, labelB),
    });
  }

  return NextResponse.json({ success: true, data: result.object, isLargeDoc });
}
```

### `DocumentZone` State Architecture

```ts
// In DualDocumentIntake parent:
const [zoneA, setZoneA] = useState<{ uploadedDoc: UploadData | null; manualText: string; fallbackNotice: string | null }>({
  uploadedDoc: null, manualText: '', fallbackNotice: null
});
const [zoneB, setZoneB] = useState<{ uploadedDoc: UploadData | null; manualText: string; fallbackNotice: string | null }>({
  uploadedDoc: null, manualText: '', fallbackNotice: null
});
const [labelA, setLabelA] = useState('Original Document (Doc A)');
const [labelB, setLabelB] = useState('Revised Version (Doc B)');

const getZoneContent = (zone: typeof zoneA) => {
  if (zone.uploadedDoc) return { text: zone.uploadedDoc.text, isImage: zone.uploadedDoc.isImage };
  if (zone.manualText.trim().length >= 50) return { text: zone.manualText, isImage: false };
  return null;
};

const contentA = getZoneContent(zoneA);
const contentB = getZoneContent(zoneB);
const canCompare = contentA !== null && contentB !== null;
```

### Scroll-Spy Section IDs (Comparison Page)

```ts
// Inline in compare/page.tsx
const COMPARISON_SECTION_IDS = [
  'verdict-section',
  'inconsistencies-section',
  'differences-section',
  'negotiation-section',
] as const;
```

---

## State of the Art

[ASSUMED — from training knowledge on comparison UI patterns]

- **Two-column verbatim text approach** is the industry standard for contract redline comparison (Google Docs "Suggesting mode", DocuSign, ContractPodAi). The card-based diff is used for code diffing (GitHub) but not legal text — verbatim is preferred for legal because attorneys need to see exact wording.
- **Progressive disclosure for mobile** (tab switcher per clause, not horizontal scroll) is the established pattern for data-dense responsive tables.
- **Anthropic Claude 3.5 Sonnet's 200k token context** means single-pass comparison of most real-world contracts (typical: 5,000–30,000 chars each, combined ~10,000–60,000 chars) will succeed without two-pass. The 80k threshold is a conservative buffer designed for large commercial agreements.
- **`generateObject` with Zod schemas** is the correct Vercel AI SDK approach for deterministic structured output — matches Phases 2 and 3 patterns exactly.

---

## Assumptions Log

| ID | Assumption | Risk if Wrong |
|----|-----------|---------------|
| A-01 | Vercel Pro plan active for `maxDuration = 60` | MEDIUM — Hobby plan would cap at 10s, blocking two-pass entirely |
| A-02 | Claude 3.5 Sonnet context window is 200k tokens | LOW — Even if smaller, the two-pass strategy handles it |
| A-03 | `lucide-react` version supports `ArrowLeftRight` icon for Mode 3 card | LOW — Common icon, very likely available |
| A-04 | Two-pass total wall time stays under 60s with concurrent Pass 1 | MEDIUM — May need to reduce Pass 1 schema size or add retry fallback |
| A-05 | `components/ui/checkbox.tsx` supports check-off state for negotiation items | LOW — Checkbox is installed per file listing |

---

## Open Questions

1. **Vercel plan confirmation:** Is the project deployed on Vercel Pro (required for 60s timeout)? If Hobby plan, `maxDuration = 60` silently defaults to 10s.

2. **Pass 1 timeout safety:** If `Promise.all` of two extractions + one synthesis approaches 55s, should the route return a partial result or a full error? Recommend: return `ANALYSIS_FAILED` with a user-friendly message suggesting use with smaller documents.

3. **Image pair two-pass:** For two image documents, character count is unknown before extraction. Recommendation: always use single-pass for image pairs (vision model handles image comprehension natively; two-pass would require text extraction as intermediate step).

4. **`ClauseDiffSchema` field naming:** Existing schema uses `textDocA`/`textDocB` and `notes` — PRD uses `docAVersion`/`docBVersion` and `analysis`. Decision: keep existing field names to avoid breaking `schemas.test.ts`.

5. **`FavorabilityMetricsSchema` reliability:** Can the model reliably count `clausesFavoringDocA` during synthesis? Alternative: compute client-side as `differences.filter(d => d.favors === 'docA').length` for accuracy. Recommend computing both schema field (for Pass 1 consistency) and deriving client-side as a fallback.

---

## Environment Availability

[VERIFIED: direct code inspection]

- `ANTHROPIC_API_KEY` — required env var, checked in all existing routes
- `anthropic('claude-3-5-sonnet-20241022')` — model string used in existing routes
- `generateObject` from `ai` — verified imported and mocked in test suite
- `runtime = 'nodejs'` — set in all analysis routes
- `vitest` — test runner configured in `vitest.config.ts` with `@` alias to project root
- `tailwindcss-animate` — `animate-shake` animation already defined and used
- `sonner` — toast library imported in `DocumentDropzone.tsx`
- `components/ui/checkbox.tsx` — present in project file listing

---

## Validation Architecture

### Success Criterion 1: Dual Upload Zones with Independent Handling (COMP-01)

> User can upload two documents simultaneously into labeled comparison zones ("Original" vs "Revised") with parallel ingestion handling.

**What to test:** 
- Both zones render independently with distinct state
- "Compare Documents" button only enables when both zones have valid content
- Each zone's error state does not affect the other zone
- Both documents upload to `/api/upload` independently before comparison

**How to test:**
```ts
// Component test (vitest/renderToString)
// DualDocumentIntake with both zones populated → verify button not disabled
const html = renderToString(React.createElement(DualDocumentIntake, {
  zoneA: { uploadedDoc: mockDoc, manualText: '' },
  zoneB: { uploadedDoc: mockDoc, manualText: '' },
  ...
}));
expect(html).not.toContain('disabled');
expect(html).toContain('Compare Documents');

// With only one zone populated
const html2 = renderToString(React.createElement(DualDocumentIntake, {
  zoneA: { uploadedDoc: mockDoc, manualText: '' },
  zoneB: { uploadedDoc: null, manualText: '' },
  ...
}));
// Button should be disabled
expect(html2).toContain('disabled');
```

**Browser check:**
1. Navigate to `/analyze/compare`
2. Drop file in Zone A → verify Zone B remains in empty/drag-ready state
3. Drop file in Zone B → verify "Compare Documents" button becomes active
4. Verify Zone A word count shows correctly while Zone B is uploading

**Acceptance threshold:** "Compare Documents" button disabled with 0 or 1 zones populated; enabled only with both zones having ≥50 chars of content; each zone's upload state is visually independent.

---

### Success Criterion 2: Overall Favorability Verdict Card (COMP-03)

> Favorability Verdict card indicates which document benefits the user (docA, docB, or neutral) with plain-English justification.

**What to test:**
- API returns `favorabilityVerdict` as `'docA' | 'docB' | 'neutral'`
- `FavorabilityVerdictCard` renders the verdict pill, rationale text, and metric chips
- Schema validation rejects invalid verdict values

**How to test:**
```ts
// Route test (mocked generateObject)
vi.mocked(generateObject).mockResolvedValueOnce({
  object: {
    favorabilityVerdict: 'docB',
    verdictRationale: 'Document B offers broader mutual indemnification.',
    favorabilityMetrics: { clausesFavoringDocA: 2, clausesFavoringDocB: 5, criticalInconsistencies: 1 },
    differences: [],
    inconsistencies: [],
    negotiationGuide: { pushBack: [], acceptAsIs: [], flagForLawyer: [], recommendation: '' },
  }
});
const res = await POST(createCompareRequest({ docA: '...30+ chars...', docB: '...30+ chars...', labelA: 'Original', labelB: 'Revised' }));
const body = await res.json();
expect(body.success).toBe(true);
expect(body.data.favorabilityVerdict).toBe('docB');
expect(body.data.verdictRationale).toBeTruthy();

// Schema test
expect(() => ComparisonSchema.parse({ ...valid, favorabilityVerdict: 'docC' })).toThrow();

// Component test
const html = renderToString(React.createElement(FavorabilityVerdictCard, {
  verdict: 'docB', rationale: 'Document B...', labelA: 'Original', labelB: 'Revised',
  metrics: { clausesFavoringDocA: 2, clausesFavoringDocB: 5, criticalInconsistencies: 1 }
}));
expect(html).toContain('id="verdict-section"');
expect(html).toContain('Revised Version'); // docB label displayed
expect(html).toContain('5'); // clausesFavoringDocB metric chip
```

**Acceptance threshold:** `favorabilityVerdict` is one of three valid enum values; verdict section renders with correct label and at least one metric chip value visible.

---

### Success Criterion 3: Side-by-Side Comparison Table (COMP-04)

> Side-by-side comparison table maps corresponding clauses category-by-category, showing text variances, risk ratings, and who each clause favors.

**What to test:**
- `differences` array contains `ClauseDiff` objects with all required fields
- `ClauseComparisonTable` renders verbatim text in JetBrains Mono (`font-mono`)
- Risk badge color classes are applied correctly per risk tier
- Filter chips correctly filter the visible rows
- Default sort places `high` risk rows first

**How to test:**
```ts
// Schema test (existing schemas.test.ts updated for new ComparisonSchema shape)
const diff = {
  category: 'Termination',
  textDocA: 'Either party may terminate on 30 days notice.',
  textDocB: 'Client may terminate immediately without cause.',
  favors: 'docA',
  riskRating: 'high',
  notes: 'Doc B allows immediate unilateral termination without remedy period.',
};
expect(ClauseDiffSchema.parse(diff)).toMatchObject(diff);

// Component test
const html = renderToString(React.createElement(ClauseComparisonTable, {
  differences: [diff],
  labelA: 'Original',
  labelB: 'Revised',
}));
expect(html).toContain('id="differences-section"');
expect(html).toContain('font-mono'); // JetBrains Mono applied to clause text
expect(html).toContain('Either party may terminate on 30 days notice.');
expect(html).toContain('border-red-500'); // high risk color
expect(html).toContain('All'); // filter chip labels present
expect(html).toContain('High Risk');
```

**Acceptance threshold:** All `ClauseDiff` fields render in the table; `font-mono` class applied to clause text cells; high-risk rows render before standard-risk rows in default sort; filter chips visible with counts.

---

### Success Criterion 4: Inconsistencies Section (COMP-05)

> Inconsistencies section highlights contradictory clauses, unexpected additions, or omitted standard protections with severity tags (Critical, Notable, Minor).

**What to test:**
- `inconsistencies` array parses via `InconsistencyItemSchema` with correct enum values
- `InconsistenciesSection` renders each inconsistency with correct severity badge color
- Critical items render with crimson styling, Notable with amber, Minor with blue/slate
- Schema rejects invalid severity values (e.g., `'high'`)

**How to test:**
```ts
// Schema test
expect(InconsistencyItemSchema.parse({
  clauseTitle: 'Termination Notice',
  description: 'Conflict between Clause 4 and Clause 11',
  severity: 'critical'
})).toBeDefined();
expect(() => InconsistencyItemSchema.parse({
  clauseTitle: 'Test', description: 'Desc', severity: 'high'
})).toThrow(); // 'high' is not a valid severity (must be critical/notable/minor)

// Component test
const inconsistencies = [
  { clauseTitle: 'Test Critical', description: 'A critical conflict', severity: 'critical' as const },
  { clauseTitle: 'Test Notable', description: 'A notable issue', severity: 'notable' as const },
  { clauseTitle: 'Test Minor', description: 'A minor issue', severity: 'minor' as const },
];
const html = renderToString(React.createElement(InconsistenciesSection, { inconsistencies }));
expect(html).toContain('id="inconsistencies-section"');
expect(html).toContain('Critical');
expect(html).toContain('Notable');
expect(html).toContain('Minor');
expect(html).toContain('border-red-500'); // crimson for critical
expect(html).toContain('border-amber-500'); // amber for notable
```

**Acceptance threshold:** All three severity values render with visually distinct badge/border styles; schema rejects `'high'` and `'low'` as invalid severity values.

---

### Success Criterion 5: Negotiation Guide + Two-Pass for Large Docs (COMP-06, COMP-07)

> Negotiation Guide segments terms into actionable categories (Push Back, Accept As-Is, Flag for Lawyer), and large combined docs (>80k chars) are processed via two-pass extraction without token truncation.

**How to test — Negotiation Guide (COMP-06):**
```ts
// Schema validation — new structured format
const guide = {
  pushBack: [{ clauseTitle: 'Termination', rationale: 'Unilateral clause', suggestedAlternative: 'Mutual 30-day notice' }],
  acceptAsIs: [{ clauseTitle: 'Governing Law', rationale: 'Standard NY jurisdiction' }],
  flagForLawyer: [{ clauseTitle: 'Arbitration', rationale: 'Mandatory arbitration waiver requires legal review' }],
  recommendation: 'Overall the revised document shifts risk toward the contractor.',
};
expect(NegotiationGuideSchema.parse(guide)).toBeDefined();
// Old flat string array format MUST fail
expect(() => NegotiationGuideSchema.parse(['Point 1', 'Point 2'])).toThrow();

// Component test
const html = renderToString(React.createElement(NegotiationGuide, { guide, labelA: 'Original', labelB: 'Revised' }));
expect(html).toContain('id="negotiation-section"');
expect(html).toContain('Push Back');
expect(html).toContain('Accept As-Is');
expect(html).toContain('Flag for Lawyer');
expect(html).toContain('Termination');
expect(html).toContain('Copy Talking Point');
```

**How to test — Two-Pass Large Document (COMP-07):**
```ts
// Route test: verify 3 generateObject calls for docs > 80k chars
const largeText = 'a'.repeat(41_000); // 41k chars per doc = 82k combined

vi.mocked(generateObject)
  .mockResolvedValueOnce({ object: { clauses: [{ category: 'Payment', excerpt: 'Net-30 terms apply.' }] } })  // Pass 1A
  .mockResolvedValueOnce({ object: { clauses: [{ category: 'Payment', excerpt: 'Net-60 terms apply.' }] } })  // Pass 1B
  .mockResolvedValueOnce({ object: fullComparisonResult });                                                    // Pass 2

const req = createCompareRequest({ docA: largeText, docB: largeText, labelA: 'A', labelB: 'B' });
const res = await POST(req);
const body = await res.json();

expect(generateObject).toHaveBeenCalledTimes(3); // 2 extractions + 1 synthesis
expect(body.isLargeDoc).toBe(true);
expect(body.success).toBe(true);

// Verify single-pass for normal-sized docs
vi.clearAllMocks();
const shortText = 'Normal length contract text for testing purposes.'.repeat(20);
vi.mocked(generateObject).mockResolvedValueOnce({ object: fullComparisonResult });

const req2 = createCompareRequest({ docA: shortText, docB: shortText, labelA: 'A', labelB: 'B' });
const res2 = await POST(req2);
const body2 = await res2.json();

expect(generateObject).toHaveBeenCalledTimes(1); // Only single pass
expect(body2.isLargeDoc).toBe(false);
```

**Acceptance threshold:**
- `negotiationGuide` has `pushBack`, `acceptAsIs`, `flagForLawyer` arrays each with structured card objects containing `clauseTitle` and `rationale`
- Route calls `generateObject` exactly 3 times for docs with combined length > 80,000 chars
- Route calls `generateObject` exactly 1 time for docs with combined length ≤ 80,000 chars
- Response envelope includes `isLargeDoc: boolean`
- `NegotiationGuideSchema.parse()` rejects flat string arrays (breaking change from old schema confirmed in test)

---

## Sources

| Claim | Source | Confidence |
|-------|--------|-----------|
| Existing `ComparisonSchema` structure | [VERIFIED: `lib/schemas/comparison.ts`] | HIGH |
| PRD F4 schema fields | [VERIFIED: `prd.html` lines 928–950] | HIGH |
| D-13 negotiation guide upgrade | [VERIFIED: `04-CONTEXT.md` line 51] | HIGH |
| `DocumentDropzone` props interface | [VERIFIED: `components/upload/DocumentDropzone.tsx` lines 19–23] | HIGH |
| `StickyNav` section IDs (decoder-specific) | [VERIFIED: `components/decoder/StickyNav.tsx` lines 19–24] | HIGH |
| `AnalysisProgress` stage messages (decoder-specific) | [VERIFIED: `components/decoder/AnalysisProgress.tsx` lines 6–10] | HIGH |
| `AnalysisErrorCard` button labels | [VERIFIED: `components/decoder/AnalysisErrorCard.tsx` lines 41–51] | HIGH |
| Scroll-spy IntersectionObserver pattern | [VERIFIED: `app/analyze/situation/page.tsx` lines 88–130] | HIGH |
| Vitest + `renderToString` test pattern | [VERIFIED: `tests/decoder-components.test.ts`] | HIGH |
| Mocked `generateObject` route test pattern | [VERIFIED: `tests/analyze-document-route.test.ts`] | HIGH |
| `runtime = 'nodejs'`, `maxDuration = 60` | [VERIFIED: `app/api/analyze/situation/route.ts` lines 7–9] | HIGH |
| `RiskLevelEnum` values (high/caution/standard) | [VERIFIED: `lib/schemas/common.ts` line 3] | HIGH |
| Tailwind `font-mono` → JetBrains Mono | [VERIFIED: `tailwind.config.ts` line 78] | HIGH |
| Custom color tokens (`#D4AF37`, `#0B0F17`, etc.) | [VERIFIED: `tailwind.config.ts` lines 56–68] | HIGH |
| `QuickStartCards.tsx` preset pattern | [VERIFIED: `components/situation/QuickStartCards.tsx`] | HIGH |
| Mode 2 card in `app/page.tsx` lines 47–72 | [VERIFIED: `app/page.tsx`] | HIGH |
| PRD Flow 3 comparison user flow | [VERIFIED: `prd.html` lines 1040–1052] | HIGH |
| Claude 3.5 Sonnet 200k context window | [ASSUMED] | MEDIUM |
| Vercel Pro required for 60s timeout | [ASSUMED] | MEDIUM |
| Two-pass wall time < 60s with concurrent Pass 1 | [ASSUMED] | MEDIUM |

---

## Metadata

```yaml
phase: 4
phase_name: Mode 3 — Document Comparison Engine
requirements: [COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07]
researched_at: 2026-09-22
confidence_overall: HIGH
net_new_files:
  - app/analyze/compare/page.tsx
  - app/api/analyze/compare/route.ts
  - lib/prompts/comparison.ts
  - components/comparison/intake/DocumentZone.tsx
  - components/comparison/intake/DualDocumentIntake.tsx
  - components/comparison/intake/ComparisonPresetCards.tsx
  - components/comparison/ComparisonProgress.tsx
  - components/comparison/ComparisonErrorCard.tsx
  - components/comparison/ComparisonStickyNav.tsx
  - components/comparison/FavorabilityVerdictCard.tsx
  - components/comparison/InconsistenciesSection.tsx
  - components/comparison/ClauseComparisonTable.tsx
  - components/comparison/NegotiationGuide.tsx
modified_files:
  - app/page.tsx (Mode 3 card addition)
  - lib/schemas/comparison.ts (schema upgrade - NegotiationGuideSchema + FavorabilityMetricsSchema)
  - lib/schemas/index.ts (re-export new exported schemas)
  - tests/schemas.test.ts (update Mode 3 negotiationGuide test fixture)
new_tests:
  - tests/analyze-compare-route.test.ts
  - tests/comparison-components.test.ts
breaking_changes:
  - lib/schemas/comparison.ts: negotiationGuide field type change (z.array(z.string()) → NegotiationGuideSchema)
  - tests/schemas.test.ts: Mode 3 comparison test fixture must be updated
```

---

## RESEARCH COMPLETE
