# Architecture Research

**Domain:** GenAI Legal Assistance Platform (LegalTech / Citizen Guidance)  
**Researched:** 2026-09-21  
**Confidence:** HIGH  

---

## Standard Architecture

Gavel is architected as an ephemeral, privacy-first, full-stack Next.js application leveraging the App Router, Vercel AI SDK 3.x, Anthropic Claude 3.5 Sonnet, and Zod schema-driven structured generation. 

It processes sensitive legal documents and citizen dispute narratives strictly in-memory (zero server-side disk persistence, zero database, zero PII collection).

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  PRESENTATION & CLIENT STATE TIER                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Next.js 14+ App Router (Client Components)                                                     │
│                                                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────────────┐  │
│  │   /analyze/document     │  │   /analyze/situation    │  │       /analyze/compare          │  │
│  │   (Mode 1: Doc Decoder) │  │   (Mode 2: Navigator)   │  │       (Mode 3: Comparison)      │  │
│  └────────────┬────────────┘  └────────────┬────────────┘  └────────────────┬────────────────┘  │
│               │                            │                                │                   │
│  ┌────────────▼────────────────────────────▼────────────────────────────────▼────────────────┐  │
│  │ Ephemeral Client State (React useState / useReducer / useChat Context)                    │  │
│  │ - Extracted Document Text(s)    - Structured Analysis Results    - Conversation History   │  │
│  └─────────────────────────────────────────┬─────────────────────────────────────────────────┘  │
│                                            │                                                    │
│  ┌─────────────────────────────────────────▼─────────────────────────────────────────────────┐  │
│  │ Interactive Q&A Slide-in Drawer (`ChatPanel.tsx` via `@ai-sdk/react` useChat)             │  │
│  └─────────────────────────────────────────┬─────────────────────────────────────────────────┘  │
├────────────────────────────────────────────┼────────────────────────────────────────────────────┤
│                                            │ HTTP POST (FormData / JSON)                        │
├────────────────────────────────────────────▼────────────────────────────────────────────────────┤
│                                  API ROUTE & INGESTION TIER (Node.js)                           │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Next.js Server API Routes (`app/api/*`)                                                        │
│                                                                                                 │
│  ┌────────────────────────────────┐  ┌───────────────────────────────────────────────────────┐  │
│  │ /api/upload                    │  │ /api/analyze/[document|situation|compare]             │  │
│  │ - Buffer extraction            │  │ - Payload validation & prompt construction            │  │
│  │ - pdf-parse / mammoth          │  │ - Vercel AI SDK `generateObject()`                    │  │
│  │ - text-utils `cleanText()`     │  │ - Strict Zod schema enforcement                       │  │
│  └────────────────────────────────┘  └──────────────────────────┬────────────────────────────┘  │
│                                                                 │                               │
│  ┌──────────────────────────────────────────────────────────────▼────────────────────────────┐  │
│  │ /api/chat                                                                                 │  │
│  │ - Contextual anchoring (`context: { text, analysis }`)                                     │  │
│  │ - Vercel AI SDK `streamText()` -> SSE `toDataStreamResponse()`                            │  │
│  └──────────────────────────────────────────────┬────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│                                                 │ Type Inference & Prompts Contract             │
│                                      ┌──────────▼──────────┐                                    │
│                                      │ Shared Schema Layer │                                    │
│                                      │ `lib/schemas.ts`    │                                    │
│                                      │ `lib/prompts.ts`    │                                    │
│                                      └──────────┬──────────┘                                    │
├─────────────────────────────────────────────────┼───────────────────────────────────────────────┤
│                                                 │ Anthropic API SDK                             │
├─────────────────────────────────────────────────▼───────────────────────────────────────────────┤
│                                    FOUNDATIONAL MODEL TIER                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Anthropic Claude 3.5 Sonnet (`claude-sonnet-4-6`)                                              │
│  - 200k token context window for full-contract reasoning                                        │
│  - Tool/schema calling for deterministic Zod object generation                                  │
│  - Native Vision support (Base64) for document image analysis                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **`app/page.tsx`** | Mode selection hub; introduces Gavel, sets expectations, routes to Mode 1, 2, or 3. | Server Component with client interaction cards and universal legal disclaimer. |
| **`app/analyze/document/page.tsx`** | Mode 1 controller: coordinates file upload, text extraction, analysis dispatch, and multi-layer results display. | Client Component managing upload status, extracted text, analysis state, and chat drawer. |
| **`app/analyze/situation/page.tsx`** | Mode 2 controller: coordinates situation narrative input, length validation, categorization, and roadmap display. | Client Component managing narrative input, validation warnings, analysis state, and chat drawer. |
| **`app/analyze/compare/page.tsx`** | Mode 3 controller: coordinates dual-document upload, parallel extraction, diff generation, and comparison view. | Client Component managing dual upload slots (`docA`, `docB`), labels, comparison results, and chat drawer. |
| **`components/FileUpload.tsx`** | Drag-and-drop file target supporting PDF, DOCX, JPG, PNG up to 10MB; performs client-side MIME/size validation. | React dropzone / native file input with drag states and fallback manual paste toggle. |
| **`components/RiskScorecard.tsx`** | Visual clause breakdown categorized by traffic-light risk (High 🔴, Caution 🟡, Standard 🟢); displays plain-English translation and expandable original verbatim clause. | Radix Accordion / Tailwind cards with risk badges and obligation tags. |
| **`components/Checklist.tsx`** | Action items grouped by timing (`immediate`, `before-signing`, `after-signing`) with concrete action tags (`negotiate`, `verify`, `refuse`, `accept`). | Filterable interactive checklist with copyable action cards. |
| **`components/NextStepsTimeline.tsx`**| Ordered dispute resolution roadmap with urgency indicators (`immediate`, `within-7-days`, `within-30-days`, `when-ready`) and "doable without a lawyer" flags. | Vertical timeline component with urgency color coding. |
| **`components/ComparisonTable.tsx`**| Side-by-side clause differences with favorability tags (`docA`, `docB`, `neutral`) and risk ratings. | Responsive grid/table displaying Document A vs Document B excerpts side by side. |
| **`components/ChatPanel.tsx`** | Contextual Q&A slide-in panel/drawer allowing follow-up queries against the active document/situation analysis. | Slide-over drawer using `@ai-sdk/react` (`useChat`), streaming tokens via SSE. |
| **`components/Disclaimer.tsx`** | Mandatory prominent legal disclaimer stating educational purpose and absence of attorney-client relationship. | Universal reusable component embedded in page footers, analysis headers, and exported reports. |
| **`lib/schemas.ts`** | Single source of truth: Zod schemas for all structured outputs (`DocumentAnalysisSchema`, `SituationAnalysisSchema`, `ComparisonSchema`). | Exported Zod schemas and inferred TypeScript types (`z.infer<T>`). |
| **`lib/prompts.ts`** | Carefully engineered legal analyst system prompts enforcing plain-English translation, disclaimers, and objective wording ("people often...", avoiding "you should"). | Exported system prompt templates with variable interpolation. |
| **`lib/text-utils.ts`** | Text sanitization, non-printable character removal, whitespace normalization, token estimation, and document chunking. | Pure utility functions executing in both Node.js and browser runtimes. |
| **`app/api/upload/route.ts`** | In-memory text extraction from multipart `FormData`; runs `pdf-parse` for PDFs, `mammoth` for DOCX, or base64 encodes images. | Next.js Node.js runtime Route Handler (cannot run in Edge due to Node buffer requirements). |
| **`app/api/analyze/*`** | Endpoints that invoke Vercel AI SDK `generateObject` with Claude 3.5 Sonnet and the corresponding Zod schema. | Next.js Node.js Route Handlers returning typed JSON. |
| **`app/api/chat/route.ts`** | Streaming Q&A endpoint receiving conversation history + contextual payload; invokes `streamText`. | Next.js Edge or Node.js Route Handler returning `toDataStreamResponse()`. |

