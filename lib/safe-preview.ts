/**
 * @file safe-preview.ts
 * @description Safe document preview and memory-managed ephemeral viewer utilities.
 *
 * Gavel processes legal documents entirely in-memory without persistent disk or
 * database storage. When users inspect or open their uploaded source documents
 * in an external tab, this module securely converts base64 strings or text buffers
 * into browser Object URLs with strict security controls:
 * 1. Opens new windows with `noopener,noreferrer` to prevent reverse tabnabbing and window.opener hijacking.
 * 2. Enforces strict URL scheme whitelisting (`blob:`, `data:`) to prevent `javascript:` execution (CWE-601).
 * 3. Automatically revokes allocated Object URLs after 60 seconds to prevent heap memory accumulation.
 */

export interface DocumentPreviewOptions {
  /** Ephemeral object URL created directly from a local File instance */
  fileObjectUrl?: string | null;
  /** Whether the document is an image scan or photo */
  isImage?: boolean;
  /** Base64-encoded file payload (for OCR or camera uploads) */
  rawBase64?: string;
  /** MIME type of the document payload */
  mimeType?: string;
  /** Raw text content of the document */
  text?: string;
}

/**
 * Safely opens a document preview in a new browser window.
 *
 * Validates inputs, converts base64 or plain text into ephemeral Blobs,
 * enforces `noopener,noreferrer`, and registers auto-revocation for memory safety.
 *
 * @param options - Document preview parameters
 * @returns boolean indicating whether the preview window was successfully opened
 */
export function openDocumentPreview(options: DocumentPreviewOptions): boolean {
  if (typeof window === 'undefined') return false;

  const { fileObjectUrl, isImage, rawBase64, mimeType, text } = options;

  // 1. If an existing File object URL exists, validate scheme and open securely
  if (fileObjectUrl) {
    if (fileObjectUrl.startsWith('blob:') || fileObjectUrl.startsWith('data:')) {
      window.open(fileObjectUrl, '_blank', 'noopener,noreferrer');
      return true;
    }
    return false;
  }

  // 2. Base64 Image Preview: convert to a Uint8Array Blob URL
  if (isImage && rawBase64) {
    try {
      const byteCharacters = atob(rawBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType || 'image/jpeg' });
      const imgUrl = URL.createObjectURL(blob);
      window.open(imgUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(imgUrl), 60000);
      return true;
    } catch {
      return false;
    }
  }

  // 3. Plain Text Preview: wrap text into an ephemeral text/plain Blob
  if (text) {
    try {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}
