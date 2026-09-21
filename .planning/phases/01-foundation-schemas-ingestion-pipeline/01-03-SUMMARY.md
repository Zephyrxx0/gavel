# Phase 1: Foundation, Schemas, & Ingestion Pipeline — Plan 01-03 Summary

**Executed:** 2026-09-22  
**Status:** Completed  
**Plan:** `01-03-PLAN.md`  
**Phase Directory:** `/home/zeph/Code/gavel/.planning/phases/01-foundation-schemas-ingestion-pipeline`

---

## 1. Executive Summary

Plan 01-03 implemented the ephemeral multi-format file ingestion pipeline and resilient client-side intake interface. The serverless route handler (`/api/upload`) runs on Node.js volatile RAM with zero filesystem or database persistence (CORE-04), extracting clean legal text from PDF (`pdf-parse/lib/pdf-parse.js`), DOCX (`mammoth`), and encoding images to base64 for Claude Vision. The client ingestion surface features an interactive drag-and-drop zone with animated pre-flight format and size validation (D-04), offscreen HTML5 canvas downsampling for images exceeding 4MB (D-13), document metadata preview cards (D-14), and automatic fallback transitions to a manual text paste textarea (D-02, D-16) when files are corrupted, password-protected, or yield fewer than 50 characters of readable text.

---

## 2. Tasks Executed

### Task 01-03-01: Implement in-memory multi-format upload API route handler with zero disk persistence
- **Route Implementation (`app/api/upload/route.ts`):**
  - Configured for Node.js runtime (`export const runtime = 'nodejs'`, `export const dynamic = 'force-dynamic'`) per D-01 and CORE-04.
  - Multipart extraction via standard Web API `req.formData()`.
  - Enforced 10MB payload ceiling (`MAX_FILE_SIZE = 10 * 1024 * 1024`), returning `413 PAYLOAD_TOO_LARGE` if breached.
  - Volatile memory buffer extraction (`Buffer.from(await file.arrayBuffer())`) with zero `fs.writeFile` or `/tmp` operations.
  - Whitelist validation for MIME types and file extensions:
    - **PDF** (`application/pdf` or `.pdf`): Direct subpath import from `pdf-parse/lib/pdf-parse.js` to bypass ESM test runner debug bug. Handles encrypted/password-protected PDFs returning `422 PASSWORD_PROTECTED` and damaged streams returning `422 CORRUPT_FILE`.
    - **DOCX** (`application/vnd.openxmlformats-officedocument.wordprocessingml.document` or `.docx`): `mammoth.extractRawText({ buffer })` returning clean text while preserving paragraph breaks. Handles corrupt zip archives with `422 CORRUPT_FILE`.
    - **Image** (`image/jpeg`, `image/png`, `.jpg`, `.jpeg`, `.png`): Converts buffer to base64 string (`buffer.toString('base64')`), setting `isImage: true` for multimodal Claude Vision routing.
    - **Unsupported formats**: Returns `415 UNSUPPORTED_TYPE`.
  - For text documents, runs extracted text through `cleanText` and validates `sanitized.length >= 50`. If `< 50`, returns `422 EMPTY_TEXT` per D-02 and INGEST-07.
  - All responses conform strictly to `UploadResponseSchema`.
- **Unit & Integration Testing (`tests/upload-route.test.ts`):**
  - 12 comprehensive tests validating missing files (400), payload limits (413), unsupported formats (415), PDF extraction, password-protected PDFs (422), corrupt PDFs (422), empty/scanned PDFs (422), DOCX extraction, corrupt DOCX (422), empty DOCX (422), JPG base64 encoding, and PNG base64 encoding.
- **Verification:** `npm test -- run tests/upload-route.test.ts` passed (12/12 tests).
- **Commit:** `115b1a0` (`feat(01-03): implement in-memory multi-format upload API route handler`)

---

### Task 01-03-02: Build interactive drag-and-drop dropzone with client canvas downsampler, metadata preview card, and fallback manual paste textarea
- **Client Canvas Downsampler (`lib/image-utils.ts`):**
  - Implemented `calculateDownscaleDimensions` preserving aspect ratio and clamping max dimension to 2048px.
  - Implemented `formatFileSize` byte-to-human-readable formatter.
  - Implemented `downsampleImage` per D-13 and INGEST-02: files <= 4MB pass through untouched; files > 4MB render to an offscreen `HTMLCanvasElement` at JPEG quality 0.82.
  - Promptly revokes object URLs in both `onload` and `onerror` handlers and zeroes `canvas.width = 0; canvas.height = 0;` to release GPU texture buffers (ASVS V11.1.1).
- **File Preview Card (`components/upload/FilePreviewCard.tsx`):**
  - Renders document type icon (`FileText` or `Image`), file name, formatted size, word count badge, and compression savings chip (e.g. "Compressed (6.2 MB → 1.4 MB)") per D-14.
  - Includes remove/reset button.
- **Manual Paste Area (`components/upload/ManualPasteArea.tsx`):**
  - Multi-line legal text textarea styled with slate borders and gold/obsidian focus rings per D-16.
  - Live character and word counters with minimum 50-character threshold indicator.
  - One-click "Paste from Clipboard" action via `navigator.clipboard.readText()`.
  - Contextual inline alert banner when switched automatically from a failed document upload per D-02.
- **Interactive Dropzone (`components/upload/DocumentDropzone.tsx`):**
  - HTML5 drag-and-drop zone with hidden file picker fallback.
  - Pre-flight format and size validation per D-04 with Sonner toast and animated shake (`animate-shake`).
  - Drag-over state: dashed gold border glow (`#D4AF37`), 1.01 scale-up, smooth 150ms transition.
  - Transparent client downsampling for images > 4MB before dispatching to `/api/upload`.
  - Automatic tab fallback to `ManualPasteArea` on `EMPTY_TEXT`, `CORRUPT_FILE`, or `PASSWORD_PROTECTED` responses.
