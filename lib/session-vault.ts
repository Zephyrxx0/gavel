'use client';

/**
 * Ephemeral client-side session persistence.
 *
 * Adheres strictly to Zero-Disk Vault principles:
 * - Persisted ONLY in browser memory via sessionStorage (never hits server disk or DB).
 * - Persists across internal route navigation (ModeSwitcher tab switches) and page refreshes.
 * - Automatically purged when the user initiates a new review, deletes/resets the review, or closes the tab.
 */

export const SESSION_KEYS = {
  DOCUMENT: 'gavel_session_doc_analysis',
  SITUATION: 'gavel_session_situation_analysis',
  COMPARE: 'gavel_session_compare_analysis',
} as const;

export function saveSessionAnalysis<T>(key: string, data: T): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    const serialized = JSON.stringify(data);
    window.sessionStorage.setItem(key, serialized);
  } catch (err) {
    // If quota exceeded (e.g. very large base64 payload), attempt saving without large rawBase64
    try {
      if (typeof data === 'object' && data !== null) {
        const fallback = { ...data };
        if ('uploadedDoc' in fallback && fallback.uploadedDoc && typeof fallback.uploadedDoc === 'object') {
          const docCopy = { ...(fallback.uploadedDoc as Record<string, unknown>) };
          delete docCopy.rawBase64;
          (fallback as Record<string, unknown>).uploadedDoc = docCopy;
        }
        if ('lastPayload' in fallback && fallback.lastPayload && typeof fallback.lastPayload === 'object') {
          const payloadCopy = { ...(fallback.lastPayload as Record<string, unknown>) };
          delete payloadCopy.imageA;
          delete payloadCopy.imageB;
          (fallback as Record<string, unknown>).lastPayload = payloadCopy;
        }
        window.sessionStorage.setItem(key, JSON.stringify(fallback));
      }
    } catch (quotaErr) {
      console.warn(`[SessionVault] Quota exceeded for session key "${key}":`, quotaErr);
    }
  }
}

export function loadSessionAnalysis<T>(key: string): T | null {
  if (typeof window === 'undefined' || !window.sessionStorage) return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[SessionVault] Failed to parse session data for key "${key}":`, err);
    return null;
  }
}

export function clearSessionAnalysis(key: string): void {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    window.sessionStorage.removeItem(key);
  } catch (err) {
    console.warn(`[SessionVault] Failed to clear session key "${key}":`, err);
  }
}
