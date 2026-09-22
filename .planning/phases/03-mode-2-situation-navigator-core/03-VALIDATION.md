---
phase: 3
slug: mode-2-situation-navigator-core
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-22
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 2.1.8 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run tests/analyze-situation-route.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` on affected test files
- **After every plan wave:** Run `npx vitest run` and `npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | SIT-02 | — | Validates updated 4-tier urgency & document evidence schemas | unit | `npx vitest run tests/schemas.test.ts` | ✅ | ⬜ pending |
| 03-01-02 | 01 | 1 | SIT-02 | T-03-01 | System prompt enforces non-UPL and untrusted XML containment | unit | `npx vitest run tests/analyze-situation-route.test.ts` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | SIT-02 | T-03-02 | Route handler validates input, handles errors, and returns typed response | integration | `npx vitest run tests/analyze-situation-route.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 1 | SIT-01 | — | Word count check (< 20 words warning, disabled submit) | unit | `npx vitest run tests/situation-intake.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 1 | SIT-01 | — | Quick-start dispute presets & category filter chips | unit | `npx vitest run tests/situation-intake.test.ts` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 1 | SIT-02 | — | 3-stage animated loader with elapsed timer & security notice | unit | `npx vitest run tests/situation-intake.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 2 | SIT-07 | — | Top-level critical deadline alert banner | unit | `npx vitest run tests/situation-components.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 2 | SIT-03, SIT-06 | — | Situation summary card with verified category badge, change dropdown, and timeline | unit | `npx vitest run tests/situation-components.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 2 | SIT-04 | — | Statutory rights accordions with citations and plain-English explanations | unit | `npx vitest run tests/situation-components.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-04 | 03 | 2 | SIT-05 | — | 4-tier urgency roadmap with Doable Solo vs Counsel Recommended badges & check-off | unit | `npx vitest run tests/situation-components.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-05 | 03 | 2 | SIT-06 | — | Documents to Gather evidence checklist with rationale & check-off | unit | `npx vitest run tests/situation-components.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-06 | 03 | 2 | SIT-06 | — | When to Call a Lawyer escalation triggers | unit | `npx vitest run tests/situation-components.test.ts` | ❌ W0 | ⬜ pending |
| 03-03-07 | 03 | 2 | SIT-01..07 | — | Sticky navigation with 5 anchor targets & scroll-spy | unit | `npx vitest run tests/situation-components.test.ts` | ❌ W0 | ⬜ pending |
| 03-04-01 | 04 | 3 | SIT-01..07 | — | Page orchestration (`/analyze/situation`), category re-run, reset, and full build | integration | `npx vitest run && npm run build` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/analyze-situation-route.test.ts` — covers SIT-02 route and prompt tests
- [ ] `tests/situation-intake.test.ts` — covers SIT-01 intake, validation, presets, loader
- [ ] `tests/situation-components.test.ts` — covers SIT-03 through SIT-07 dossier presentation components

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Scroll-spy animation smoothness | D-09 | Visual browser scrolling dynamics | Open `/analyze/situation` in browser, scroll down dossier, verify sticky nav active state updates smoothly |
| SessionStorage persistence across reload | D-04 | Browser refresh lifecycle | Type >20 words in intake, refresh browser tab, verify text remains in textarea |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-09-22

