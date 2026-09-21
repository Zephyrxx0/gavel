---
phase: 1
slug: foundation-schemas-ingestion-pipeline
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.x |
| **Config file** | vitest.config.ts — Wave 0 installs |
| **Quick run command** | `npm test -- run --testNamePattern="unit"` |
| **Full suite command** | `npm test -- run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- run --testNamePattern="unit"`
- **After every plan wave:** Run `npm test -- run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | CORE-01 | — | Next.js 14 workspace with Tailwind dark tokens | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | CORE-01, CORE-02 | — | Disclaimer components render with required copy | unit | `npm test -- run tests/disclaimer.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 2 | CORE-04 | T-01-01 | Zod schemas strictly validate enums & non-UPL descriptions | unit | `npm test -- run tests/schemas.test.ts` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 2 | INGEST-06 | T-01-02 | Legal text cleaning preserves numbering & strips control chars | unit | `npm test -- run tests/text-cleaning.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 | 3 | INGEST-03, INGEST-04, INGEST-05, INGEST-07 | T-01-03 | In-memory upload endpoint handles PDF/DOCX/Images and error cases | integration | `npm test -- run tests/upload-route.test.ts` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 3 | INGEST-01, INGEST-02 | T-01-04 | Canvas downsampler scales >4MB images to <3MB/2048px | unit | `npm test -- run tests/canvas-downsample.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — test configuration with alias mapping `@/*`
- [ ] `tests/schemas.test.ts` — stubs for schema tests (REQ: CORE-04)
- [ ] `tests/text-cleaning.test.ts` — stubs for text sanitization (REQ: INGEST-06)
- [ ] `tests/upload-route.test.ts` — stubs for upload endpoint (REQ: INGEST-03, INGEST-04, INGEST-05, INGEST-07)
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Drag-and-drop animation & visual feedback | INGEST-01 | Visual styling and CSS animation transitions | Drag a file over the dropzone in browser, verify gold border glow and 1.01 scale transform. |
| Non-dismissible footer banner sticky placement | CORE-02 | Visual layout and viewport positioning | Scroll test page in browser, verify bottom disclaimer bar stays fixed and amber shield renders clearly. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-21

