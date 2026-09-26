# ⚖️ Gavel — GenAI-Powered Legal Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google" alt="Gemini 2.5 Flash" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-221_Passing-6E9F18?style=for-the-badge&logo=vitest" alt="221 Tests Passing" />
  <img src="https://img.shields.io/badge/Privacy-Zero_Disk_Retention-10B981?style=for-the-badge&logo=security" alt="Zero-Disk Retention" />
</p>

---

## 🏛️ Overview

**Gavel** is an intelligent, GenAI-driven legal assistance platform engineered to make complex legal contracts and active disputes clear, accessible, and actionable for everyday citizens, freelancers, and small business owners.

Translating dense, adversarial legalese into plain English, Gavel provides instant clause risk ratings, structured dispute roadmaps, side-by-side contract diffing, and targeted questions for legal counsel. 

> **Legal & Compliance Boundary**: Gavel strictly provides objective legal information and navigational guidance to bridge the gap between confusion and consultation. It does not provide prescriptive legal advice or establish attorney-client representation (aligned with the *Advocates Act, 1961* and non-UPL epistemic standards).

---

## ✨ Core Pillars & Features

### 1. Document Decoder (`/analyze/document`)
- **Multimodal Document Ingestion**: Upload native **PDF**, Word documents (**DOCX**), or direct scanned images (**JPG/PNG**) photographed with a smartphone.
- **Traffic-Light Risk Scorecard**: Triages every clause into 🔴 **High Risk** (onerous indemnities, liability caps), 🟡 **Caution** (unilateral renewals, ambiguous metrics), or 🟢 **Standard** (boilerplate terms).
- **Preamble Excerpts & Verbatim Citations**: Quotes the source agreement text directly alongside plain-language explanations.
- **Actionable Checklist**: Prioritized steps (Immediate, High, Medium, Low) to negotiate or modify risky terms before signing.
- **Targeted Counsel Prep**: Precision questions and leverage points to present to an attorney during formal consultation.
- **In-Memory Document Reader**: Accessible modal with real-time keyword search and paragraph segmentation.

### 2. Situation Navigator (`/analyze/situation`)
- **Conversational Dispute Intake**: Describe active disputes in everyday language across 5 pre-configured categories: *Tenancy & Eviction*, *Employment & Severance*, *Freelance & Unpaid Invoices*, *Consumer Fraud*, and *Small Business Vendor Disputes*.
- **Rights & Protections Accordion**: Contextual breakdowns of statutory rights and legal defenses.
- **Urgent Deadline Alert Banner**: Time-sensitive milestone tracker (e.g., 3-day notice periods, statutory limitation clocks).
- **Evidence Checklist**: Actionable lists of documents, communications, and audit trails to preserve.
- **Sequential Next-Steps Roadmap**: Step-by-step milestones to de-escalate or prepare for mediation.

### 3. Contract Comparison Engine (`/analyze/compare`)
- **Side-by-Side Dual Ingestion**: Upload original vs. revised agreements simultaneously.
- **Favorability Verdict Card**: Instant score and plain-English verdict on which party gained or lost leverage.
- **Clause Diff Matrix**: Categorizes all shifts (*Added*, *Removed*, *Modified*, *Critical Shift*) with side-by-side clause alignment.
- **Adaptive Two-Pass Pipeline**: Massive contracts (>80,000 characters) automatically leverage a two-pass extraction pipeline to prevent context saturation while maintaining deep legal reasoning.

### 4. Interactive Q&A ("Ask Gavel") & Dossier Export
- **Contextually Grounded Chat Drawer**: Stream token-by-token legal explanations citing specific clauses from your active analysis.
- **1-Click Dossier Export**: Generate a complete, formatted Markdown dossier of your analysis, checklists, and questions ready for printing or legal consultation.

---

## 🔒 Security, Privacy & Compliance Architecture

Gavel implements a defense-in-depth security model specifically tailored for confidential legal instruments:

1. **Zero-Disk Ephemeral Architecture**:
   - Uploaded documents and images reside strictly in volatile memory (RAM) and transient client state.
   - Files are never saved to local disk, object storage (S3), or relational databases.
2. **Hardened Client-Side Previews**:
   - Preview windows strictly enforce `rel="noopener noreferrer"` to prevent reverse tabnabbing and window hijacking.
   - Strict protocol whitelisting (`blob:`, `data:`) blocks open-redirects and `javascript:` execution (CWE-601).
   - In-memory Blob URLs are automatically scheduled for revocation (`URL.revokeObjectURL`) after 60 seconds to prevent heap memory accumulation.
3. **Statutory Non-UPL Epistemic Guardrails**:
   - System prompts forbid prescriptive phrasing (e.g., "you should", "you must").
   - Enforces objective, informative legal explanations (e.g., "courts typically examine...", "parties in this situation often evaluate...").