---

## Recommended Project Structure

```
gavel/
├── app/
│   ├── layout.tsx                      # Global layout (DM Serif Display, DM Sans, JetBrains Mono, Theme)
│   ├── page.tsx                        # Homepage — 3 mode cards + legal banner
│   ├── globals.css                     # Tailwind styles & design tokens (gold, red, yellow, green)
│   ├── analyze/
│   │   ├── document/
│   │   │   └── page.tsx                # Mode 1: Document Decoder (Upload -> Results -> Chat)
│   │   ├── situation/
│   │   │   └── page.tsx                # Mode 2: Situation Navigator (Narrative -> Roadmap -> Chat)
│   │   └── compare/
│   │       └── page.tsx                # Mode 3: Document Comparison (Dual Upload -> Diff Matrix -> Chat)
│   └── api/
│       ├── upload/
│       │   └── route.ts                # In-memory file extraction (pdf-parse, mammoth, image base64)
│       ├── analyze/
│       │   ├── document/
│       │   │   └── route.ts            # generateObject() with DocumentAnalysisSchema
│       │   ├── situation/
│       │   │   └── route.ts            # generateObject() with SituationAnalysisSchema
│       │   └── compare/
│       │       └── route.ts            # generateObject() with ComparisonSchema (2-pass fallback)
│       └── chat/
│           └── route.ts                # streamText() with conversation history + analysis context
├── components/
│   ├── FileUpload.tsx                  # Drag-and-drop zone with client validation + paste fallback
│   ├── RiskScorecard.tsx               # High/Caution/Standard clause cards with expandable original text
│   ├── Checklist.tsx                   # Priority-grouped action items (Immediate, Before/After Signing)
│   ├── LawyerQuestions.tsx             # Copyable 5-8 tailored consultation questions
│   ├── SituationInput.tsx              # Textarea with live word count & <20 word pre-submit prompt
│   ├── RightsAccordion.tsx             # Expandable citizen legal rights cards
│   ├── NextStepsTimeline.tsx           # Urgency-coded dispute roadmap with "No lawyer needed" tags
│   ├── DocumentsChecklist.tsx          # Interactive "Documents to Gather" checklist
│   ├── ComparisonTable.tsx             # Side-by-side clause diff matrix with favorability verdicts
│   ├── NegotiationGuide.tsx            # Push Back / Accept / Flag for Lawyer category groups
│   ├── ChatPanel.tsx                   # Slide-in slide-over drawer with streaming AI chat
│   ├── Disclaimer.tsx                  # Universal legal disclaimer banner & footer
│   ├── ExportActions.tsx               # "Copy to Clipboard" and "Download Report (.txt/.md)"
│   └── ui/                             # shadcn / Radix primitives (button, badge, accordion, dialog)
├── lib/
│   ├── schemas.ts                      # Single source of truth: Zod schemas for AI outputs & API bodies
│   ├── prompts.ts                      # System prompts for Decoder, Navigator, Compare, and Chat
│   ├── text-utils.ts                   # cleanText(), sanitizeInput(), estimateTokens(), chunkText()
│   └── anthropic.ts                    # Configured Anthropic AI model instance
├── types/
│   └── index.ts                        # Inferred TypeScript types (DocumentAnalysis, SituationAnalysis, etc.)
├── public/                             # Static assets, icons, fonts
├── tailwind.config.ts                  # Design system colors (gold: #C9A55C, bg: #0B0B0F, cards: #13131A)
├── package.json                        # Dependencies
├── tsconfig.json                       # Path aliases (@/*)
└── .env.local                          # ANTHROPIC_API_KEY
```

