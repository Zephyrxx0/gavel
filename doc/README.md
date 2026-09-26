# Guide to Test Documents for Gavel

This folder contains organized legal test documents across multiple categories and batches.
All documents are untracked by Git (`.gitignore`) and can be uploaded directly into Gavel's analysis engines.

> **Supported formats:** `.pdf`, `.docx`, `.jpg`, `.png` — **`.txt` files are not accepted.**

---

## Batch 1: Single Document Decoder (`/analyze/document`)
Target: Test structured risk triage, clause classification, action checklist, and lawyer questions.

- **`batch-1-single-decode/residential-lease-onerous.pdf`** / **`.docx`**
  - **Category:** Tenancy & Real Estate
  - **Key Features:** 15% automatic rent hike without notice, non-refundable $1,200 refurbishment deduction, entry without 24h notice, full tenant repair indemnity, mandatory Delaware arbitration.
  - **Expected Outcome:** Red / High Risk on Rent Escalation, Maintenance Indemnity, Right of Entry. Action checklist items prioritizing pre-signing lease modification.

- **`batch-1-single-decode/nda-ip-assignment-restrictive.pdf`** / **`.docx`**
  - **Category:** Employment & Intellectual Property
  - **Key Features:** Overbroad IP assignment (off-hours personal projects), 24-month worldwide multi-industry non-compete, $100k liquidated damages.
  - **Expected Outcome:** Red / High Risk on Restrictive Covenants and IP Assignment. Flags California Labor Code § 2870 exemptions and FTC non-compete enforceability.

---

## Batch 2: Contract Comparison Pairs (`/analyze/compare`)
Target: Test side-by-side diffing, favorability verdict scoring, clause change categorization, and negotiation guidance.

### Pair 1: Cloud Vendor SLA (Vendor-Favored vs. Client-Negotiated)
- **Original:** `batch-2-comparison-pairs/vendor-sla-v1-original.pdf` / `.docx`
  - Vendor owns all IP deliverables; 1-month liability cap; unilateral client indemnity; Net 15 payment with 5-day suspension trigger.
- **Revised:** `batch-2-comparison-pairs/vendor-sla-v2-revised.pdf` / `.docx`
  - Client owns custom deliverables (work-for-hire); 12-month mutual liability cap; mutual IP indemnity; Net 45 payment with 30-day notice.
- **Expected Outcome:** Favorability shifts to **Document B (Revised)**. Clear clause diffs for Payment, IP, Liability, and Indemnity.

### Pair 2: Executive Employment Offer (Standard vs. Counter-Offer)
- **Original:** `batch-2-comparison-pairs/employment-offer-original.pdf` / `.docx`
  - $210k base, strict at-will without severance, 40k options with single-trigger cliff, 24-month worldwide non-compete.
- **Revised:** `batch-2-comparison-pairs/employment-offer-counter.pdf` / `.docx`
  - $235k + $30k signing bonus, 6 months severance + COBRA, 60k options with double-trigger acceleration, non-compete narrowed to 6 months / Austin TX only.
- **Expected Outcome:** Favorability shifts strongly to **Document B**. Negotiation cards detail severance and equity leverage.

---

## Batch 3: Edge Cases & Validation Limits (`/analyze/document`)
- **`batch-3-edge-cases/short-under-twenty-words.pdf`** / **`.docx`**
  - Contains only ~14 words of legal content.
  - **Test Use:** Verifies validation bounds when minimum text thresholds are applied in inputs or situation narratives.

---

## Batch 4: Real-World Scenarios (`/analyze/document`)
Target: Everyday legal documents a citizen or small business owner would realistically encounter.

- **`batch-4-real-world/eviction-notice-tenant.pdf`** / **`.docx`**
  - **Category:** Tenancy — Landlord-Initiated Action
  - **Key Features:** 3-day notice to quit, multiple breach grounds (non-payment + unauthorized pets + alterations), Tennessee unlawful detainer statute citation (TCA § 66-28-505), treble damages threat.
  - **Expected Outcome:** High urgency flags, identification of cure rights vs. vacate obligation, plain-English explanation of unlawful detainer process, checklist to contest or comply.

- **`batch-4-real-world/freelance-brand-contract.pdf`** / **`.docx`**
  - **Category:** Independent Contractor / Creative Services
  - **Key Features:** Milestone payment schedule (33/33/34), IP transfer conditioned on full payment, 3-round revision cap, JAMS arbitration, liability cap at 30 days of fees.
  - **Expected Outcome:** Notable risk on payment-contingent IP transfer; low-to-medium risk overall; actionable checklist for revision tracking and payment milestone triggers.

---

## How to Test

1. **File Upload Mode:** Drag and drop any `.pdf` or `.docx` file into the upload dropzone on `/analyze/document` or `/analyze/compare`.
2. **Image Upload Mode:** Use `.jpg` or `.png` scanned contract images for Gemini Vision processing.
3. **Text Paste Mode:** Switch to the "Paste Text" tab and copy-paste the document content directly.
