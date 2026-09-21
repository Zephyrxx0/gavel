# Stack Research

**Domain:** GenAI Legal Assistance Platform (Gavel)  
**Researched:** 2026-09-21  
**Confidence:** HIGH  

---

## Recommended Stack

Gavel requires an architecture optimized for:
1. **Extreme Ephemeral Privacy**: Zero server-side database persistence or file storage of sensitive legal contracts.
2. **Deterministic Type Safety**: Guaranteed JSON structures for legal risk scorecards, checklists, and lawyer preparation guides using Zod and AI SDK structured object generation.
3. **Sub-15s Performance**: High-throughput in-memory file extraction and low-latency streaming SSE for conversational legal Q&A.
4. **Accessible, Trustworthy UX**: Dark, authoritative typography (DM Serif Display, DM Sans, JetBrains Mono) with Radix UI accessibility primitives.

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js (App Router)** | `14.2.24` | Full-stack React Framework & API Routes | Native support for Node.js Route Handlers (`/api/upload`, `/api/analyze/*`, `/api/chat`), Server-Sent Events (SSE) streaming, zero-config Vercel edge deployment, and battle-tested React 18 stability with the entire Radix/shadcn ecosystem. |
| **React & React DOM** | `18.3.1` | UI Library & Component Runtime | Rock-solid stability with Radix UI primitives and shadcn/ui. Avoids React 19 peer-dependency mismatches and ref forwarding breaking changes while maintaining full concurrent streaming hydration. |
| **TypeScript** | `^5.6.3` | End-to-End Static Type Safety | Ensures strict typing between Zod output schemas (`DocumentAnalysisSchema`, `SituationAnalysisSchema`, `ComparisonSchema`), API route handlers, and React presentational components. |
| **Vercel AI SDK** | `^3.4.33` | AI Pipeline & Model Orchestration | First-class TypeScript SDK providing `generateObject()` with automated Zod schema retries for structured scorecards, `streamText()` for SSE streaming chat, and `useChat()` frontend hooks without LangChain overhead. |
| **@ai-sdk/anthropic** | `^0.0.56` | Anthropic Model Provider Adapter | Official Anthropic integration for Vercel AI SDK. Provides low-overhead HTTP/SSE bindings to Claude models and native support for multimodal base64 image payloads. |
| **Anthropic Claude 3.5 Sonnet** | `claude-3-5-sonnet-20241022` | Legal Reasoning LLM & Multimodal Vision | Industry gold-standard in legal document comprehension, long-horizon nuanced clause risk evaluation, 200K token context window (handles 100+ page contracts), and multimodal vision capable of reading scanned legal agreements without OCR libraries. |
| **Zod** | `^3.23.8` | Schema Validation & Type Inference | Single source of truth across the application. Defines strict schemas for document analyses, situation navigator timelines, and comparison diffs, enabling automatic TypeScript inference via `z.infer<T>`. |
| **Tailwind CSS** | `^3.4.17` | Utility-First Styling Framework | Rapidly delivers custom dark-mode legal aesthetic with granular utility tokens. Stable v3 ensures seamless compatibility with `tailwindcss-animate` and shadcn/ui component configurations. |
| **shadcn/ui & Radix UI** | Latest (Radix primitives) | Headless Accessible UI Components | Fully accessible, keyboard-navigable primitives (`@radix-ui/react-accordion`, `@radix-ui/react-dialog`, `@radix-ui/react-tabs`) required for legal clause drawers, collapsible rights accordions, and disclaimer dialogs. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **pdf-parse** | `^1.1.1` | In-Memory PDF Text Extraction | Server-side extraction of raw text from uploaded PDF buffers in `/api/upload`. Lightweight, zero native C++ binaries, fast execution. Configured via `serverComponentsExternalPackages`. |
| **mammoth** | `^1.9.0` | In-Memory DOCX Text Extraction | Server-side conversion of Word (.docx) files into clean, unstructured plain text. Strips binary XML bloat while preserving essential paragraph breaks for clause demarcation. |
| **lucide-react** | `^0.475.0` | UI Icons | Traffic light risk indicators (🔴 high, 🟡 medium, 🟢 low), document badges, priority markers, copy/download actions, and navigational icons. |
| **clsx** & **tailwind-merge** | `^2.1.1` / `^2.6.0` | Dynamic CSS Class Composition | Safely merges conflicting Tailwind class utilities within conditional risk badge components (`cn()` utility). |
| **class-variance-authority** | `^0.7.1` | Variant-Driven UI Styling | Type-safe styling variants for severity badges (Critical, Notable, Minor) and action tags (Negotiate, Verify, Refuse, Accept). |
| **react-markdown** | `^9.0.3` | Streamed Markdown Rendering | Safely renders rich text, bullet points, and citations in the Interactive Q&A chat panel (`ChatPanel.tsx`). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **ESLint & Prettier** | Code Quality & Formatting | Configured with `eslint-config-next` and `prettier-plugin-tailwindcss` for automated class sorting. |
| **next/font/google** | Zero-CLS Font Delivery | Self-hosts `DM Serif Display` (authoritative editorial headings), `DM Sans` (clean body text), and `JetBrains Mono` (clause IDs and legal citations) with zero external network requests. |
| **Node.js runtime** | Execution Environment | Node.js `v20.x` or `v22.x` (verified `v22.22.2` active). API routes must run in Node.js runtime (`export const runtime = 'nodejs'`) rather than Edge runtime to support Buffer operations for `pdf-parse` and `mammoth`. |