### Structure Rationale

- **`app/analyze/[mode]/page.tsx`:** Dedicating a route to each mode enables clean URL navigation (`/analyze/document`, `/analyze/situation`, `/analyze/compare`), distinct state lifecycles, and isolated component loading without heavy state mashups on the root route.
- **`app/api/upload/route.ts` vs `app/api/analyze/*`:** File extraction is separated from LLM generation. This allows:
  1. Instant user feedback on text extraction before starting a 10-15s LLM generation.
  2. Fallback to manual text editing/verification if parsing encounters strange characters.
  3. Re-use of the upload endpoint by both Mode 1 (single upload) and Mode 3 (dual parallel uploads).
- **`lib/schemas.ts` as the Canonical Contract:** Placing Zod schemas in a dedicated file imported by both server API routes and client UI types prevents drift between what Claude generates and what React components render.
- **`components/ui/` vs domain components:** Separating generic UI atoms (Radix buttons, dialogs, badges) from legal domain components (`RiskScorecard`, `NegotiationGuide`, `NextStepsTimeline`) ensures rapid assembly and clean component boundaries.

---

## Architectural Patterns

### Pattern 1: Schema-First Deterministic Structured Generation

**What:** Instead of generating free-form Markdown and using regex or fragile JSON parsing, Gavel uses Vercel AI SDK's `generateObject()` paired with Anthropic Claude 3.5 Sonnet's tool-calling capability to guarantee 100% compliant Zod schema output.  
**When to use:** Modes 1, 2, and 3 where the UI requires strict structured rendering (risk badges, checklists, timelines, side-by-side matrices).  
**Trade-offs:** Structured generation has a slightly higher latency than raw text streaming (takes 8–14 seconds for large contracts), but eliminates client-side parsing failures, unclosed tags, and hallucinated JSON keys.

