---
phase: 5
slug: mode-4-contextual-q-a-export-tools-universal-polish
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-09-22
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest ^2.1.8 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- tests/chat-route.test.ts tests/export-utils.test.ts` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~4 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- tests/chat-route.test.ts tests/export-utils.test.ts`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green + `npm run build` passing
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | CHAT-01 | T-05-01 | Epistemic non-UPL system prompt & 50k character truncation | unit | `npm test -- tests/chat-route.test.ts` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | CHAT-03 | T-05-02 | Omission detection & bracketed citation syntax | unit | `npm test -- tests/chat-route.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 1 | CORE-03 | T-05-03 | Disclaimer banner in exports & zero PII leakage | unit | `npm test -- tests/export-utils.test.ts` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 1 | CORE-03 | — | Multi-format export generation (MD, TXT, JSON) | unit | `npm test -- tests/export-utils.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | CHAT-02 | — | ChatPanel slide-over and mobile sheet transitions | component | `npm test -- tests/chat-components.test.ts` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | CHAT-02 | — | Suggested starter prompt chips submit on click | component | `npm test -- tests/chat-components.test.ts` | ❌ W0 | ⬜ pending |
| 05-04-01 | 04 | 3 | CORE-01 | — | StickyNav mobile scrollable rail & action triggers | component | `npm test -- tests/chat-components.test.ts` | ❌ W0 | ⬜ pending |
| 05-04-02 | 04 | 3 | CORE-02 | — | Universal disclaimer presence & non-UPL micro-copy | component | `npm test -- tests/chat-components.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/chat-route.test.ts` — stubs and tests for CHAT-01 and CHAT-03
- [ ] `tests/export-utils.test.ts` — stubs and tests for CORE-03 formatters
- [ ] `tests/chat-components.test.ts` — component tests for ChatPanel and ExportDossierCard
- [ ] `@ai-sdk/react` & `react-markdown` — install approved packages via `npm install @ai-sdk/react react-markdown`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Real-time streaming response UX | CHAT-01 / CHAT-02 | Requires live Anthropic API key and WebSocket/SSE streaming connection | Open `/analyze/document`, click "Ask Gavel", submit "What are the termination terms?", observe streaming token delivery |
| Mobile drawer gesture & touch sizing | CORE-01 / CHAT-02 | Touch device ergonomics | Open on mobile viewport (<640px), verify drawer is full screen with 44px tap targets |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-09-22