4. **Strict HTTP Security Headers**:
   - Configured in `next.config.mjs`: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `X-XSS-Protection: 1; mode=block`.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | **Next.js 14.2.24** (App Router) | Server-Sent Events (SSE), API route handlers, and static page generation. |
| **Language** | **TypeScript 5.6** | Strict end-to-end type safety between AI schemas and React components. |
| **Styling** | **Tailwind CSS 3.4** + `tailwindcss-animate` | Editorial dark-forest aesthetic, typography scales, and responsive design. |
| **Components** | **Radix UI** + **Lucide Icons** | Accessible headless primitives (`Accordion`, `Tabs`, `Dialog`, `Slot`). |
| **AI Orchestration** | **Vercel AI SDK** (`ai`, `@ai-sdk/google`) | Structured schema extraction via `generateObject` and streaming chat via `streamText`. |
| **LLM Provider** | **Google Gemini 2.5 Flash** | High-throughput legal reasoning, structured Zod adherence, and multimodal vision for document scans. |
| **Schema Validation** | **Zod 3.23** | Single source of truth for all API payloads and AI scorecards. |
| **Document Parsers** | **pdf-parse** & **mammoth** | Server-side in-memory text extraction for PDF and DOCX documents. |
| **Testing** | **Vitest 2.1** | Unit and integration test suite with 22 test files and 221 passing assertions. |
| **Code Quality** | **ESLint 8** & **Fallow CLI** | Static analysis, dead code detection, and cognitive complexity enforcement. |

---

## 📁 Repository Structure

```
gavel/
├── app/                                # Next.js App Router
│   ├── analyze/
│   │   ├── compare/page.tsx            # Mode 3: Contract Comparison
│   │   ├── document/page.tsx           # Mode 1: Document Decoder
│   │   └── situation/page.tsx          # Mode 2: Situation Navigator
│   ├── api/
│   │   ├── analyze/
│   │   │   ├── compare/route.ts        # Comparison diff handler (two-pass adaptive)
│   │   │   ├── document/route.ts       # Document analysis & multimodal vision handler
│   │   │   └── situation/route.ts      # Dispute triage handler
│   │   ├── chat/route.ts               # Contextual Q&A streaming route (SSE)
│   │   └── upload/route.ts             # In-memory PDF / DOCX / Image buffer parser
│   ├── layout.tsx                      # Root layout with skip-nav & metadata
│   └── page.tsx                        # Home landing hub with mode cards
├── components/
│   ├── chat/                           # Ask Gavel drawer & trigger buttons
│   ├── comparison/                     # Diff matrix, favorability cards, negotiation guides
│   ├── decoder/                        # Risk scorecard, clause cards, paper thumbnails, reader modal
│   ├── export/                         # Markdown export dossier card
│   ├── shared/                         # Navigation header, mode switcher, legal disclaimer
│   ├── situation/                      # Rights accordion, roadmap, deadline alerts
│   ├── ui/                             # Radix UI primitives (Button, Badge, Tabs, Accordion)
│   └── upload/                         # Drag-and-drop dropzone, file preview cards
├── doc/
│   ├── README.md                       # Comprehensive guide to mock legal test fixtures
│   └── batch-*-*/                      # Test contracts (Leases, NDAs, SLAs, Notices)
├── lib/
│   ├── ai.ts                           # Centralized Gemini model orchestration & key fallback
│   ├── export-utils.ts                 # Markdown dossier compilation & clipboard utilities
│   ├── image-utils.ts                  # Proportional canvas downsampling for mobile camera scans
│   ├── safe-preview.ts                 # Memory-safe ephemeral preview & open-redirect guardrails
│   ├── schemas/                        # Zod schemas for Document, Situation, Comparison, and Upload
│   └── text-utils.ts                   # Text cleaning, normalisation, and word counting
├── tests/                              # 22 Vitest test suites (221 tests)
├── .eslintrc.json                      # Next.js core web vitals configuration
├── next.config.mjs                     # Security headers, serverComponentsExternalPackages
└── package.json                        # Dependencies, headless CI test script
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (or higher)
- **pnpm**: `v10.x` or `v12.x` (recommended)

### 1. Clone & Install
```bash
git clone https://github.com/Zephyrxx0/gavel.git
cd gavel
pnpm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
# Google AI Studio API Key (Gemini)
GEMINI_API_KEY="your-gemini-api-key-here"

