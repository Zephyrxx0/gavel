# Phase 1: Foundation, Schemas, & Ingestion Pipeline - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-21
**Phase:** 1-Foundation, Schemas, & Ingestion Pipeline
**Areas discussed:** Ingestion & Fallback Flow, Design System & Disclaimer UI, Zod Schema Architecture, Client Canvas Downsample & Preview

---

## Ingestion & Fallback Flow

### Fallback trigger on extraction failure
| Option | Description | Selected |
|--------|-------------|----------|
| Auto-switch with inline banner | Auto-switch to paste textarea with inline banner explaining extraction issue | ✓ |
| Permanent tab toggle | Keep permanent 'Upload Document' / 'Paste Text' tab toggle, switch tab + error badge on failure | |
| Modal prompt | Modal prompt alerting file unreadable with one-click 'Switch to Manual Paste' action | |

**User's choice:** Auto-switch to paste textarea with inline banner explaining extraction issue.

### In-memory file parsing architecture
| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated /api/upload route | In-memory parse → returns { text, isImage, charCount } to client state | ✓ |
| Direct multipart to /api/analyze/* | Upload + analyze in single request, skipping client-state roundtrip | |
| Hybrid route | /api/upload supports preview + validation, caches ephemeral token in memory for analyze | |

**User's choice:** Dedicated /api/upload route: In-memory parse → returns { text, isImage, charCount } to client state.

### Text sanitization strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Conservative legal cleaning | Strip null/control chars, normalize CRLF, collapse 3+ newlines → 2, keep section numbers/indentation | ✓ |
| Aggressive flattening | Regex-strip header/footers & page numbers, merge wrapped lines into single paragraphs | |
| Minimal raw pass | Strip null bytes only, leave all whitespace/formatting untouched for LLM comprehension | |

**User's choice:** Conservative legal cleaning: Strip null/control chars, normalize CRLF, collapse 3+ newlines → 2, keep section numbers/indentation.

### Client validation error UX
| Option | Description | Selected |
|--------|-------------|----------|
| Client-side pre-flight toast + shake | Client-side pre-flight toast + dropzone shake with inline error message & accepted badge chips | ✓ |
| Modal dialog | Modal dialog explaining accepted formats (.pdf, .docx, .png, .jpg <= 10MB) with dismiss button | |
| Quiet inline text replacement | Quiet inline text replacement inside upload container without toast notification | |

**User's choice:** Client-side pre-flight toast + dropzone shake with inline error message & accepted badge chips.

---

## Design System & Disclaimer UI

### Legal disclaimer placement & prominence
| Option | Description | Selected |
|--------|-------------|----------|
| Dual placement | Persistent compact bottom banner with amber shield + prominent card above report viewports | ✓ |
| Initial modal consent gate | Initial modal consent gate on first visit + subtle footer link across pages | |
| Persistent top header banner | Persistent top header banner above navigation across all pages | |

**User's choice:** Dual placement: Persistent compact bottom banner with amber shield + prominent card above report viewports.

### Dark legal aesthetic color scheme & tokens
| Option | Description | Selected |
|--------|-------------|----------|
| Deep obsidian base + legal gold | Deep obsidian base (#0B0F17) + muted legal gold (#C5A059 / #D4AF37) + slate card borders (#1E293B) + semantic traffic-light risk tokens | ✓ |
| Pure jet black + bright gold | Pure jet black (#000000) + high-contrast bright gold (#FFD700) + sharp zinc borders (#27272A) | |
| Midnight navy + antique brass | Midnight navy (#0A1128) + antique brass accent (#B5A642) + warm parchment text (#F5F2EB) | |

**User's choice:** Deep obsidian base (#0B0F17) + muted legal gold (#C5A059 / #D4AF37) + slate card borders (#1E293B) + semantic traffic-light risk tokens.

### Typography application pattern
| Option | Description | Selected |
|--------|-------------|----------|
| Editorial Authority | DM Serif Display for hero/sections, DM Sans for explanations, JetBrains Mono for citations, badges, & clause IDs | ✓ |
| Modern Clean | DM Sans for all headings and body, JetBrains Mono strictly for verbatim contract text snippets | |
| Classic Barrister | DM Serif for headers and verbatim clause blocks, DM Sans strictly for UI buttons and chips | |

**User's choice:** Editorial Authority: DM Serif Display for hero/sections, DM Sans for explanations, JetBrains Mono for citations, badges, & clause IDs.

### Baseline shadcn/Radix UI component suite
| Option | Description | Selected |
|--------|-------------|----------|
| Full foundational suite | Accordion, Dialog, Tabs, Tooltip, Badge, Button, Sonner Toast (covers all 4 modes) | ✓ |
| Minimal initial set | Button, Badge, Alert, Accordion only (install others lazily per phase) | |
| Custom unstyled components | Custom unstyled HTML + Tailwind CSS components without Radix primitives | |

**User's choice:** Full foundational suite: Accordion, Dialog, Tabs, Tooltip, Badge, Button, Sonner Toast (covers all 4 modes).

---

## Zod Schema Architecture

### Schema directory organization
| Option | Description | Selected |
|--------|-------------|----------|
| Domain-modular with index re-export | lib/schemas/{common,document,situation,comparison}.ts re-exported via lib/schemas/index.ts | ✓ |
| Single monolithic file | lib/schemas.ts containing all schemas, enums, and inferred TypeScript types | |
| Route co-location | schemas defined directly inside app/api/analyze/*/schema.ts with shared lib/schemas/common.ts | |

