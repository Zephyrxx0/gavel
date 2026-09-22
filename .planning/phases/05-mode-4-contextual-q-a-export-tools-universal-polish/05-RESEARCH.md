# Phase 5: Mode 4 — Contextual Q&A, Export Tools, & Universal Polish — Research

**Gathered:** 2026-09-22  
**Target Phase:** 05-mode-4-contextual-q-a-export-tools-universal-polish  
**Status:** Complete  

---

## Executive Summary

Phase 5 represents the culminating capability and polish layer of Gavel. It delivers:
1. **Interactive Contextual Q&A (Mode 4 / CHAT-01, CHAT-02, CHAT-03):** A streaming chat route (`/api/chat`) and responsive slide-in `ChatPanel` grounded in active document/situation text and prior structured analysis outputs. It adheres strictly to non-UPL (Unauthorized Practice of Law) epistemic guardrails, explicitly notes when a topic is omitted from the source text, and formats clause references as distinct gold monospace citation badges.
2. **Universal Dossier Export Tooling (CORE-03):** Export functionality accessible via dual placement (StickyNav header and dedicated footer `ExportDossierCard`), enabling one-click Markdown clipboard copy with Sonner toast feedback, and multi-format file downloads (Markdown `.md`, Clean Plain Text `.txt`, and structured `.json`) with mandatory statutory legal disclaimer banners.
3. **Universal Mobile Polish & Touch Hardening:** Ensuring all three modes (Mode 1 Decoder, Mode 2 Navigator, Mode 3 Comparison) provide seamless mobile navigation via horizontally scrollable anchor rails, full-screen mobile sheet transitions (<640px), 44x44px minimum tap targets, and iOS `safe-area-inset` protection.
4. **Validation Architecture:** Comprehensive Vitest automated test suite covering `/api/chat`, export formatting engines, chat UI components, and end-to-end typecheck.

---

## User Constraints & Rules

1. **Shell & Package Management:** Shell is `zsh`. Default package manager is `pnpm` (or `npm` fallback if pnpm binary is not present in local path).
2. **Node Server Policy:** Always assume a node server is running before creating a new one.
3. **Application Installation Rule:** "Before installing any application, ask the user." In the discuss-phase, the user explicitly approved installing `@ai-sdk/react` and `react-markdown` (Decision D-08).
4. **Branching Convention:** When `/gsd-discuss-phase` is invoked, create and switch to branch `phase-5-mode-4-contextual-qa-export-polish` (already active).
5. **Architectural Guardrails (AGENTS.md & PROJECT.md):**
   - **Zero Persistence:** Zero disk, cloud, or database storage of user contracts or situation descriptions. All processing is ephemeral.
   - **Advocates Act 1961 Compliance:** Gavel is an educational and informational tool, NOT a law firm or legal representative. The system prompt strictly prohibits prescriptive directives like "you should" or "you must", and every output includes the statutory disclaimer banner.

---

## Phase Requirements & Coverage

| Requirement | Description | Phase 5 Implementation Strategy |
|-------------|-------------|---------------------------------|
| **CHAT-01** | Streaming chat API (`/api/chat`) uses Vercel AI SDK `streamText` to deliver Server-Sent Events (SSE) grounded in active source text and prior structured analysis. | Implement `app/api/chat/route.ts` with `streamText`, `anthropic('claude-3-5-sonnet-20241022')`, context grounding payload, and `toUIMessageStreamResponse()`. |
| **CHAT-02** | Slide-in `ChatPanel` drawer component uses `@ai-sdk/react`'s `useChat` hook to render streaming responses with sub-2s time-to-first-token. | Implement `components/chat/ChatPanel.tsx` using `useChat` with `DefaultChatTransport`, bottom-right Floating Action Button (FAB), and StickyNav trigger. |
| **CHAT-03** | Chat responses cite specific clauses or sections when answering follow-up questions and explicitly state when an answer is not addressed in the source document. | Enforce system prompt epistemic boundaries (omission detection) + bracketed citation syntax `[Clause X: Title]` rendered as JetBrains Mono gold badges. |
| **CORE-03** | Universal export tools allow one-click copy of the complete structured report to clipboard and formatted plain-text download. | Implement `lib/export-utils.ts` formatters (Markdown, Plain Text, JSON) + dual placement in StickyNav header and `ExportDossierCard` footer. |
| **CORE-01** | UI implements dark-mode legal aesthetic with typography (DM Serif Display, DM Sans, JetBrains Mono) and gold accents. | Integrate Obsidian `#0B0F17`, Legal Gold `#D4AF37`, and slate border `#1E293B` styling consistently across `ChatPanel` and `ExportDossierCard`. |
| **CORE-02** | Mandatory non-dismissible legal disclaimer is present on all analysis screens, chat drawers, and page footers. | Include persistent gold shield disclaimer banner in `ChatPanel` header and mandatory statutory compliance header in all exported documents. |
| **CORE-04** | Ephemeral in-memory processing guarantees zero server-side file or database persistence. | Memory-only request payload handling in `/api/chat`; chat history remains purely in client state (`useChat`). |