**Example:**
```typescript
// app/api/analyze/document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { DocumentAnalysisSchema } from '@/lib/schemas'
import { DOCUMENT_SYSTEM_PROMPT } from '@/lib/prompts'

export const runtime = 'nodejs' // Required for stable timeouts and crypto
export const maxDuration = 60    // Allow up to 60s for comprehensive contract analysis

export async function POST(req: NextRequest) {
  try {
    const { text, metadata } = await req.json()
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'NO_TEXT_PROVIDED' }, { status: 400 })
    }

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: DocumentAnalysisSchema,
      system: DOCUMENT_SYSTEM_PROMPT,
      prompt: `Analyze this legal document thoroughly:\n\n${text}`,
    })

    return NextResponse.json(object)
  } catch (err: any) {
    console.error('Document analysis error:', err)
    return NextResponse.json({ error: 'ANALYSIS_FAILED', message: err.message }, { status: 500 })
  }
}
```

---

### Pattern 2: Ephemeral In-Memory File Processing

**What:** Files sent to `/api/upload` are received as `FormData`, converted to in-memory Node `Buffer` objects, extracted via `pdf-parse` or `mammoth`, and immediately released from memory.  
**When to use:** All file uploads (PDF, DOCX, images).  
**Trade-offs:** Server cannot re-read the file later if the user refreshes (must re-upload); in return, Gavel gains absolute zero-PII liability, zero cloud storage cost (no AWS S3 / Supabase Storage required), and compliance with strict legal confidentiality standards.

**Example:**
```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { cleanText } from '@/lib/text-utils'

export const runtime = 'nodejs' // Node.js required for pdf-parse buffer handling

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'NO_FILE' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'TOO_LARGE' }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let extractedText = ''

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer)
      extractedText = pdfData.text
    } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
      const docxData = await mammoth.extractRawText({ buffer })
      extractedText = docxData.value
    } else if (file.type.startsWith('image/')) {
      // Return base64 for Claude Vision processing in the analyze route
      return NextResponse.json({
        isImage: true,
        base64: buffer.toString('base64'),
        mimeType: file.type,
        metadata: { name: file.name, size: file.size }
      })
    } else {
      return NextResponse.json({ error: 'INVALID_FORMAT' }, { status: 415 })
    }

    const cleaned = cleanText(extractedText)
    if (!cleaned) {
      return NextResponse.json({ error: 'NO_TEXT' }, { status: 422 })
    }

    return NextResponse.json({
      text: cleaned,
      metadata: { name: file.name, size: file.size, type: file.type }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'PARSE_ERROR', message: err.message }, { status: 500 })
  }
}
```

---

### Pattern 3: Dual-Context Streaming Q&A (Context Anchoring)