# Optional fallback key name (automatically resolved by lib/ai.ts)
# GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key-here"
```

### 3. Start Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔍 How to Test the 3 Analysis Modes in the App

The repository includes curated mock legal test documents in the [`doc/`](file:///home/zeph/Code/gavel/doc/) folder across `.pdf` and `.docx` formats designed to exercise all AI reasoning pipelines:

### Mode 1: Document Decoder (`/analyze/document`)
**Goal:** Test structured risk triage, traffic-light scoring, action checklists, and the in-memory document reader.

1. Navigate to **Document Decoder** from the top mode switcher or home page.
2. Ingest a document using one of three methods:
   - **File Upload:** Drag & drop [`doc/batch-1-single-decode/residential-lease-onerous.pdf`](file:///home/zeph/Code/gavel/doc/batch-1-single-decode/residential-lease-onerous.pdf) (or `.docx`).
   - **Visual OCR Scan:** Upload a camera photo or scan of a contract (`.png` / `.jpg`).
   - **Manual Text:** Switch to the *Paste Text* tab and paste any contract snippet.
3. Click **Analyze Document**.
4. **What to Verify in Output:**
   - **Executive Summary:** Document classification (*Residential Lease Agreement*) and identified parties.
   - **Risk Scorecard:** Clauses triaged into 🔴 *High Risk* (15% rent escalation, non-refundable deposit), 🟡 *Caution*, and 🟢 *Standard*.
   - **Document Preview & Reader:** Click **Open Document** to inspect the interactive paper thumbnail or **Read Text** to open the accessible modal reader with real-time keyword search.
   - **Checklist & Counsel Prep:** Prioritized action items and targeted questions to ask an attorney.

---

### Mode 2: Situation Navigator (`/analyze/situation`)
**Goal:** Test plain-language conversational dispute triage, statutory rights detection, and deadline alerts.

1. Navigate to **Situation Navigator**.
2. Provide a dispute narrative using either:
   - **Quick Presets:** Click any pre-configured chip (*Tenancy*, *Employment*, *Freelance*, *Consumer Fraud*, or *Small Business*).
   - **Custom Description:** Enter a real dispute in everyday English, for example:
     > *"My landlord withheld my security deposit of $2,400 after I moved out 30 days ago. They haven't sent an itemized list of deductions or returned any funds, and are now ignoring my phone calls and emails."*
3. Click **Navigate Situation**.
4. **What to Verify in Output:**
   - **Urgent Deadline Alert Banner:** Highlights time-sensitive statutory clocks (e.g., 21-day deposit return statutes).
   - **Rights & Protections Accordion:** Plain-English breakdown of tenant statutory protections and statutory penalties.
   - **Evidence Checklist:** Specific documents to gather (move-in inspection photos, communications log, bank statements).
   - **Next-Steps Roadmap:** Step-by-step actionable sequence (Demand Letter → Small Claims Filing).
   - **Counsel Intake Triggers:** Explicit criteria for when professional representation is recommended.

---

### Mode 3: Contract Comparison Engine (`/analyze/compare`)
**Goal:** Test side-by-side contract diffing, favorability shifts, and negotiation leverage guidance.

1. Navigate to **Contract Comparison**.
2. Load contract versions using either:
   - **1-Click Presets:** Click the *Vendor SLA Diff* or *Executive Employment Offer* preset card to load sample agreements.
   - **Custom Uploads:**
     - **Document A (Original):** Upload [`doc/batch-2-comparison-pairs/vendor-sla-v1-original.pdf`](file:///home/zeph/Code/gavel/doc/batch-2-comparison-pairs/vendor-sla-v1-original.pdf) (vendor-favored SLA).
     - **Document B (Revised):** Upload [`doc/batch-2-comparison-pairs/vendor-sla-v2-revised.pdf`](file:///home/zeph/Code/gavel/doc/batch-2-comparison-pairs/vendor-sla-v2-revised.pdf) (client-negotiated revision).
3. Click **Compare Contracts**.
4. **What to Verify in Output:**
   - **Favorability Verdict:** Shows whether Document A or B is more advantageous and quantifies leverage shift.
   - **Clause Comparison Table:** Clear side-by-side alignment categorizing shifts (*Added*, *Removed*, *Modified*, *Critical Shift*).
   - **Inconsistencies & Conflict Flags:** Detects conflicting definitions or contradictory terms between drafts.
   - **Negotiation Guide:** Tactical guidance for resolving lingering contested clauses.

---

### Testing Universal Interactive Features (Modes 1, 2 & 3)
- **Interactive Q&A ("Ask Gavel"):** Click the floating green chat badge or the *Ask Gavel* button in the sticky navigation bar. Ask a natural question (e.g., *"What is my exposure under the indemnity clause?"*). The response streams progressively with citations back to the source text.
- **Dossier Export:** Click *Export Dossier* to compile and copy or download a clean, structured Markdown brief formatted for legal counsel or client records.

---

## 🧪 Automated Testing & Verification

Gavel includes a comprehensive test suite of **22 test suites and 221 tests** covering schema integrity, API error responses, component rendering, accessibility attributes, image downsampling, and security guardrails:

```bash
# Run all unit and integration tests headlessly in CI mode
pnpm test

# Run ESLint across all source files
pnpm run lint

# Compile production build and verify type safety
pnpm run build
```

---

## ⚖️ Legal Disclaimer

Gavel provides GenAI-powered analysis for informational purposes only. It is not a law firm, does not provide legal advice, does not draft binding legal instruments, and does not create an attorney-client relationship. Users should always consult a licensed attorney in their jurisdiction for formal legal counsel.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