---

## Architectural Responsibility Map

```
app/
├── api/
│   └── chat/
│       └── route.ts                 <-- [NEW] Server-Sent Events (SSE) streaming route
lib/
├── export-utils.ts                  <-- [NEW] Markdown, Plain Text, and JSON formatters + download/copy helpers
components/
├── chat/
│   ├── ChatPanel.tsx                <-- [NEW] Slide-over right drawer / full-screen mobile sheet
│   └── ChatTriggerButton.tsx        <-- [NEW] Fixed bottom-right Floating Action Button (FAB)
├── export/
│   └── ExportDossierCard.tsx        <-- [NEW] Dossier footer card with copy & multi-format download buttons
├── decoder/
│   └── StickyNav.tsx                <-- [MODIFY] Add "Ask Gavel" button & "Export" dropdown menu
├── situation/
│   └── SituationStickyNav.tsx       <-- [MODIFY] Add "Ask Gavel" button & "Export" dropdown menu
├── comparison/
│   └── ComparisonStickyNav.tsx      <-- [MODIFY] Add mobile responsiveness, "Ask Gavel", & "Export" actions
app/analyze/
├── document/page.tsx                <-- [MODIFY] Mount ChatPanel, FAB, and ExportDossierCard
├── situation/page.tsx               <-- [MODIFY] Mount ChatPanel, FAB, and ExportDossierCard
└── compare/page.tsx                 <-- [MODIFY] Mount ChatPanel, FAB, and ExportDossierCard
tests/
├── chat-route.test.ts               <-- [NEW] Vitest unit test suite for /api/chat route
├── export-utils.test.ts             <-- [NEW] Vitest unit test suite for report formatters & download helpers
└── chat-components.test.ts          <-- [NEW] Component rendering tests for ChatPanel & ExportDossierCard
```

---

## Standard Stack & Dependencies Audit

### 1. Vercel AI SDK Core & React Hook Compatibility
- **Installed in Codebase:** `ai: ^7.0.107` and `@ai-sdk/anthropic: ^4.0.58`.
- **Note on AI SDK Version Scheme:** In `ai` 7.x (the current modern release), UI components are decoupled into `@ai-sdk/react`:
  - Client hook: `import { useChat } from '@ai-sdk/react'`
  - Transport: `import { DefaultChatTransport, type UIMessage } from 'ai'`
  - Server streaming method: `result.toUIMessageStreamResponse()`
  - Message conversion: `await convertToModelMessages(messages)`
- **Dependencies to install:**
  - `@ai-sdk/react`: `^4.0.112` (peer compatible with React 18 and `ai: 7.x`).
  - `react-markdown`: `^10.1.0` (pure ESM, compatible with React 18 and Next.js 14 App Router).
  *(User approval was already granted in Phase 5 Discuss Phase, Decision D-08).*

### 2. Sonner Toast Integration
- `sonner: ^2.0.8` is already installed and registered in `app/layout.tsx` (`<Toaster />`).
- Toast feedback for clipboard copy can immediately use `toast.success("Report copied to clipboard in Markdown format")` with zero extra configuration.

---

## Architecture Patterns & Implementation Details

### 1. `/api/chat/route.ts` Streaming SSE Architecture

#### Route Configuration
```ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
```