**What:** When a user opens the slide-in chat drawer after an analysis, the frontend `useChat` hook sends both the conversational `messages` history AND a `context` payload containing the original document text + the generated structured analysis. The API route anchors Claude's system prompt in both the primary source document and Gavel's prior risk assessment.  
**When to use:** Mode 4 Interactive Q&A across any analysis mode.  
**Trade-offs:** Sending the full document context in each chat turn consumes tokens (~5k–20k tokens per turn), but guarantees that Claude can cite exact clauses and remain completely consistent with the scorecard already rendered on the user's screen.

**Example:**
```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server'
import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { CHAT_SYSTEM_PROMPT } from '@/lib/prompts'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json()
  // context: { sourceText: string, analysisSummary: any, mode: string }

  const systemPrompt = `
${CHAT_SYSTEM_PROMPT}

ACTIVE CONTEXT (${context.mode?.toUpperCase() || 'LEGAL DOCUMENT'}):
Original Document / Situation Content:
"""
${context.sourceText || 'No source text provided.'}
"""

PRIOR STRUCTURED ANALYSIS:
"""
${JSON.stringify(context.analysisSummary || {}, null, 2)}
"""
`

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: systemPrompt,
    messages,
  })

  return result.toDataStreamResponse()
}
```

---

### Pattern 4: Two-Pass Comparison for Large Documents (>80,000 chars)

**What:** If the combined character count of `docA` and `docB` exceeds 80k characters (~20k tokens each), comparing both verbatim in a single prompt risks attention dilution or token exhaustion during complex JSON generation. Gavel employs a two-pass strategy:
1. Pass 1: Extract standardized key clause summaries from `docA` and `docB` concurrently using a lightweight clause extraction schema.
2. Pass 2: Feed the structured clause summaries into `ComparisonSchema` for the final favorability and diff assessment.  
**When to use:** Mode 3 Document Comparison when `(docA.length + docB.length) > 80000`.

---

## Data Flow

### Request Flow: Document Ingestion & Analysis (Mode 1)

```
[User Browser]
      │
      │ 1. Drag & drop file (PDF/DOCX/PNG)
      ▼
[FileUpload.tsx]
      │ 2. Client validation (MIME, size <= 10MB)
      ▼
[POST /api/upload] ─── FormData ──────────────────────┐
                                                      ▼
                                            [In-Memory Buffer]
                                                      │
                         ┌────────────────────────────┼────────────────────────────┐
                         ▼                            ▼                            ▼
                 (PDF) [pdf-parse]            (DOCX) [mammoth]          (Image) [Base64 Encode]
                         │                            │                            │
                         └────────────────────────────┼────────────────────────────┘
                                                      ▼
                                            [cleanText() Sanitizer]
                                                      │
[FileUpload.tsx] ◄── { text, metadata } ──────────────┘
      │
      │ 3. Update React state (`extractedText`)
      │ 4. Auto-trigger or click "Analyze Document"
      ▼
[POST /api/analyze/document] ─── { text } ────────────┐
                                                      ▼
                                            [buildDocumentPrompt()]
                                                      │
                                            [generateObject()]
                                            - model: claude-3-5-sonnet
                                            - schema: DocumentAnalysisSchema
                                                      │
                                                      ▼
                                            [Anthropic Claude API]
                                                      │
                                                      ▼
                                            [Zod Runtime Validation]
                                                      │
[DocumentPage.tsx] ◄── DocumentAnalysis JSON ─────────┘
      │
      ├─► Renders [RiskScorecard.tsx] (🔴🟡🟢 clauses)
      ├─► Renders [Checklist.tsx] (Immediate / Before Signing)
      ├─► Renders [LawyerQuestions.tsx] (5-8 specific questions)
      └─► Initialises [ChatPanel.tsx] (with { sourceText, analysisSummary })
```

---

