import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { openDocumentPreview } from '@/lib/safe-preview';

describe('openDocumentPreview utility', () => {
  let mockWindowOpen: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();

    mockWindowOpen = vi.fn();
    mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/mock-blob-id');
    mockRevokeObjectURL = vi.fn();

    // Setup global window and URL in Node/Vitest test environment
    (globalThis as unknown as { window: unknown }).window = {
      open: mockWindowOpen,
    };

    (globalThis as unknown as { URL: unknown }).URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    };
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
    vi.useRealTimers();
  });

  it('safely opens a valid blob: fileObjectUrl with noopener,noreferrer', () => {
    const success = openDocumentPreview({
      fileObjectUrl: 'blob:http://localhost:3000/test-file',
    });

    expect(success).toBe(true);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'blob:http://localhost:3000/test-file',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('rejects malicious javascript: fileObjectUrl schemes', () => {
    const success = openDocumentPreview({
      fileObjectUrl: 'javascript:alert(1)',
    });

    expect(success).toBe(false);
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('converts base64 image data to an ephemeral Blob and schedules cleanup', () => {
    const rawBase64 = Buffer.from('mock-image-bytes').toString('base64');
    const success = openDocumentPreview({
      isImage: true,
      rawBase64,
      mimeType: 'image/png',
    });

    expect(success).toBe(true);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'blob:http://localhost/mock-blob-id',
      '_blank',
      'noopener,noreferrer'
    );

    // Fast-forward 60 seconds to verify memory cleanup
    expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(60000);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-blob-id');
  });

  it('converts plain text to a text/plain Blob and schedules cleanup', () => {
    const success = openDocumentPreview({
      text: 'Agreement between Party A and Party B.',
    });

    expect(success).toBe(true);
    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockWindowOpen).toHaveBeenCalledWith(
      'blob:http://localhost/mock-blob-id',
      '_blank',
      'noopener,noreferrer'
    );

    vi.advanceTimersByTime(60000);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-blob-id');
  });

  it('returns false when no previewable payload is supplied', () => {
    const success = openDocumentPreview({});
    expect(success).toBe(false);
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('returns false when window is undefined (SSR environment)', () => {
    delete (globalThis as unknown as { window?: unknown }).window;
    const success = openDocumentPreview({
      fileObjectUrl: 'blob:http://localhost/sample',
    });
    expect(success).toBe(false);
  });
});