#### Request Payload Contract
```ts
export interface ChatContextPayload {
  mode: 'document' | 'situation' | 'compare';
  text?: string;               // Source text (truncated to 50k chars if oversized)
  analysis?: unknown;          // DocumentAnalysis | SituationAnalysis | Comparison
  documentType?: string;       // E.g. "Residential Lease Agreement"
  parties?: string[];          // Contracting parties
}

export interface ChatRequestBody {
  messages: UIMessage[];
  context?: ChatContextPayload;
}
```

#### Grounding & System Prompt Engineering
The system prompt must embed:
1. **Persona & Role:** Objective legal intelligence assistant providing educational information and legal comprehension under the Advocates Act, 1961.
2. **Negative Constraints (Non-UPL):**
   - NEVER say "you should", "you must", or prescribe legal strategies.
   - Use educational phrasing: *"People facing this provision often consider...", "Clause X states that...", "In consumer disputes, courts typically evaluate..."*.
   - Never assert that a clause is definitively invalid or illegal; instead, explain standard legal tests and suggest asking licensed counsel.
3. **Strict Epistemic Omission Handling (D-06):**
   - If the user asks about a subject, remedy, penalty, or condition that is NOT present in the source text, Claude must explicitly declare:
     `"This document does not address [topic]. Typically, agreements of this type include [standard terms], but because it is omitted here, it is advisable to ask legal counsel how your rights are protected."`
4. **Citation Syntax (D-07):**
   - Direct Claude to cite exact clauses using bracketed format: `[Clause X: Title]` or `[Section Y]`.
   - The frontend will parse and render these as gold JetBrains Mono badges.
5. **Length & Formatting:**
   - Concise answers: 2–4 focused paragraphs or structured bullet lists.
6. **Injected Context:**
   - Mode identifier (`DOCUMENT`, `SITUATION`, or `COMPARISON`).
   - Source text (truncated at 50,000 characters with notice `[Source text truncated to 50,000 characters for context efficiency]`).
   - Complete structured analysis JSON.

#### Route Handler Implementation
```ts
import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'CONFIG_ERROR', message: 'Anthropic API key is not configured.' },
      { status: 500 }
    );
  }

  let body: { messages?: UIMessage[]; context?: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Malformed JSON payload.' },
      { status: 400 }
    );
  }

  const { messages, context } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Messages array is required.' },
      { status: 400 }
    );
  }

  const modelMessages = await convertToModelMessages(messages);
  const truncatedText = context?.text
    ? context.text.length > 50000
      ? context.text.slice(0, 50000) + '\n\n[...Source text truncated to 50,000 characters]'
      : context.text
    : 'No raw text provided.';

  const system = buildChatSystemPrompt({
    mode: context?.mode || 'document',
    sourceText: truncatedText,
    analysisJson: context?.analysis ? JSON.stringify(context.analysis, null, 2) : 'No prior analysis provided.',
  });

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
```

---

### 2. Frontend Streaming Hook & ChatPanel Component

#### Hook Configuration with `DefaultChatTransport`
```tsx
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

const transport = useMemo(
  () =>
    new DefaultChatTransport({
      api: '/api/chat',
      body: { context },
    }),
  [context]
);

const { messages, sendMessage, status, stop, setMessages } = useChat({
  transport,
});
```

#### Layout & Responsiveness
- **Desktop/Tablet (>=640px):** Fixed slide-over drawer on the right edge (`w-[460px] lg:w-[500px]`, `h-full`, `z-50`, `bg-[#0B0F17]`, border `border-l border-[#1E293B]`, shadow `shadow-2xl`).
- **Mobile (<640px):** Full-screen sheet modal (`fixed inset-0 z-50 bg-[#0B0F17] flex flex-col`).
- **Backdrop Overlay:** `fixed inset-0 bg-black/60 backdrop-blur-sm z-40` with click-to-close listener.
- **Top Disclaimer Banner:** Persistent compact banner at top of drawer:
  - Gold shield icon (`ShieldAlert` or `ShieldCheck`).
  - Text: *"Legal Information Only · Not Formal Legal Counsel · Advocates Act, 1961"*.