**User's choice:** Domain-modular with index re-export: lib/schemas/{common,document,situation,comparison}.ts re-exported via lib/schemas/index.ts.

### Shared risk rating & action priority enums
| Option | Description | Selected |
|--------|-------------|----------|
| Strict canonical enums | RiskLevel ('high'|'caution'|'standard'), ActionTiming, ActionType, InconsistencySeverity across all modes | ✓ |
| Independent per-mode enums | Allows Mode 1 and Mode 3 to define distinct severity levels without shared constraints | |
| Numeric risk score | Numeric risk score (1-100) with dynamic UI threshold mapping into red/yellow/green badges | |

**User's choice:** Strict canonical enums: RiskLevel ('high'|'caution'|'standard'), ActionTiming, ActionType, InconsistencySeverity across all modes.

### Non-prescriptive legal compliance enforcement
| Option | Description | Selected |
|--------|-------------|----------|
| Defense-in-depth | Strict z.string().describe(...) non-UPL guidelines baked into schema fields + system prompt enforcement | ✓ |
| System prompt only | Clean Zod schemas without verbose .describe() directives, relying 100% on system prompt instruction | |
| Post-generation sanitize | Regex/string filter that intercepts and neutralizes forbidden prescriptive phrases ('you must/should') | |

**User's choice:** Defense-in-depth: Strict z.string().describe(...) non-UPL guidelines baked into schema fields + system prompt enforcement.

### /api/upload response envelope & error codes
| Option | Description | Selected |
|--------|-------------|----------|
| Typed envelope with error codes | { success: true, data: { text?, isImage, rawBase64?, mimeType, fileName, sizeBytes, wordCount } } & structured error codes (CORRUPT_FILE, EMPTY_TEXT, PASSWORD_PROTECTED) | ✓ |
| Minimal JSON | { text: string, isImage: boolean, base64?: string } with standard HTTP 400/500 strings | |
| Multi-part JSON-LD | Multi-part JSON-LD with metadata block and extracted document outline tokens | |

**User's choice:** Typed envelope with error codes: { success: true, data: { text?, isImage, rawBase64?, mimeType, fileName, sizeBytes, wordCount } } & structured error codes (CORRUPT_FILE, EMPTY_TEXT, PASSWORD_PROTECTED).

---

## Client Canvas Downsample & Preview

### Image downsampling constraints & targets
| Option | Description | Selected |
|--------|-------------|----------|
| Progressive downscale | Max dimension 2048px, JPEG quality 0.82, guarantees file < 3MB while preserving contract legibility | ✓ |
| Fixed 1080p resize | Strict 1920x1080 bounds, JPEG quality 0.75 for maximum compression speed | |
| Iterative Web Worker compression | Off-thread binary search compressing until payload exactly < 2MB | |

**User's choice:** Progressive downscale: Max dimension 2048px, JPEG quality 0.82, guarantees file < 3MB while preserving contract legibility.

### Pre-analysis file display & metadata card UX
| Option | Description | Selected |
|--------|-------------|----------|
| File metadata card | Thumbnail/doc icon, file name, size (with downsample indicator if applicable), word count, & remove button | ✓ |
| Minimal inline pill | Compact file name tag with remove 'x' button inside the dropzone | |
| Full document preview pane | Scrollable inline iframe/canvas rendering the complete document alongside the dropzone | |

**User's choice:** File metadata card: Thumbnail/doc icon, file name, size (with downsample indicator if applicable), word count, & remove button.

### Drag-and-drop interaction feedback & loading state
| Option | Description | Selected |
|--------|-------------|----------|
| Polished legal feel | Dashed gold border glow (#D4AF37), subtle 1.01 scale, and determinate/indeterminate progress bar during extraction | ✓ |
| Minimal static change | Border shifts from slate-700 to slate-300 with simple 'Drop to upload' text change, no animation | |
| High-intensity modal overlay | Entire window dims with full-screen drop banner and bouncing icon | |

**User's choice:** Polished legal feel: Dashed gold border glow (#D4AF37), subtle 1.01 scale, and determinate/indeterminate progress bar during extraction.

### Manual paste textarea features & controls
| Option | Description | Selected |
|--------|-------------|----------|
| Full-featured textarea | Character counter, 'Paste from Clipboard' quick action, clear button, & 'Manual Input Mode' status badge | ✓ |
| Minimal bare textarea | Standard plain HTML textarea with simple submit button and no character metrics | |
| Rich text WYSIWYG editor | Embedded rich text editor with bold/headings formatting controls | |

**User's choice:** Full-featured textarea: Character counter, 'Paste from Clipboard' quick action, clear button, & 'Manual Input Mode' status badge.

---

## the agent's Discretion

- Exact micro-animation durations (150ms-200ms ease) and Lucide icon selections for specific file types and status chips.

## Deferred Ideas

- None — discussion stayed within Phase 1 scope.
