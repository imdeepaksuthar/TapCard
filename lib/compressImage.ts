/**
 * Client-side image compression using Canvas API.
 * Resizes and compresses images before upload to reduce bandwidth and improve load times.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;       // 0-1, JPEG/WebP quality
  outputType?: string;    // 'image/jpeg' | 'image/webp'
}

const DEFAULTS: Required<CompressOptions> = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  outputType: 'image/webp',
};

/**
 * Compress an image File client-side before uploading.
 * - Resizes to fit within maxWidth x maxHeight (preserving aspect ratio)
 * - Converts to WebP (with JPEG fallback) at the given quality
 * - Returns a new File object ready for FormData
 */
export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<File> {
  // Skip non-image files
  if (!file.type.startsWith('image/')) return file;

  // Skip SVGs and GIFs (can't be meaningfully canvas-compressed)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

  // Skip small files (<100KB) — already lightweight
  if (file.size < 100 * 1024) return file;

  const { maxWidth, maxHeight, quality, outputType } = { ...DEFAULTS, ...opts };

  return new Promise<File>((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Calculate scaled dimensions while preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(file); return; }

      // Draw with high quality interpolation
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // Compressed version is larger — use original
            resolve(file);
            return;
          }
          const ext = outputType === 'image/webp' ? '.webp' : '.jpg';
          const name = file.name.replace(/\.[^.]+$/, '') + ext;
          resolve(new File([blob], name, { type: outputType, lastModified: Date.now() }));
        },
        outputType,
        quality,
      );
    };
    img.onerror = () => resolve(file); // On error, use original
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Compress multiple image files concurrently.
 */
export async function compressImages(
  files: File[],
  opts: CompressOptions = {},
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, opts)));
}

/**
 * Profile-specific compression (smaller output for avatars).
 */
export function compressProfileImage(file: File): Promise<File> {
  return compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.85 });
}

/**
 * Gallery-specific compression (larger images, decent quality).
 */
export function compressGalleryImage(file: File): Promise<File> {
  return compressImage(file, { maxWidth: 1600, maxHeight: 1200, quality: 0.8 });
}

/**
 * Product/Service image compression (consistent 4:3-ish sizing).
 */
export function compressProductImage(file: File): Promise<File> {
  return compressImage(file, { maxWidth: 1000, maxHeight: 800, quality: 0.82 });
}