- **Workspace Integration (`app/page.tsx`):**
  - Integrated `DocumentDropzone`, `FilePreviewCard`, and `ManualPasteArea` within Radix `Tabs` ("Upload Document" vs "Paste Text").
  - Preserved statutory `LegalDisclaimerCard` prominently above analysis viewports.
- **Unit Testing (`tests/canvas-downsample.test.ts`):**
  - 9 tests asserting dimension scaling (landscape, portrait, square, boundary, negative), file size formatting, and downsampling threshold logic.
- **Verification:** `npm test -- run tests/canvas-downsample.test.ts` passed (9/9 tests) and `npm run build` completed successfully.
- **Commit:** `5cfe037` (`feat(01-03): build interactive dropzone with canvas downsampler and fallback paste UI`)

---

## 3. Threat Model & Security Compliance

- **TB-03 & STRIDE T-01-03 Mitigation (Upload Route Security & Zero Disk Retention):**
  - MIME type and filename extension whitelist prevents execution or ingestion of unauthorized file types (`.exe`, `.zip`, etc.).
  - Hard 10MB payload ceiling enforced both client-side and server-side (`413 PAYLOAD_TOO_LARGE`).
  - Zero disk writes: all parsing operates on volatile Node.js RAM `Buffer` objects, ensuring document privacy per CORE-04.
  - Direct import from `pdf-parse/lib/pdf-parse.js` bypasses package debug execution bug.
- **TB-03 & STRIDE T-01-04 Mitigation (Client Canvas Memory & GPU Leak Prevention):**
  - Object URLs created via `URL.createObjectURL(file)` are strictly revoked in both `onload` and `onerror` handlers.
  - Canvas dimensions are zeroed (`canvas.width = 0; canvas.height = 0;`) immediately after `toBlob` completion, releasing GPU textures per ASVS V11.1.1.
  - Enforces 2048px maximum dimension at 0.82 JPEG quality, keeping payloads under 2MB.

---

## 4. Deliverables & File Manifest

| Path | Purpose |
|---|---|
| `app/api/upload/route.ts` | In-memory upload endpoint for PDF, DOCX, and JPG/PNG base64 conversion |
| `lib/image-utils.ts` | Client canvas downsampling (max 2048px, JPEG 0.82), dimension math, and size formatting |
| `components/upload/DocumentDropzone.tsx` | Drag-and-drop component with drag-over glow, pre-flight validation, and error fallback |
| `components/upload/FilePreviewCard.tsx` | Metadata preview card showing file name, size, word count, and compression info |
| `components/upload/ManualPasteArea.tsx` | Fallback text paste area with live counters, clipboard paste, and alert banners |
| `app/page.tsx` | Integrated workspace staging with Radix tabs, dropzone, preview, and disclaimer card |
| `tests/upload-route.test.ts` | 12 integration tests verifying upload route handling and error envelopes |
| `tests/canvas-downsample.test.ts` | 9 unit tests verifying canvas downsampler logic and dimension calculation |

---

## 5. Verification Results

1. **Upload Route Test Suite:**
   ```
   > vitest run tests/upload-route.test.ts
   ✓ tests/upload-route.test.ts (12)
     ✓ Upload Route Handler (/api/upload) (12)
       ✓ rejects requests with missing or non-file payload (400 INVALID_REQUEST)
       ✓ rejects files exceeding the 10MB ceiling (413 PAYLOAD_TOO_LARGE)
       ✓ rejects unsupported file formats (415 UNSUPPORTED_TYPE)
       ✓ extracts and cleans text from valid PDF files
       ✓ handles encrypted / password-protected PDF files (422 PASSWORD_PROTECTED)
       ✓ handles corrupt PDF files (422 CORRUPT_FILE)
       ✓ rejects PDF documents yielding fewer than 50 characters (422 EMPTY_TEXT)
       ✓ extracts and cleans text from valid DOCX files
       ✓ handles corrupt DOCX files (422 CORRUPT_FILE)
       ✓ rejects DOCX documents yielding fewer than 50 characters (422 EMPTY_TEXT)
       ✓ converts JPG image files to base64 payload blocks for vision models
       ✓ converts PNG image files to base64 payload blocks for vision models
   Test Files: 1 passed (1)
   Tests: 12 passed (12)
   ```

2. **Canvas Downsampler Test Suite:**
   ```
   > vitest run tests/canvas-downsample.test.ts
   ✓ tests/canvas-downsample.test.ts (9)
     ✓ Image Downsampler Utilities (lib/image-utils.ts) (9)
       ✓ calculateDownscaleDimensions (6)
       ✓ formatFileSize (1)
       ✓ downsampleImage threshold and SSR logic (2)
   Test Files: 1 passed (1)
   Tests: 9 passed (9)
   ```

3. **Full Repository Test Suite (58/58 passing):**
   ```
   > vitest run
   Test Files: 5 passed (5)
   Tests: 58 passed (58)
   Duration: 1.75s
   ```

4. **Next.js Production Build:**
   ```
   > next build
   ✓ Compiled successfully
   ✓ Linting and checking validity of types
   ✓ Collecting page data
   ✓ Generating static pages (4/4)
   ✓ Collecting build traces
   ✓ Finalizing page optimization

   Route (app)                              Size     First Load JS
   ┌ ○ /                                    24.7 kB         121 kB
   ├ ○ /_not-found                          873 B            88 kB
   └ ƒ /api/upload                          0 B                0 B
   ```
