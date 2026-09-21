# Requirements: Gavel

**Defined:** 2026-09-21  
**Core Value:** Translate opaque legal jargon and documents into clear, risk-scored, plain-English explanations with immediate, concrete next steps so citizens know their rights, obligations, and what to ask a lawyer.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### File Ingestion & Pre-Processing (INGEST)

- [x] **INGEST-01**: User can upload PDF, DOCX, JPG, and PNG documents up to 10MB via drag-and-drop or file picker with client-side type and size validation.
- [x] **INGEST-02**: Client-side canvas downsamples image files exceeding 4MB to prevent HTTP 413 payload errors on serverless endpoints.
- [x] **INGEST-03**: Server extracts clean text from uploaded PDF files in-memory using `pdf-parse` without writing to disk.
- [x] **INGEST-04**: Server extracts plain text from uploaded DOCX files in-memory using `mammoth` preserving paragraph hierarchy.
- [x] **INGEST-05**: Server converts document images (JPG/PNG) into base64 payload blocks for direct multimodal interpretation via Claude 3.5 Sonnet Vision.
- [x] **INGEST-06**: Ingestion pipeline cleans extracted text by normalizing whitespace, stripping non-printable characters, and removing header/footer noise.
- [x] **INGEST-07**: User sees clear, actionable error states with a fallback manual text paste textarea when a file is corrupt, password-protected, or yields empty text.

### Mode 1: Document Decoder (DECODE)

- [ ] **DECODE-01**: Analysis API (`/api/analyze/document`) generates typed, schema-validated `DocumentAnalysis` using Vercel AI SDK `generateObject` and Claude 3.5 Sonnet.
- [ ] **DECODE-02**: Document Decoder displays document type badge, executive plain-English summary (< 200 words), and extracted parties at the top of the report.
- [ ] **DECODE-03**: Risk Scorecard displays clauses rated across 3 tiers (🔴 High, 🟡 Caution, 🟢 Standard) with plain-English reasons and expandable verbatim original text.
- [ ] **DECODE-04**: Actionable Checklist groups recommendations by operational priority (*Immediate*, *Before Signing*, *After Signing*) with action badges (*Negotiate*, *Verify*, *Refuse*, *Accept*).
- [ ] **DECODE-05**: Tailored Lawyer Preparation Guide generates 5–8 specific, high-leverage consultation questions referencing exact document clauses.

### Mode 2: Situation Navigator (SIT)

- [ ] **SIT-01**: Situation intake interface accepts free-text dispute descriptions and provides an inline prompt if input is < 20 words before submitting.
- [ ] **SIT-02**: Situation API (`/api/analyze/situation`) generates typed, schema-validated `SituationAnalysis` using `generateObject` and Claude 3.5 Sonnet.
- [ ] **SIT-03**: System auto-detects and displays dispute category (Tenancy, Employment, Consumer, Civil, Family, Property, Financial, Other) with user confirmation badge.
- [ ] **SIT-04**: "Your Rights" section renders expandable accordion cards explaining statutory rights and protections in plain English.
- [ ] **SIT-05**: Next Steps Roadmap renders an urgency-coded timeline (*Immediate*, *Within 7 Days*, *Within 30 Days*, *When Ready*) with "doable without a lawyer" indicators.
- [ ] **SIT-06**: Situation output displays an interactive "Documents to Gather" checklist with explanations, an estimated dispute resolution timeline, and "When to Call a Lawyer" guidance.
- [ ] **SIT-07**: Time-sensitive warning flags render prominently for urgent limitation deadlines or critical legal notice windows.

### Mode 3: Document Comparison (COMP)

- [ ] **COMP-01**: Comparison interface provides dual side-by-side upload zones with customizable document labels (e.g. "Landlord Lease" vs "Tenant Revision") and parallel upload handling.
- [ ] **COMP-02**: Comparison API (`/api/analyze/compare`) generates typed, schema-validated `ComparisonAnalysis` using `generateObject` and Claude 3.5 Sonnet.
- [ ] **COMP-03**: Overall Favorability Verdict card renders at top of comparison report indicating which document benefits the user (`docA`, `docB`, or `neutral`) with plain-English rationale.
- [ ] **COMP-04**: Side-by-Side Differences Table breaks down clause variances by category, displaying text from each document, who it favors, and risk rating.
- [ ] **COMP-05**: Inconsistencies section highlights contradictory clauses, unusual additions, or omitted standard terms with severity badges (Critical, Notable, Minor).
- [ ] **COMP-06**: Negotiation Guide categorizes clauses into three actionable lists: terms to *Push Back On*, terms to *Accept As-Is*, and terms to *Flag for a Lawyer*.
- [ ] **COMP-07**: Large document comparison pipeline auto-chunks and extracts key sections if combined text exceeds 80,000 characters.

### Mode 4: Interactive Contextual Q&A (CHAT)