- **Drawer Header:**
  - Title: "Gavel Assistant" with context badge (`Document`, `Situation`, or `Comparison`).
  - Reset action: "Clear chat" icon button (`RotateCcw`) with tooltip.
  - Close action: Close button (`X`).

#### Mode-Specific Starter Prompt Chips (D-02)
Rendered in empty chat state (`messages.length === 0`), auto-submitting on click:
- **Mode 1 (Document Decoder):**
  - "Can I terminate early without penalty?"
  - "What are the biggest financial or liability risks?"
  - "What happens if either party breaches this agreement?"
  - "What should I negotiate before signing?"
- **Mode 2 (Situation Navigator):**
  - "What is my immediate statutory deadline?"
  - "Should I consult a licensed lawyer now?"
  - "What evidence or documents are most critical to preserve?"
  - "What procedural steps can I handle myself?"
- **Mode 3 (Document Comparison):**
  - "Which agreement favors me overall, and why?"
  - "What are the most critical inconsistencies between versions?"
  - "Which clauses should I push back on immediately?"
  - "Are there any hidden traps introduced in the revision?"

#### Rich Markdown & Citation Chip Rendering (D-03, D-07)
Using `react-markdown`, render markdown elements cleanly while styling inline bracketed citations (`[Clause X: Title]`, `[Section Y]`):
```tsx
function parseCitationText(content: string) {
  const parts = content.split(/(\[(?:Clause|Section|Article|Statute)[^\]]+\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <span
          key={i}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-mono font-medium bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 tracking-tight"
        >
          {part}
        </span>
      );
    }
    return part;
  });
}
```

#### Dual Triggers (D-01)
1. **Floating Action Button (FAB):** Docked at `bottom-6 right-6 z-40`, styled with Legal Gold gradient, `MessageSquareText` icon, and "Ask Gavel" label. Only rendered when in `'dossier'` state.
2. **StickyNav Header Trigger:** Prominent button labeled "Ask Gavel" placed in the sticky navigation header across all modes.

---

### 3. Universal Export Tooling (`lib/export-utils.ts` & `ExportDossierCard.tsx`)

#### Formatted Markdown (`.md`) Structure
All exports begin with the statutory legal disclaimer header:
```markdown
══════════════════════════════════════════════════════════════════════════
GAVEL LEGAL INTELLIGENCE REPORT
Generated: 2026-09-22 20:45:00 UTC
CONFIDENTIAL & PRIVILEGED PREPARATION MATERIAL
══════════════════════════════════════════════════════════════════════════

DISCLAIMER & REGULATORY NOTICE:
This report is generated by Gavel for informational, educational, and
consultation preparation purposes only. Gavel is an artificial intelligence
system and is NOT a law firm, advocate, or licensed legal practitioner.
Nothing in this document constitutes legal advice, legal opinion, or an
attorney-client relationship. Statutory guidance complies with the Advocates
Act, 1961. Always consult a licensed attorney or advocate for legal matters.
══════════════════════════════════════════════════════════════════════════
```

#### Mode-Specific Content Structure
- **Mode 1 (Document Decoder):**
  1. Metadata (Document Classification, File Name, Contracting Parties).
  2. Executive Plain-English Summary.
  3. Risk Scorecard: Clauses categorized by High Risk (🔴), Caution (🟡), and Standard (🟢), detailing title, risk rationale, obligation target, simplified plain-English meaning, and verbatim original excerpt.
  4. Actionable Checklist: Grouped by Timing (Immediate, Before Signing, After Signing) with Action Type (Negotiate, Verify, Refuse, Accept) and related clause cross-references.
  5. Lawyer Consultation Preparation Guide: Targeted, high-leverage questions with rationale and clause links.
- **Mode 2 (Situation Navigator):**
  1. Metadata (Dispute Domain, Date Analyzed, Resolution Horizon).
  2. Critical Limitation & Notice Deadlines (prominent warning box).
  3. Situation Summary narrative.
  4. Identified Statutory Rights (Title, Explanation, Statute / Doctrine Reference).
  5. Procedural Roadmap (Urgency tiers: Immediate, 7 Days, 30 Days, When Ready; with self-representation badges).
  6. Evidence & Documents to Gather (Item, Evidentiary Purpose / Why Rationale).
  7. When to Retain Counsel (Escalation thresholds).
