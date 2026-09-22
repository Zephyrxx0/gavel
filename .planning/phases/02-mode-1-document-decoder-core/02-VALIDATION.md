---
phase: 2
slug: mode-1-document-decoder-core
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.0.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | DECODE-01 | T-02-01 | Input validation & non-UPL system prompt enforcement | unit | `npx vitest run tests/analyze-document-route.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | DECODE-01 | T-02-02 | Multimodal base64 vision payload construction | unit | `npx vitest run tests/analyze-document-route.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | DECODE-02 | T-02-03 | Executive summary & party metadata rendering | unit | `npx vitest run tests/decoder-components.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | DECODE-03 | T-02-04 | 3-tier risk filtering, sorting, & accordion text | unit | `npx vitest run tests/decoder-components.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | DECODE-04 | T-02-05 | Checklist chronological groups & check-off state | unit | `npx vitest run tests/decoder-components.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | DECODE-05 | T-02-06 | Lawyer question cards, copy action & clause link | unit | `npx vitest run tests/decoder-components.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 3 | DECODE-01..05 | T-02-07 | StickyNav, progress loader & error card | unit | `npx vitest run tests/decoder-components.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 3 | DECODE-01..05 | T-02-08 | End-to-end page integration & reset controls | smoke | `npm test -- --run && npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/analyze-document-route.test.ts` — route handler unit & mock tests for text and image analysis
- [ ] `tests/decoder-components.test.ts` — client component contract tests for scorecard, checklist, and questions

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-time Claude 3.5 Sonnet analysis execution | DECODE-01 | Requires active `ANTHROPIC_API_KEY` network call | Upload a sample lease agreement on `/analyze/document` and verify live response within 15s |
| Sticky anchor scroll-spy highlighting | DECODE-02..05 | Browser scroll events & viewport layout | Scroll through completed dossier and verify sticky header reflects active section |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-22

