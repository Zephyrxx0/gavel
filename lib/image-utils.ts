/**
 * Client-Side Canvas Downsampler & Image Utilities
 * 
 * Complies with ASVS V11.1.1 (Client-Side Resource Management) and V5.1.1 (Payload Size Limits).
 * Prevents HTTP 413 payload rejections by downsampling images > 4MB to max dimension 2048px at 0.82 JPEG quality.
 */

export interface DownsampleResult {
  file: File;
  wasCompressed: boolean;
  originalSize: number;
  compressedSize: number;
}

/**
 * Proportional aspect-ratio dimension calculation clamping max(width, height) to maxDimension.
 */
export function calculateDownscaleDimensions(
  width: number,
  height: number,
  maxDimension = 2048
): { width: number; height: number } {
  if (width <= 0 || height <= 0) {
    return { width: Math.max(0, width), height: Math.max(0, height) };
  }

  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  if (width > height) {
    return {
      width: maxDimension,
      height: Math.round((height * maxDimension) / width),
    };
  } else {
    return {
      width: Math.round((width * maxDimension) / height),
      height: maxDimension,
    };
  }
}

/**
 * Human-readable byte size formatter
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Downsamples an image file if it exceeds targetSizeBytes (default 4MB)
 * Resizes proportionally so max(width, height) <= maxDimension (default 2048px)
 * Encodes to image/jpeg at quality 0.82
 * Promptly revokes Object URLs and zeroes canvas dimensions to prevent GPU buffer leaks
 */
export async function downsampleImage(
  file: File,
  targetSizeBytes = 4 * 1024 * 1024,
  maxDimension = 2048,
  quality = 0.82
): Promise<DownsampleResult> {
  const originalSize = file.size;

  // If image is already <= target size and not TIFF, keep original
  if (file.size <= targetSizeBytes && !file.type.includes('tiff')) {
    return {
      file,
      wasCompressed: false,
      originalSize,
      compressedSize: file.size,
    };
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Fallback in non-browser environments
      resolve({
        file,
        wasCompressed: false,
        originalSize,
        compressedSize: file.size,
      });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Immediate cleanup of Object URL
      URL.revokeObjectURL(objectUrl);

      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const { width, height } = calculateDownscaleDimensions(naturalW, naturalH, maxDimension);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        canvas.width = 0;
        canvas.height = 0;
        reject(new Error('Failed to acquire canvas 2D rendering context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          // Immediately release GPU texture memory
          canvas.width = 0;
          canvas.height = 0;

          if (!blob) {
            reject(new Error('Canvas toBlob compression failed'));
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const compressedFile = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve({
            file: compressedFile,
            wasCompressed: true,
            originalSize,
            compressedSize: compressedFile.size,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for canvas downsampling'));
    };

    img.src = objectUrl;
  });
}
