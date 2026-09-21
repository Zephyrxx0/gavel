import { describe, it, expect } from 'vitest';
import {
  calculateDownscaleDimensions,
  formatFileSize,
  downsampleImage,
} from '@/lib/image-utils';

describe('Image Downsampler Utilities (lib/image-utils.ts)', () => {
  describe('calculateDownscaleDimensions', () => {
    it('preserves dimensions when both width and height are below maxDimension', () => {
      const { width, height } = calculateDownscaleDimensions(1200, 800, 2048);
      expect(width).toBe(1200);
      expect(height).toBe(800);
    });

    it('preserves dimensions when exact boundary match', () => {
      const { width, height } = calculateDownscaleDimensions(2048, 1536, 2048);
      expect(width).toBe(2048);
      expect(height).toBe(1536);
    });

    it('proportionally downscales wide/landscape images clamping width to maxDimension', () => {
      // 4000x2000 with max 2048 -> width = 2048, height = (2000 * 2048) / 4000 = 1024
      const { width, height } = calculateDownscaleDimensions(4000, 2000, 2048);
      expect(width).toBe(2048);
      expect(height).toBe(1024);
    });

    it('proportionally downscales tall/portrait images clamping height to maxDimension', () => {
      // 1500x3000 with max 2048 -> height = 2048, width = Math.round((1500 * 2048) / 3000) = 1024
      const { width, height } = calculateDownscaleDimensions(1500, 3000, 2048);
      expect(width).toBe(1024);
      expect(height).toBe(2048);
    });

    it('proportionally downscales square images', () => {
      const { width, height } = calculateDownscaleDimensions(3200, 3200, 2048);
      expect(width).toBe(2048);
      expect(height).toBe(2048);
    });

    it('gracefully handles 0 or negative dimensions', () => {
      const { width, height } = calculateDownscaleDimensions(0, 0, 2048);
      expect(width).toBe(0);
      expect(height).toBe(0);
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes, kilobytes, and megabytes accurately', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(2048 * 1024)).toBe('2.0 MB');
      expect(formatFileSize(6.5 * 1024 * 1024)).toBe('6.5 MB');
    });
  });

  describe('downsampleImage threshold and SSR logic', () => {
    it('skips downsampling when image file size is <= 4MB', async () => {
      const smallFile = new File(['small image content'], 'photo.jpg', {
        type: 'image/jpeg',
      });

      const result = await downsampleImage(smallFile, 4 * 1024 * 1024);
      expect(result.wasCompressed).toBe(false);
      expect(result.originalSize).toBe(smallFile.size);
      expect(result.compressedSize).toBe(smallFile.size);
      expect(result.file).toBe(smallFile);
    });

    it('gracefully returns original file in non-DOM SSR environments when size exceeds 4MB', async () => {
      const largeFile = new File(['large payload simulation'], 'heavy.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

      // In Node test environment, window is undefined by default
      const result = await downsampleImage(largeFile, 4 * 1024 * 1024);
      expect(result.wasCompressed).toBe(false);
      expect(result.file).toBe(largeFile);
    });
  });
});
