# Phase 1: Foundation, Schemas, & Ingestion Pipeline - Context

**Gathered:** 2026-09-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the core Next.js 14+ application workspace, dark legal design system (DM Serif Display, DM Sans, JetBrains Mono, gold accents, shadcn/Radix components), universal non-dismissible legal disclaimer surfaces, domain-modular Zod schemas (`lib/schemas/*`), and the in-memory multi-format file ingestion pipeline (`/api/upload`) supporting PDF (`pdf-parse`), DOCX (`mammoth`), and image downsampling + base64 encoding (JPG/PNG) with zero disk persistence and fallback manual text paste.

</domain>

<decisions>
## Implementation Decisions

### Ingestion & Fallback Flow
- **D-01:** Dedicated `/api/upload` endpoint performs in-memory file parsing and returns a structured envelope `{ success: true, data: { text, isImage, rawBase64, mimeType, fileName, sizeBytes, wordCount } }` to client state, keeping upload parsing cleanly decoupled from AI inference endpoints. — **Reversibility:** costly — changes API contract between ingestion dropzone and subsequent mode inference routes.
- **D-02:** When extraction fails (corrupt file, password protected, scanned PDF without text, or yields < 50 characters), the client automatically switches to the fallback manual text paste textarea accompanied by an inline alert explaining why. — **Reversibility:** reversible
- **D-03:** Conservative legal text sanitization: strip null and unprintable control characters, normalize CRLF line endings, collapse 3+ consecutive newlines down to 2, while strictly preserving clause numbering, section titles, and indentation hierarchy. — **Reversibility:** reversible
- **D-04:** Client-side pre-flight file validation intercepts rejected formats (.exe, .zip, etc.) or files > 10MB before network transmission, triggering a toast alert and animated dropzone shake with accepted format tags. — **Reversibility:** reversible

### Design System & Disclaimer UI
- **D-05:** Legal disclaimer implementation uses dual placement: a persistent compact bottom banner featuring an amber shield icon alongside a prominent, dedicated disclaimer card rendered directly above report viewports. — **Reversibility:** reversible
- **D-06:** Dark legal aesthetic tokens configured in Tailwind: deep obsidian background (`#0B0F17`), muted legal gold primary accents (`#C5A059` / `#D4AF37`), slate card borders (`#1E293B`), and semantic traffic-light risk colors (crimson `high`, amber `caution`, emerald `standard`). — **Reversibility:** costly — styles all downstream cards and scorecards.
- **D-07:** Editorial Authority typography hierarchy: `DM Serif Display` for hero headings and major report sections, `DM Sans` for body copy, card content, and simplified explanations, and `JetBrains Mono` for clause identifiers, statutory citations, and severity/action badges. — **Reversibility:** reversible
- **D-08:** Pre-install full foundational shadcn/Radix UI suite during Phase 1: Accordion, Dialog, Tabs, Tooltip, Badge, Button, and Sonner Toast to support all 4 mode workflows without subsequent primitive churn. — **Reversibility:** reversible

### Zod Schema Architecture
- **D-09:** Domain-modular schema architecture under `lib/schemas/`: `common.ts` (shared enums, error models, request wrappers), `document.ts` (Mode 1), `situation.ts` (Mode 2), and `comparison.ts` (Mode 3), re-exported through `lib/schemas/index.ts`. — **Reversibility:** costly — imported across all API routes and frontend components.
- **D-10:** Strict canonical enums shared across schemas: `RiskLevel` (`high`, `caution`, `standard`), `ActionTiming` (`immediate`, `before_signing`, `after_signing`), `ActionType` (`negotiate`, `verify`, `refuse`, `accept`), and `InconsistencySeverity` (`critical`, `notable`, `minor`). — **Reversibility:** costly — dictates AI structured output shape.
- **D-11:** Defense-in-depth epistemic compliance: embed explicit non-UPL directives inside Zod `.describe(...)` field annotations (e.g. enforcing objective observations, banning "you should" and legal violation claims) alongside system prompts. — **Reversibility:** reversible
- **D-12:** Upload API response schema uses typed envelope with structured machine-readable error codes (`CORRUPT_FILE`, `EMPTY_TEXT`, `UNSUPPORTED_TYPE`, `PASSWORD_PROTECTED`, `PAYLOAD_TOO_LARGE`). — **Reversibility:** reversible

### Client Canvas Downsample & Preview
- **D-13:** Client canvas downsampling for images > 4MB: progressively scale image to max dimension 2048px at JPEG quality 0.82, ensuring payload remains well under Vercel's 4.5MB serverless limit while preserving fine-print legibility. — **Reversibility:** reversible
- **D-14:** Pre-analysis file metadata card: upon successful file selection or downsampling, display document icon/thumbnail, file name, formatted size (with original vs compressed badge if downsampled), word count, and a remove button. — **Reversibility:** reversible
- **D-15:** Interactive dropzone feedback: dashed gold border glow (`#D4AF37`), subtle 1.01 scale-up on active drag-over, and determinate/indeterminate progress indicator during in-memory parsing. — **Reversibility:** reversible
- **D-16:** Full-featured manual paste textarea: character & word counter, one-click "Paste from Clipboard" action button, clear button, and a prominent "Manual Input Mode" status badge. — **Reversibility:** reversible

### the agent's Discretion
- Exact layout spacing, Tailwind transition timings (e.g. 150ms-200ms ease), and icon selections from `lucide-react` for file types and status chips are left to builder discretion.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Scope
- `prd.html` — Complete product requirements, feature specifications, and UX specifications for Gavel.
- `.planning/REQUIREMENTS.md` — Authoritative requirements for Phase 1 (INGEST-01 through INGEST-07, CORE-01, CORE-02, CORE-04).
- `.planning/PROJECT.md` — Project context, constraints, and architecture guardrails.
- `.planning/ROADMAP.md` — 5-phase delivery plan and Phase 1 scope boundary.

### Technical & Design Specifications
- `research/STACK.md` (as summarized in AGENTS.md) — Tech stack versions (Next.js 14.2.24, React 18.3.1, Tailwind 3.4.17, Vercel AI SDK 3.4.33, pdf-parse, mammoth).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Greenfield project: No existing application code present. Phase 1 establishes the root repository structure and foundational component primitives.

### Established Patterns
- Next.js 14 App Router conventions with `app/api/upload/route.ts` running in Node.js runtime (`export const runtime = 'nodejs'`) for Buffer compatibility.
- Ephemeral in-memory file processing: no disk persistence, no database tables, no S3 buckets.

### Integration Points
- `/api/upload` route will receive `FormData` containing the file payload.
- Ingestion state (`{ text, isImage, rawBase64, ... }`) feeds directly into future Mode 1, Mode 2, and Mode 3 client interfaces.

</code_context>

<specifics>
## Specific Ideas

- Visual tone: Authoritative, premium, and trustworthy—mirroring an elite legal tech platform or high-end legal intelligence dossier (obsidian background with refined gold accents).
- High resilience: When an uploaded document produces poor or empty text, the seamless auto-transition to the manual text paste area ensures the user is never stuck at a dead end.

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within Phase 1 foundation, schemas, and ingestion scope.

</deferred>

---

*Phase: 1-Foundation, Schemas, & Ingestion Pipeline*
*Context gathered: 2026-09-21*
