---
phase: 4
slug: mode-3-document-comparison-engine
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-22
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 1.x + React `renderToString` |
| **Config file** | `vitest.config.ts` (already present — existing test suite) |
| **Quick run command** | `pnpm vitest run tests/` |
| **Full suite command** | `pnpm vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm vitest run tests/`
- **After every plan wave:** Run `pnpm vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 04-01 | 1 | COMP-02,COMP-06 | T-04-02 | NegotiationGuideSchema rejects flat string arrays | unit | `pnpm vitest run tests/schemas.test.ts` | ✅ | ⬜ pending |
| 04-01-02 | 04-01 | 1 | COMP-02,COMP-07 | T-04-01 | Prompt builder XML tag containment `<doc_a_to_compare>` | unit | `pnpm vitest run tests/schemas.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 04-01 | 1 | COMP-02,COMP-07 | T-04-03 | Single-pass for ≤80k chars; 3 generateObject calls for >80k chars | unit | `pnpm vitest run tests/analyze-compare-route.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 04-02 | 2 | COMP-01 | T-04-05 | Presets and single zone upload handling | unit | `pnpm vitest run tests/comparison-intake.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 04-02 | 2 | COMP-01 | T-04-07 | Compare button disabled until both zones valid; 4-stage progress | unit | `pnpm vitest run tests/comparison-intake.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 04-03 | 2 | COMP-03,COMP-05 | T-04-09 | FavorabilityVerdictCard pill & metrics; InconsistenciesSection severity grouping | unit | `pnpm vitest run tests/comparison-components.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-02 | 04-03 | 2 | COMP-04,COMP-06 | T-04-08 | ClauseComparisonTable JetBrains Mono & filters; NegotiationGuide 3 buckets | unit | `pnpm vitest run tests/comparison-components.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-03 | 04-03 | 2 | COMP-03,COMP-04,COMP-05,COMP-06 | T-04-10 | ComparisonStickyNav scroll-spy & reset | unit | `pnpm vitest run tests/comparison-components.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-01 | 04-04 | 3 | COMP-01,COMP-02,COMP-07 | T-04-11,T-04-12 | Page controller 4-state lifecycle, error handling, scroll-spy | integration | `pnpm vitest run tests/comparison-integration.test.ts` | ❌ W0 | ⬜ pending |
| 04-04-02 | 04-04 | 3 | COMP-01,COMP-02 | T-04-13 | Homepage Mode 3 card integration & production build | integration | `pnpm vitest run && pnpm run build` | existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/analyze-compare-route.test.ts` — stubs for COMP-02, COMP-07 (two-pass route)
- [ ] `tests/comparison-components.test.ts` — stubs for COMP-01, COMP-03, COMP-04, COMP-05, COMP-06
- [ ] Update `tests/schemas.test.ts` lines ~391–396 — fix negotiationGuide fixture to match new NegotiationGuideSchema shape

*Existing vitest infrastructure covers all phase requirements — no new framework install required.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dual-zone drag-and-drop UX | COMP-01 | File drag events not reliable in vitest | Navigate to `/analyze/compare`; drop file in Zone A; verify Zone B stays in empty/drag-ready state; drop file in Zone B; verify "Compare Documents" button becomes active |
| AnalysisProgress amber badge for large docs | COMP-07 | Requires real file > 40k chars each | Upload two large PDFs (>40k chars each) and verify "Large document detected" amber badge appears during analysis |
| Side-by-side comparison table layout (mobile) | COMP-04 | Responsive layout verification | View `/analyze/compare` results on a 375px viewport; verify ClauseComparisonTable stacks vertically, not side-by-side |
| Favorability verdict golden accent color | COMP-03 | Visual color verification requires browser | Verify `FavorabilityVerdictCard` uses `#D4AF37` gold accent border for the winning document's column header |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-22