- [ ] **CHAT-01**: Streaming chat API (`/api/chat`) uses Vercel AI SDK `streamText` to deliver Server-Sent Events (SSE) grounded in active source text and prior structured analysis.
- [ ] **CHAT-02**: Slide-in `ChatPanel` drawer component uses `@ai-sdk/react`'s `useChat` hook to render streaming responses with sub-2s time-to-first-token.
- [ ] **CHAT-03**: Chat responses cite specific clauses or sections when answering follow-up questions and explicitly state when an answer is not addressed in the source document.

### Design, Compliance & Utilities (CORE)

- [x] **CORE-01**: UI implements dark-mode legal aesthetic with typography (DM Serif Display, DM Sans, JetBrains Mono) and gold accents using Tailwind CSS and Radix UI/shadcn.
- [x] **CORE-02**: Mandatory non-dismissible legal disclaimer is present on all analysis screens, chat drawers, and page footers.
- [ ] **CORE-03**: Universal export tools allow one-click copy of the complete structured report to clipboard and formatted plain-text download.
- [x] **CORE-04**: Ephemeral in-memory processing guarantees zero server-side file or database persistence and zero collection of PII.

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Multi-Language Support

- **LANG-01**: Non-English document input and translation of analysis outputs into regional Indian languages (Hindi, Tamil, Telugu, Marathi).
- **LANG-02**: Audio/voice input for describing legal situations.

### User Persistence & History

- **HIST-01**: Optional client-side encrypted document history using browser IndexedDB.
- **HIST-02**: Shareable read-only link generation with client-side decryption key in URL hash.

### Document Interaction & Redlining

- **REDL-01**: Interactive PDF markup overlay highlighting risky clauses directly on the original document page.
- **REDL-02**: Guided negotiation email drafting assistant based on negotiation checklist items.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep and regulatory liability.

| Feature | Reason |
|---------|--------|
| Prescriptive Legal Advice ("You should sue", "This violates law X") | Severe regulatory liability for Unauthorized Practice of Law (UPL) under Advocates Act 1961 §§ 29 & 33. All outputs must remain educational and informational. |
| User Accounts, Auth, & Cloud Document Persistence | Preserves ephemeral zero-retention privacy posture; eliminates PII storage, database costs, and subpoena discovery burdens. |
| Lawyer Referral Network / Directory Marketplace | Avoids bar association fee-splitting restrictions, lead-gen spam, and platform conflicts of interest. |
| Automated Legal Contract Drafting & Form Filling | High liability of producing defective legal instruments; Gavel's core value is comprehension, not document generation. |
| Real-Time Court Scraping & Live Statute APIs | Government court portals are unstable and lack reliable public APIs; Claude 3.5 Sonnet's legal knowledge base is sufficient for v1. |
| Court Filing or Case Process Automation | Out of scope for an informational assistance platform. |
| Multi-User Real-Time Collaboration | Adds websocket and sync complexity unnecessary for a single citizen reviewing their contract. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INGEST-01 | Phase 1 | Complete |
| INGEST-02 | Phase 1 | Complete |
| INGEST-03 | Phase 1 | Complete |
| INGEST-04 | Phase 1 | Complete |
| INGEST-05 | Phase 1 | Complete |
| INGEST-06 | Phase 1 | Complete |
| INGEST-07 | Phase 1 | Complete |
| DECODE-01 | Phase 2 | Pending |
| DECODE-02 | Phase 2 | Pending |
| DECODE-03 | Phase 2 | Pending |
| DECODE-04 | Phase 2 | Pending |
| DECODE-05 | Phase 2 | Pending |
| SIT-01 | Phase 3 | Pending |
| SIT-02 | Phase 3 | Pending |
| SIT-03 | Phase 3 | Pending |
| SIT-04 | Phase 3 | Pending |
| SIT-05 | Phase 3 | Pending |
| SIT-06 | Phase 3 | Pending |
| SIT-07 | Phase 3 | Pending |
| COMP-01 | Phase 4 | Pending |
| COMP-02 | Phase 4 | Pending |
| COMP-03 | Phase 4 | Pending |
| COMP-04 | Phase 4 | Pending |
| COMP-05 | Phase 4 | Pending |
| COMP-06 | Phase 4 | Pending |
| COMP-07 | Phase 4 | Pending |
| CHAT-01 | Phase 5 | Pending |
| CHAT-02 | Phase 5 | Pending |
| CHAT-03 | Phase 5 | Pending |
| CORE-01 | Phase 1 | Complete |
| CORE-02 | Phase 1 | Complete |
| CORE-03 | Phase 5 | Pending |
| CORE-04 | Phase 1 | Complete |

**Coverage:**

- v1 requirements: 33 total
- Mapped to phases: 33
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-21*  
*Last updated: 2026-09-21 after initial definition*
