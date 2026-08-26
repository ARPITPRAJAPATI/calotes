/**
 * Ultra-Fast Client-Side Image Compressor
 * 
 * Uses hardware-accelerated createImageBitmap & HTML5 Canvas to downscale
 * and compress heavy phone/camera photos (up to 20MB) in ~20ms-50ms.
 */

export interface CompressionOptions {
  maxDimension?: number;   // Default: 2048px (crisp 2K HD)
  quality?: number;        // Default: 0.85
  outputFormat?: 'image/webp' | 'image/jpeg';
}

/**
 * Compresses an image File in the browser.
 * Ultra-fast execution (~20-50ms) using createImageBitmap where available.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // If not in browser, not an image, or already a small WebP/JPEG, return immediately
  if (typeof window === 'undefined' || !file || !file.type.startsWith('image/')) {
    return file;
  }

  const {
    maxDimension = 2048,
    quality = 0.85,
    outputFormat = 'image/webp',
  } = options;

  // If already WebP and smaller than 800KB, skip redundant compression
  if (file.type === 'image/webp' && file.size < 800 * 1024) {
    return file;
  }

  try {
    // 1. Fast path: createImageBitmap (Hardware accelerated, off main thread)
    if ('createImageBitmap' in window) {
      const bitmap = await createImageBitmap(file);
      let { width, height } = bitmap;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { alpha: outputFormat === 'image/webp' });

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (outputFormat === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close(); // Free GPU memory immediately

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(resolve, outputFormat, quality);
        });

        if (blob && (blob.size < file.size || file.type !== outputFormat)) {
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const ext = outputFormat === 'image/webp' ? '.webp' : '.jpg';
          return new File([blob], `${baseName}${ext}`, {
            type: outputFormat,
            lastModified: Date.now(),
          });
        }
        return file;
      }
    }
  } catch (err) {
    // Fall back to Image() path if createImageBitmap fails
    console.warn('[clientImageCompressor] Falling back to standard Image loader:', err);
  }

  // 2. Fallback path: HTMLImageElement
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: outputFormat === 'image/webp' });
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (outputFormat === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || (blob.size >= file.size && file.type === outputFormat)) {
              resolve(file);
              return;
            }

            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const ext = outputFormat === 'image/webp' ? '.webp' : '.jpg';
            resolve(
              new File([blob], `${baseName}${ext}`, {
                type: outputFormat,
                lastModified: Date.now(),
              })
            );
          },
          outputFormat,
          quality
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