- **Mode 3 (Document Comparison):**
  1. Metadata (Document A vs. Document B, Date Analyzed).
  2. Overall Favorability Verdict & Rationale.
  3. Favorability Metrics (Clauses favoring A, Clauses favoring B, Critical Inconsistencies).
  4. Clause-by-Clause Differences (Category, Favors, Risk, Doc A Excerpt, Doc B Excerpt, Analysis Notes).
  5. Contradictions & Inconsistencies (Title, Severity, Conflict Description).
  6. Negotiation Strategy Guide (Push Back, Accept As-Is, Flag for Lawyer, Overall Strategy).

#### Clean Plain Text (`.txt`) Structure
Clean ASCII formatting using standard headers (`===`, `---`, `*`, `[ ]`), optimized for printing, plain text editors, email bodies, or messaging.

#### Download & Copy Helpers
- `downloadFile(content: string, filename: string, mimeType: string): void`: Ephemeral `Blob` creation with `URL.createObjectURL(blob)`, programmatic anchor click, and cleanup via `URL.revokeObjectURL(url)`.
- `copyToClipboard(content: string): Promise<boolean>`: Modern `navigator.clipboard.writeText(content)` with fallback to textarea selection.

#### Export UI Placement (D-09)
1. **StickyNav Header:** "Export" button or dropdown with "Copy Markdown", "Download .MD", "Download .TXT", "Download .JSON".
2. **`ExportDossierCard` Component:** Prominently positioned at the footer of each dossier report (above or beside the legal disclaimer card). Features large action buttons:
   - Primary: "Copy Dossier (Markdown)" with instant checkmark state and toast.
   - Secondary: "Download Markdown (.md)", "Download Plain Text (.txt)", "Download Raw Data (.json)".

---

### 4. Mobile Polish, Touch Targets & Responsive Audit

#### StickyNav Responsive Hardening
- **Horizontal Scroll Rail:** Add `-webkit-overflow-scrolling: touch`, `overflow-x-auto`, `no-scrollbar` to the anchor rail across all sticky navbars.
- **Comparison Mode Mobile Parity:** Currently `ComparisonStickyNav.tsx` is an `<aside className="hidden lg:flex">`. For Phase 5, add a mobile/tablet responsive sticky top nav bar (matching Mode 1 & 2) when viewport is `< 1024px`, ensuring mobile users can jump between Verdict, Differences, Inconsistencies, and Negotiation Guide without endless scrolling.
- **Action Chips:** Compact icon-plus-label chips for "Export" and "Ask Gavel".