---

## Installation

```bash
# 1. Core Framework & UI Foundation
npm install next@14.2.24 react@18.3.1 react-dom@18.3.1 typescript@^5.6.3

# 2. Vercel AI SDK & Model Provider
npm install ai@^3.4.33 @ai-sdk/anthropic@^0.0.56 zod@^3.23.8

# 3. File Extraction Libraries (Server-side In-Memory)
npm install pdf-parse@^1.1.1 mammoth@^1.9.0

# 4. Radix UI Primitives & shadcn Dependencies
npm install @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-slot
npm install clsx tailwind-merge class-variance-authority lucide-react react-markdown

# 5. Dev Dependencies & Styling Tools
npm install -D tailwindcss@^3.4.17 postcss@^8.4.49 autoprefixer@^10.4.20
npm install -D tailwindcss-animate@^1.0.7 @types/node@^20 @types/react@^18 @types/react-dom@^18
npm install -D @types/pdf-parse
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Vercel AI SDK (`generateObject`)** | **LangChain.js / LlamaIndex** | When building multi-agent autonomous loops or complex multi-tool cognitive architectures requiring external memory stores. For Gavel's single-pass structured extraction and streaming chat, LangChain adds ~150KB bundle weight, brittle prompt abstractions, and unnecessary complexity. |
| **Claude 3.5 Sonnet Multimodal Vision** | **Tesseract.js (Client-side WASM OCR)** | When operating completely offline with zero API connectivity. In legal contexts, Tesseract fails on multi-column contracts, small disclaimers, stamps, and low-contrast mobile camera photos; it also freezes browser threads with 40MB WASM payloads. Claude Vision reads base64 images directly with human-grade comprehension. |
| **Claude 3.5 Sonnet (`20241022`)** | **OpenAI GPT-4o** | When multimodal audio/realtime speech is required or when OpenAI enterprise credits dictate provider choice. Claude 3.5 Sonnet demonstrates superior precision on complex statutory interpretation, contract ambiguity detection, and strictly adhering to complex nested JSON schemas. |
| **pdf-parse** | **pdfjs-dist / pdf2json** | When visual canvas rendering of PDF pages is required in the browser. For plain text extraction in Node.js server routes, `pdf-parse` provides the smallest footprint and fastest in-memory buffer handling. |
| **Ephemeral In-Memory Processing** | **Supabase / PostgreSQL + Prisma** | When building multi-tenant user accounts, team collaboration, document sharing, or billing history. For Gavel V1, avoiding database persistence is an intentional privacy architecture decision: users can upload confidential legal agreements with 100% confidence that no PII or contract text is stored on disk. |
| **Tailwind CSS v3.4** | **Tailwind CSS v4** | When starting a pure greenfield CSS-first project where shadcn/ui CLI generation is not needed. Tailwind v4 removes `tailwind.config.ts` and restructures `@theme`, causing incompatibilities with standard shadcn/ui component generators and `tailwindcss-animate`. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **LangChain / LangChain.js** | Heavy bundle overhead, rapid breaking changes, and redundant abstraction layers. Vercel AI SDK is natively designed for Next.js App Router and provides superior Zod schema guarantees. | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) |
| **Tesseract.js / OCR Space** | Excessive client-side WASM download (30MB+), poor accuracy on skewed or stamped legal scans, and high CPU usage that crashes mobile browsers. | Claude 3.5 Sonnet Vision via direct base64 image upload in `/api/analyze/document` |
| **Server-Side File Storage (S3 / Multer / Disk)** | Uploading sensitive NDAs, divorce papers, or eviction notices to server disk creates severe data privacy liability, GDPR/SOC2 compliance overhead, and data leakage risks. | In-memory Buffer processing via standard Web API `req.formData()` in Next.js App Router |
| **Database / ORM (Prisma / Supabase / Drizzle)** | Premature complexity for V1. Increases setup friction, adds database hosting costs, and compromises the "zero data retention" privacy posture. | React ephemeral client state + local clipboard / text export tools |
| **Next.js Edge Runtime for File Parsing** | Node.js native modules (`fs`, `stream`, and binary buffer operations in `pdf-parse`) will crash in Edge runtime environments like Vercel Edge. | Node.js runtime: set `export const runtime = 'nodejs'` on `/api/upload` and file processing routes. |
| **Tailwind CSS v4.x** | Radix and shadcn component templates currently rely on `tailwind.config.ts`, `hsl(var(--primary))` CSS variables, and `@apply` rules that break in Tailwind v4's CSS-only configuration model. | Tailwind CSS `^3.4.17` with `tailwindcss-animate` |
| **React 19 / Next.js 15 Bleeding Edge** | Next.js 15 defaults to React 19, which introduces peer-dependency conflicts with current Radix UI releases, changes async Request headers behavior, and breaks several markdown renderers. | Next.js `14.2.24` + React `18.3.1` (stable LTS) |

---

## Stack Patterns by Variant

### Contract Upload (PDF / DOCX) vs. Camera Scan (JPG / PNG)

**If handling digital PDF or Word documents:**
- Route file to `/api/upload`
- Use `pdf-parse` for `application/pdf` or `mammoth.extractRawText` for `.docx`
- Clean extracted text via `cleanText()` to strip non-printable characters
- Dispatch cleaned plain text to `/api/analyze/document` using standard text prompt

**If handling image uploads (JPG / PNG):**
- Convert incoming file buffer to base64 string in `/api/upload`
- Return `{ isImage: true, raw: base64 }`
- Pass image payload directly to Claude 3.5 Sonnet vision content block:
  ```ts
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: DOCUMENT_SYSTEM_PROMPT },
        { type: 'image', image: `data:${mimeType};base64,${base64}` }
      ]
    }
  ]
  ```
- Eliminates OCR software entirely while yielding significantly higher extraction accuracy on legal seals, footnotes, and margins.

---

### Standard Document Analysis (< 80,000 characters) vs. Massive Contracts (> 80,000 characters)

**If document size < 80,000 characters (~15,000 words):**
- Execute single-pass analysis using `generateObject` with `DocumentAnalysisSchema`
- All clauses, risks, checklists, and lawyer questions generated in one atomic inference call (~10–12s)

**If document size > 80,000 characters (e.g. 50-page master services agreements or commercial leases):**
- Execute two-pass extraction pattern:
  1. *Pass 1*: Run lightweight clause extractor schema to identify key risk sections (Termination, Indemnity, Liability, Non-compete, Governing Law).
  2. *Pass 2*: Feed condensed clause summaries into `ComparisonSchema` or `DocumentAnalysisSchema`.
- Display user notice: `"Large document detected — analysing key risk sections"`.

---

### Structured Intelligence (Modes 1, 2, 3) vs. Interactive Q&A (Mode 4)

**If generating Risk Scorecard, Situation Roadmap, or Document Diff (Modes 1–3):**
- Use `generateObject()` from `ai`
- Requires explicit Zod schema (`DocumentAnalysisSchema`, `SituationAnalysisSchema`, `ComparisonSchema`)
- Enforces strict JSON structure with automatic retry on schema violation

**If handling Interactive Q&A Chat (Mode 4):**
- Use `streamText()` from `ai` on `/api/chat` route
- Return `result.toDataStreamResponse()`
- Consume via `useChat({ api: '/api/chat', body: { context } })` on client
- Streams tokens progressively with sub-2s time-to-first-token

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@14.2.24` | `react@18.3.1` | Must keep React on 18.x to prevent peer dependency collisions with `@radix-ui/*` primitives. |
| `next@14.2.24` | `pdf-parse@1.1.1` | Requires `serverComponentsExternalPackages: ['pdf-parse']` in `next.config.js` to prevent Webpack bundling errors. |
| `ai@3.4.33` | `@ai-sdk/anthropic@0.0.56` | Verified compatible pairing for Core AI SDK 3.x with `generateObject` and `streamText`. |
| `ai@3.4.33` | `zod@3.23.8` | `generateObject` schema parameter requires Zod v3. (Do not upgrade to Zod v4 alpha/beta). |
| `tailwindcss@3.4.17` | `tailwindcss-animate@1.0.7` | Standard pairing for shadcn/ui animation utilities (accordion open/close transitions). |
| `@radix-ui/react-accordion` | `lucide-react@0.475.0` | Accessible collapsible accordion headers using Lucide `ChevronDown` indicators. |

---

## Configuration Guardrails

### Next.js Configuration (`next.config.mjs`)
To prevent Webpack from attempting to bundle server-side Node.js binary dependencies within `pdf-parse`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
  // Ensure Node.js API routes have maximum execution time for LLM generation
  // (Vercel hobby plan defaults to 10s; 30s allows complex legal analyses)
};

export default nextConfig;
```

### Route Handler Runtime Configuration
All API routes performing file parsing or Anthropic API calls must enforce Node.js runtime:

```typescript
// app/api/upload/route.ts & app/api/analyze/*/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 second timeout for complex contract processing
```

---

## Sources

- Vercel AI SDK Core Documentation (`generateObject`, `streamText`, `toDataStreamResponse`) — Verified compatibility with Claude 3.5 Sonnet.
- Anthropic API Documentation — Multimodal image base64 input limits (max 5MB per image, 200k context).
- Next.js 14 App Router Server Components External Packages Documentation — `serverComponentsExternalPackages` resolution for `pdf-parse`.
- Mammoth.js Official Repository — In-memory ArrayBuffer extraction methods (`mammoth.extractRawText({ buffer })`).

---
*Stack research for: GenAI Legal Assistance Platform (Gavel)*  
*Researched: 2026-09-21*  
