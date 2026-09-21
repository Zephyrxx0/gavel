<!-- GSD:project-start source:PROJECT.md -->

## Project

**Gavel**

Gavel is a GenAI-powered legal assistance platform that makes legal information accessible, comprehensible, and actionable for everyday citizens and small business owners. Users can upload legal documents (PDF, DOCX, or images), describe an active legal dispute in plain conversational language, or compare two versions of a contract to receive instant plain-English summaries, traffic-light risk-rated clause breakdowns, actionable checklists, and targeted questions for legal counsel.

Gavel strictly provides legal information and guidance to bridge the gap between confusion and informed consultation—it is not a substitute for professional legal advice or attorney-client representation.

**Core Value:** Translate opaque legal jargon and documents into clear, risk-scored, plain-English explanations with immediate, concrete next steps so citizens know their rights, obligations, and what to ask a lawyer.

### Constraints

- **Tech Stack**: Next.js 14+ App Router, TypeScript, Tailwind CSS, shadcn/ui, Vercel AI SDK (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/react`), Zod, `pdf-parse`, `mammoth`.
- **LLM Selection**: Anthropic Claude 3.5 Sonnet (`claude-sonnet-4-6`) for deep legal reasoning, structured Zod object output (`generateObject`), and vision analysis for document images.
- **Context Limit / Large Document Strategy**: Two-pass clause extraction and comparison strategy if combined comparison docs exceed ~80,000 characters.
- **Privacy & Security**: Zero disk or database persistence of uploaded legal documents. Ephemeral processing only.
- **Legal Compliance**: Disclaimer mandatory on all pages and outputs; AI system prompt explicitly forbids giving prescriptive legal advice or saying "you should", enforcing objective phrasing like "people in this situation often..." and "it may be worth asking a lawyer about...".

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

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

## Installation

# 1. Core Framework & UI Foundation

# 2. Vercel AI SDK & Model Provider

# 3. File Extraction Libraries (Server-side In-Memory)

# 4. Radix UI Primitives & shadcn Dependencies

# 5. Dev Dependencies & Styling Tools

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Vercel AI SDK (`generateObject`)** | **LangChain.js / LlamaIndex** | When building multi-agent autonomous loops or complex multi-tool cognitive architectures requiring external memory stores. For Gavel's single-pass structured extraction and streaming chat, LangChain adds ~150KB bundle weight, brittle prompt abstractions, and unnecessary complexity. |
| **Claude 3.5 Sonnet Multimodal Vision** | **Tesseract.js (Client-side WASM OCR)** | When operating completely offline with zero API connectivity. In legal contexts, Tesseract fails on multi-column contracts, small disclaimers, stamps, and low-contrast mobile camera photos; it also freezes browser threads with 40MB WASM payloads. Claude Vision reads base64 images directly with human-grade comprehension. |
| **Claude 3.5 Sonnet (`20241022`)** | **OpenAI GPT-4o** | When multimodal audio/realtime speech is required or when OpenAI enterprise credits dictate provider choice. Claude 3.5 Sonnet demonstrates superior precision on complex statutory interpretation, contract ambiguity detection, and strictly adhering to complex nested JSON schemas. |
| **pdf-parse** | **pdfjs-dist / pdf2json** | When visual canvas rendering of PDF pages is required in the browser. For plain text extraction in Node.js server routes, `pdf-parse` provides the smallest footprint and fastest in-memory buffer handling. |
| **Ephemeral In-Memory Processing** | **Supabase / PostgreSQL + Prisma** | When building multi-tenant user accounts, team collaboration, document sharing, or billing history. For Gavel V1, avoiding database persistence is an intentional privacy architecture decision: users can upload confidential legal agreements with 100% confidence that no PII or contract text is stored on disk. |
| **Tailwind CSS v3.4** | **Tailwind CSS v4** | When starting a pure greenfield CSS-first project where shadcn/ui CLI generation is not needed. Tailwind v4 removes `tailwind.config.ts` and restructures `@theme`, causing incompatibilities with standard shadcn/ui component generators and `tailwindcss-animate`. |

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

## Stack Patterns by Variant

### Contract Upload (PDF / DOCX) vs. Camera Scan (JPG / PNG)

- Route file to `/api/upload`
- Use `pdf-parse` for `application/pdf` or `mammoth.extractRawText` for `.docx`
- Clean extracted text via `cleanText()` to strip non-printable characters
- Dispatch cleaned plain text to `/api/analyze/document` using standard text prompt
- Convert incoming file buffer to base64 string in `/api/upload`
- Return `{ isImage: true, raw: base64 }`
- Pass image payload directly to Claude 3.5 Sonnet vision content block:
- Eliminates OCR software entirely while yielding significantly higher extraction accuracy on legal seals, footnotes, and margins.

### Standard Document Analysis (< 80,000 characters) vs. Massive Contracts (> 80,000 characters)

- Execute single-pass analysis using `generateObject` with `DocumentAnalysisSchema`
- All clauses, risks, checklists, and lawyer questions generated in one atomic inference call (~10–12s)
- Execute two-pass extraction pattern:
- Display user notice: `"Large document detected — analysing key risk sections"`.

### Structured Intelligence (Modes 1, 2, 3) vs. Interactive Q&A (Mode 4)

- Use `generateObject()` from `ai`
- Requires explicit Zod schema (`DocumentAnalysisSchema`, `SituationAnalysisSchema`, `ComparisonSchema`)
- Enforces strict JSON structure with automatic retry on schema violation
- Use `streamText()` from `ai` on `/api/chat` route
- Return `result.toDataStreamResponse()`
- Consume via `useChat({ api: '/api/chat', body: { context } })` on client
- Streams tokens progressively with sub-2s time-to-first-token

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@14.2.24` | `react@18.3.1` | Must keep React on 18.x to prevent peer dependency collisions with `@radix-ui/*` primitives. |
| `next@14.2.24` | `pdf-parse@1.1.1` | Requires `serverComponentsExternalPackages: ['pdf-parse']` in `next.config.js` to prevent Webpack bundling errors. |
| `ai@3.4.33` | `@ai-sdk/anthropic@0.0.56` | Verified compatible pairing for Core AI SDK 3.x with `generateObject` and `streamText`. |
| `ai@3.4.33` | `zod@3.23.8` | `generateObject` schema parameter requires Zod v3. (Do not upgrade to Zod v4 alpha/beta). |
| `tailwindcss@3.4.17` | `tailwindcss-animate@1.0.7` | Standard pairing for shadcn/ui animation utilities (accordion open/close transitions). |
| `@radix-ui/react-accordion` | `lucide-react@0.475.0` | Accessible collapsible accordion headers using Lucide `ChevronDown` indicators. |

## Configuration Guardrails

### Next.js Configuration (`next.config.mjs`)

### Route Handler Runtime Configuration

## Sources

- Vercel AI SDK Core Documentation (`generateObject`, `streamText`, `toDataStreamResponse`) — Verified compatibility with Claude 3.5 Sonnet.
- Anthropic API Documentation — Multimodal image base64 input limits (max 5MB per image, 200k context).
- Next.js 14 App Router Server Components External Packages Documentation — `serverComponentsExternalPackages` resolution for `pdf-parse`.
- Mammoth.js Official Repository — In-memory ArrayBuffer extraction methods (`mammoth.extractRawText({ buffer })`).

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