### State Management & Component Boundaries

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Client-Side React State Tree                          │
│                                                                                 │
│  Page Level State (`app/analyze/document/page.tsx`):                            │
│  ├── step: 'upload' | 'extracting' | 'analyzing' | 'ready' | 'error'            │
│  ├── fileMeta: { name: string, size: number, type: string } | null              │
│  ├── documentText: string                                                       │
│  ├── analysisResult: DocumentAnalysis | null                                    │
│  └── isChatOpen: boolean                                                        │
│                                                                                 │
│  Subscribers & Child Props:                                                     │
│  ├── <FileUpload onUploadComplete={(text, meta) => ...} />                      │
│  ├── <RiskScorecard clauses={analysisResult.clauses} />                         │
│  ├── <Checklist items={analysisResult.checklist} />                             │
│  ├── <LawyerQuestions questions={analysisResult.lawyerQuestions} />            │
│  ├── <ExportActions analysis={analysisResult} sourceText={documentText} />     │
│  └── <ChatPanel isOpen={isChatOpen} context={{ documentText, analysisResult }}/>│
│            │                                                                    │
│            └── Subtree uses @ai-sdk/react useChat({ api: '/api/chat' })         │
│                 ├── messages: Message[]                                         │
│                 ├── input: string                                               │
│                 └── streamingStatus: 'idle' | 'streaming' | 'submitted'         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### Key Data Flows

1. **Upload & In-Memory Extraction Flow:**  
   Browser selects file -> Client confirms `.pdf`, `.docx`, `.png`, `.jpg` and size `< 10MB` -> Transmitted as `multipart/form-data` to `/api/upload` -> Node converts stream to `Buffer` -> Parsed using `pdf-parse` or `mammoth` -> Output string filtered through `cleanText()` (normalizing UTF-8 characters, removing null bytes, collapsing whitespace) -> Returned to client as JSON `{ text, metadata }`.
2. **Situation Navigator Flow:**  
   Citizen types narrative in `SituationInput` -> Frontend checks character count (`length >= 20 words`); if under 20 words, displays a helpful contextual prompt ("Please describe what happened, who was involved, and dates") without invoking the API -> On submission, payload `{ description }` is POSTed to `/api/analyze/situation` -> `generateObject` populates `SituationAnalysisSchema` -> UI renders `RightsAccordion`, `NextStepsTimeline` with urgency flags, and "Documents to Gather" interactive checklist.
3. **Dual Document Comparison Flow:**  
   User supplies Document A and Document B -> Both files POST concurrently (`Promise.all`) to `/api/upload` -> Texts and custom labels are bundled into `{ docA, docB, labelA, labelB }` -> Sent to `/api/analyze/compare` -> Route validates combined length; if `< 80k` chars, triggers single-pass `generateObject` with `ComparisonSchema`; if `> 80k` chars, triggers parallel clause extraction followed by comparative diffing -> Returns favorability verdict (`docA`, `docB`, `neutral`), side-by-side differences table, and negotiation guide.
4. **Contextual Q&A Streaming Flow:**  
   User activates `ChatPanel` drawer -> Submits query -> Client `useChat` hook sends `{ messages, context: { text, analysis } }` to `/api/chat` -> Route prepends active contract text and structured scorecard into Claude's system prompt -> Calls `streamText` -> Next.js returns an open HTTP connection streaming SSE chunks -> Tokens render in real time into the chat UI.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **0–1k users (Hackathon / MVP)** | Standard Next.js server on Vercel Node.js runtime. In-memory processing handles single concurrent uploads effortlessly. Direct calls to Anthropic API. Zero database to manage or scale. |
| **1k–25k users** | Implement client-side rate limiting and Redis/Upstash edge token bucket on `/api/analyze/*` and `/api/chat` to protect against Anthropic API quota exhaustion. Enable response caching (SHA-256 hash of document text -> cached analysis) for identical standard templates. |
| **25k–100k+ users** | Offload heavy PDF/OCR extraction to dedicated background workers (e.g. Inngest / BullMQ on Cloudflare Workers or AWS Lambda) if PDF parsing ties up Next.js server threads. Transition from single Anthropic API key to multi-key or AWS Bedrock Claude fallback. |

### Scaling Priorities

1. **First bottleneck (Anthropic API Rate Limits & Latency):** Claude 3.5 Sonnet processing full 40-page contracts with large output schemas can take 15–20s and hit concurrency tier limits.  
   *Mitigation:* Implement client-side debounce, clear loading skeleton progress bars, and an optional client-side hash cache so re-analyzing the same document returns cached results instantly.