#### Touch Targets & Safe Area Insets (D-15)
- All interactive buttons, chips, and triggers must satisfy a minimum touch target size of **44x44px** (or have appropriate hit-area padding `min-h-[44px]`).
- Fixed bottom elements (FAB, chat input area, bottom sticky bars) must include iOS safe area inset padding:
  `pb-[max(1rem,env(safe-area-inset-bottom))]` and `mb-[env(safe-area-inset-bottom)]`.
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:outline-none`.

---

## Don't Hand-Roll & Common Pitfalls

| Feature | Don't Hand-Roll | Use Instead | Why |
|---------|-----------------|-------------|-----|
| Chat Streaming Protocol | Custom fetch ReadableStream decoder | Vercel AI SDK `useChat` + `DefaultChatTransport` | Handles reconnections, chunk boundary decoding, abort signals, and React state reconciliation automatically. |
| Toast Notifications | Custom floating alert `div`s with setTimeout | Sonner (`toast.success`) | Sonner is already installed and configured in `RootLayout`. Handles stacking, accessibility, and dismissal animations. |
| Markdown Rendering | Regex HTML string replacements with `dangerouslySetInnerHTML` | `react-markdown` | Prevents XSS vulnerabilities from untrusted model outputs and properly handles code blocks, nested lists, and inline formatting. |
| File Downloads | Backend file generation endpoints | In-browser client Blob download (`URL.createObjectURL`) | Adheres strictly to Gavel's zero-persistence posture; server never writes exported files to disk or storage. |

### Common Pitfalls
1. **Stale Context Payload in Chat:** In AI SDK 5.0, `DefaultChatTransport` resolves `body` when creating requests. Wrapping `transport` in a `useMemo` that dependencies on `context` ensures the latest document analysis is always transmitted with new chat queries.
2. **Missing Chat Scroll Auto-Anchor:** Streaming tokens rapid-fire can displace the user's viewport. The message container must use an automatic scroll-to-bottom effect when streaming (`useRef` + `scrollIntoView({ behavior: 'smooth' })`).
3. **Overriding User Scroll:** If a user scrolls up to read a previous message while the model is still streaming, auto-scrolling to bottom on every token will fight the user. Track user scroll position (`isAtBottom` state) and only auto-scroll if the user is already near the bottom.
4. **Mobile Virtual Keyboard Covering Input:** On iOS Safari, the virtual keyboard pushes viewport contents up. Setting the mobile chat sheet to `fixed inset-0` with `flex flex-col` and using `dvh` (dynamic viewport height `h-[100dvh]`) prevents input obscuration.

---

## Concrete Code Blueprints

### Blueprint 1: `/api/chat/route.ts`
```ts
import { NextRequest, NextResponse } from 'next/server';
import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { buildChatSystemPrompt } from '@/lib/prompts/chat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'CONFIG_ERROR', message: 'Anthropic API key is not configured.' },
      { status: 500 }
    );
  }

  let body: { messages?: UIMessage[]; context?: any };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Malformed JSON payload.' },
      { status: 400 }
    );
  }

  const { messages, context } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Messages array is required.' },
      { status: 400 }
    );
  }

  const modelMessages = await convertToModelMessages(messages);

  // Truncate raw text to 50k characters if oversized (D-05)
  const rawText = typeof context?.text === 'string' ? context.text : '';
  const truncatedText = rawText.length > 50000
    ? rawText.slice(0, 50000) + '\n\n[...Source text truncated to 50,000 characters]'
    : rawText;

  const system = buildChatSystemPrompt({
    mode: context?.mode || 'document',
    sourceText: truncatedText,
    analysisJson: context?.analysis ? JSON.stringify(context.analysis, null, 2) : '',
    documentType: context?.documentType,
  });

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system,
    messages: modelMessages,
  });

  return result.toUIMessageStreamResponse();
}
```

### Blueprint 2: `lib/prompts/chat.ts`
```ts
export function buildChatSystemPrompt({
  mode,
  sourceText,
  analysisJson,
  documentType,
}: {
  mode: 'document' | 'situation' | 'compare';
  sourceText: string;
  analysisJson: string;
  documentType?: string;
}): string {
  return `You are Gavel, an AI legal intelligence assistant helping a user understand their specific legal document or situation.

NON-UPL COMPLIANCE & LEGAL SAFETY DIRECTIVES (MANDATORY):
- Gavel provides educational and informational assistance only. You are NOT a lawyer, and your answers do NOT constitute legal advice or formal attorney-client representation.
- NEVER provide prescriptive directives: do NOT say "you should", "you must", "file a lawsuit", or "this is illegal".
- ALWAYS use objective, informational framing: "typically in these agreements...", "statutory provisions such as X provide...", "courts have generally held...", "it is advisable to discuss with licensed legal counsel...".

STRICT EPISTEMIC OMISSION RULE:
- If the user asks about a clause, provision, right, or topic that is NOT addressed or omitted in the source document or situation text, you MUST explicitly state:
  "This document does not address [topic]."
- Follow this by objectively explaining what is customary in such agreements and recommending that the user consult a licensed advocate to protect their interests on this omitted term.

CITATION SYNTAX:
- Ground your answers in the source material.
- Whenever citing a specific clause, provision, or section, format the reference in brackets like: [Clause X: Title] or [Section Y].
- The user interface renders these brackets as distinct gold monospace citation badges.

RESPONSE FORMATTING:
- Keep answers concise, direct, and readable (2 to 4 short paragraphs maximum or bullet points).
- Plain English translation: Avoid dense legalese.

ACTIVE CONTEXT:
- Mode: ${mode.toUpperCase()}
${documentType ? `- Document Classification: ${documentType}` : ''}

SOURCE TEXT:
${sourceText || 'No source text provided.'}

PRIOR STRUCTURED ANALYSIS:
${analysisJson || 'No structured analysis provided.'}`;
}
```

### Blueprint 3: `lib/export-utils.ts` Excerpt
```ts
export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  return Promise.resolve(false);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
```

---

## Validation Architecture (Dimension 8)

The test suite will use **Vitest** (running via `npm test` or `vitest --run`).

### 1. Route Tests (`tests/chat-route.test.ts`)
- **Config & Auth:** Verifies that missing `ANTHROPIC_API_KEY` yields `500 CONFIG_ERROR`.
- **Validation:** Verifies that malformed JSON or empty `messages` yields `400 INVALID_REQUEST`.
- **System Prompt Inspection:**
  - Asserts non-UPL epistemic guardrails are present in the system prompt.
  - Asserts epistemic omission rule (`"This document does not address"`) is in the system prompt.
  - Asserts bracketed citation syntax (`[Clause X: Title]`) directive is present.
  - Verifies text truncation at 50,000 characters.
  - Verifies prior analysis JSON serialization.
- **Streaming Response:** Verifies `toUIMessageStreamResponse()` returns an SSE `Response` with `content-type: text/event-stream`.

### 2. Export Utility Tests (`tests/export-utils.test.ts`)
- **Mode 1 Decoder:** Tests `formatDocumentMarkdown` and `formatDocumentPlainText` for:
  - Statutory disclaimer banner header.
  - Document metadata & executive summary.
  - Risk Scorecard tiers (High 🔴, Caution 🟡, Standard 🟢) with reasons and original excerpts.
  - Action checklist grouped by timing (Immediate, Before Signing, After Signing).
  - Lawyer consultation questions.
- **Mode 2 Navigator:** Tests `formatSituationMarkdown` and `formatSituationPlainText` for:
  - Statutory disclaimer banner header.
  - Dispute category & estimated timeline.
  - Statutory rights & doctrines.
  - Urgency roadmap steps & "Doable without lawyer" indicator.
  - Evidence gathering checklist with why rationale.
  - When to call a lawyer triggers & deadline flags.
- **Mode 3 Comparison:** Tests `formatComparisonMarkdown` and `formatComparisonPlainText` for:
  - Statutory disclaimer banner header.
  - Overall favorability verdict & metrics.
  - Clause difference table.
  - Inconsistencies & contradictions.
  - Negotiation guide (Push Back, Accept As-Is, Flag for Lawyer).
- **Blob & Download Mechanics:** Verifies filename sanitization and MIME types (`text/markdown`, `text/plain`, `application/json`).

### 3. Component Tests (`tests/chat-components.test.ts`)
- **ChatPanel Empty State:** Verifies rendering of starter prompt chips, persistent disclaimer banner, and input box.
- **Citation Parsing:** Verifies that bracketed strings `[Clause 4.2: Termination]` are identified and wrapped in badge elements.
- **ExportDossierCard:** Verifies rendering of Markdown copy button and multi-format download buttons across all three analysis modes.

### 4. End-to-End Verification Pipeline
1. Run full Vitest suite: `npm test -- --run` (all 14 existing test files + 3 new test suites must pass).
2. Run TypeScript build typecheck: `npm run build` or `npx tsc --noEmit` to guarantee zero type errors.

---

## Sources

- Vercel AI SDK Core Documentation (`streamText`, `convertToModelMessages`, `toUIMessageStreamResponse`) — Verified compatibility with `ai: ^7.0.107`.
- Vercel AI SDK UI Documentation (`useChat`, `DefaultChatTransport`, `UIMessage`) — AI SDK 5.0 transport architecture verified in `node_modules/ai/docs`.
- Advocates Act 1961 §§ 29 & 33 — Epistemic non-UPL compliance boundaries.
- Sonner Documentation — Dark mode toast integration with Tailwind CSS.

---

## Metadata

- **Author:** GSD Phase Researcher
- **Phase:** 05-mode-4-contextual-q-a-export-tools-universal-polish
- **Target Branch:** `phase-5-mode-4-contextual-qa-export-polish`
- **Date:** 2026-09-22

---

## RESEARCH COMPLETE