2. **Second bottleneck (Server Node.js Event Loop Block during PDF Parsing):** `pdf-parse` running on large, complex PDFs with vector graphics can block the single-threaded Node event loop on a lightweight serverless instance.  
   *Mitigation:* Ensure `pdf-parse` is strictly isolated within the `/api/upload` route, enforce 10MB hard limit on the client before upload, and stream file buffers.

---

## Anti-Patterns

### Anti-Pattern 1: Server-Side Document & PII Persistence

**What people do:** Save uploaded contracts to an S3 bucket or Supabase PostgreSQL database table with user IDs.  
**Why it's wrong:** Legal documents contain highly sensitive personal identifiable information (PII), salary details, trade secrets, and non-disclosure clauses. Persisting them creates severe legal liability, GDPR/privacy compliance violations, and security audit overhead for a public assistance utility.  
**Do this instead:** Maintain strict in-memory ephemeral processing. Once the HTTP request finishes extracting text or generating the JSON schema, the buffer is garbage-collected. The output lives solely in the user's local browser memory.

---

### Anti-Pattern 2: Unstructured Markdown Streaming for Complex Analysis

**What people do:** Use `streamText()` to stream a raw markdown blob containing headers, markdown tables, and bullet points for the entire risk analysis.  
**Why it's wrong:** The frontend cannot reliably extract risk levels (🔴🟡🟢), generate interactive filterable checklists, or render side-by-side comparison matrices from raw streamed markdown without brittle regex parsing that breaks whenever the LLM formats slightly differently.  
**Do this instead:** Use `generateObject()` with a strict Zod schema for the primary analysis. Use `streamText()` exclusively for the interactive Mode 4 follow-up chat where free-form conversational prose is appropriate.

---

### Anti-Pattern 3: Massive Over-Engineered AI Orchestration Frameworks (LangChain / LlamaIndex)

**What people do:** Install heavy orchestration frameworks (LangChain, LangGraph, LlamaIndex) with recursive chunkers, vector store retrievers, and complex agent graphs for a single document review.  
**Why it's wrong:** Claude 3.5 Sonnet features a 200,000 token context window (~150,000 words). Contracts under 50 pages fit entirely within the prompt window. Vector search (RAG) often chunks clauses mid-sentence, causing the LLM to miss cross-clause dependencies (e.g., Clause 4 referencing Clause 12.3). LangChain adds hundreds of unnecessary dependencies, slow cold starts, and complex debugging layers.  
**Do this instead:** Use Vercel AI SDK (`ai` and `@ai-sdk/anthropic`). Feed the complete document text directly into Claude's prompt. Let Claude's attention mechanism analyze the entire agreement holistically.

---

### Anti-Pattern 4: Running Node Buffer Dependencies on Edge Runtime

**What people do:** Set `export const runtime = 'edge'` on `/api/upload` or routes using `pdf-parse` and `mammoth`.  
**Why it's wrong:** `pdf-parse` and `mammoth` rely on Node.js core modules (`fs`, `buffer`, `stream`). Next.js Edge Runtime will fail at build or runtime with module resolution errors.  
**Do this instead:** Explicitly declare `export const runtime = 'nodejs'` on `/api/upload` and all document extraction handlers.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Anthropic Claude API** | Vercel AI SDK `@ai-sdk/anthropic` via `anthropic('claude-3-5-sonnet-20241022')` | Set `ANTHROPIC_API_KEY` in `.env.local`. Handles both `generateObject` (structured schemas) and `streamText` (chat SSE). |
| **Vercel Edge / Node Platform** | Native Next.js 14+ deployment | Edge runtime suitable for `/api/chat`; Node.js runtime required for `/api/upload` and `/api/analyze/*`. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Client UI ↔ `/api/upload`** | `fetch()` with `multipart/form-data` | Handles binary file streams; returns extracted plain text + file metadata. |
| **Client UI ↔ `/api/analyze/*`** | `fetch()` with `application/json` | Sends sanitized text; receives strictly typed Zod JSON objects matching `lib/schemas.ts`. |
| **Client UI ↔ `/api/chat`** | `@ai-sdk/react` (`useChat`) via SSE | Sends message history + context payload; streams back tokens with auto-reconnect. |
| **Schemas ↔ Route Handlers & Components** | Static TypeScript import of Zod schemas and inferred types | Single source of truth in `lib/schemas.ts` and `types/index.ts`. |

---

## Suggested Build Order & Dependencies

The architectural dependencies dictate a clean 6-stage build sequence for Gavel:

```
┌────────────────────────────────────────────────────────┐
│ Stage 1: Foundation, Schemas & Design System           │
│ - lib/schemas.ts, types/index.ts, lib/text-utils.ts    │
│ - Design system tokens, fonts, Universal Disclaimer    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Stage 2: Ingestion & Extraction Engine                 │
│ - app/api/upload/route.ts (pdf-parse, mammoth, vision) │
│ - components/FileUpload.tsx with paste fallback        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Stage 3: Mode 1 — Document Decoder Core                │
│ - lib/prompts.ts (DOCUMENT_SYSTEM_PROMPT)              │
│ - app/api/analyze/document/route.ts                    │
│ - RiskScorecard, Checklist, LawyerQuestions            │
│ - app/analyze/document/page.tsx                        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Stage 4: Mode 2 — Situation Navigator Core             │
│ - lib/prompts.ts (SITUATION_SYSTEM_PROMPT)             │
│ - app/api/analyze/situation/route.ts                   │
│ - SituationInput, RightsAccordion, NextStepsTimeline   │
│ - app/analyze/situation/page.tsx                       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Stage 5: Mode 3 — Document Comparison Core             │
│ - lib/prompts.ts (COMPARISON_SYSTEM_PROMPT)            │
│ - app/api/analyze/compare/route.ts (with 2-pass logic) │
│ - ComparisonTable, InconsistencyAlerts, Guide          │
│ - app/analyze/compare/page.tsx                         │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Stage 6: Mode 4 & Universal Utilities                  │
│ - app/api/chat/route.ts (streamText SSE)               │
│ - components/ChatPanel.tsx (useChat slide-in drawer)   │
│ - ExportActions.tsx (Copy & Download Report)           │
│ - End-to-end audit of disclaimers & mobile responsiveness│
└────────────────────────────────────────────────────────┘
```

### Build Order Rationale

1. **Stage 1 precedes everything:** `lib/schemas.ts` must exist before any API routes can validate responses or components can type their props.
2. **Stage 2 unlocks realistic testing:** The upload and text extraction engine enables feeding real lease agreements and contracts into subsequent mode pipelines.
3. **Stage 3 proves the core value proposition:** Document Decoder (Mode 1) is Gavel's flagship capability (simplification, risk scorecard, checklists, lawyer questions).
4. **Stages 4 & 5 reuse established patterns:** Situation Navigator and Document Comparison leverage the exact same `generateObject` architecture with tailored schemas and specialized UI components.
5. **Stage 6 layers over all modes:** The contextual Q&A chat drawer (`ChatPanel.tsx`) and report export tools depend on having existing analysis outputs to anchor conversation context and exportable summaries.

---

## Sources

- [Vercel AI SDK 3.x Documentation — generateObject & streamText](https://sdk.vercel.ai/docs)
- [Anthropic Claude 3.5 Sonnet Model Specifications & Structured Outputs](https://docs.anthropic.com/en/docs/models-overview)
- [Next.js 14 App Router Route Handlers & Server Components](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Gavel PRD & FRD v1.0 Specification (`gavel-prd-frd.html`)](file:///home/zeph/Code/gavel/gavel-prd-frd.html)
- [Gavel Project Roadmap & Context (`.planning/PROJECT.md`)](file:///home/zeph/Code/gavel/.planning/PROJECT.md)

---
*Architecture research for: GenAI Legal Assistance Platform (Gavel)*  
*Researched: 2026-09-21*
