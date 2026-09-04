import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/auth';

// Configure Cloudinary SDK credentials using environment properties
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed MIME types for upload — raster images and modern formats including iPhone HEIC/HEIF
// SVG is intentionally excluded as it can contain embedded JavaScript (XSS vector)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'image/heif-sequence',
]);

// Maximum file size: 10MB (Cloudinary handles up to 10MB easily)
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// POST upload API route: validates and uploads images to Cloudinary (Admin protected only)
export async function POST(req: Request) {
  try {
    // 1. Confirm session credentials — admin only
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse incoming multipart form data fields
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. ── MIME type validation ──────────────────────────────────────────────────
    // Check both the reported type and sniff the magic bytes as a second layer.
    // On iOS Safari, file.type can occasionally be empty for HEIC files picked from Camera Roll.
    const reportedType = file.type.toLowerCase();
    const isKnownExtension = /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name || '');
    
    if (!ALLOWED_MIME_TYPES.has(reportedType) && !(reportedType === '' && isKnownExtension)) {
      return NextResponse.json(
        { error: `File type "${reportedType || 'unknown'}" is not allowed. Only JPEG, PNG, WebP, AVIF, and HEIC images are accepted.` },
        { status: 415 }
      );
    }

    // 4. ── File size validation ─────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the 5MB limit.` },
        { status: 413 }
      );
    }

    // 5. Convert file binary payload to Node.js Buffer structure
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. ── Magic byte validation (content sniffing) ────────────────────────────
    // Check the actual file magic bytes to confirm it is a real image,
    // not a malicious payload with a fake MIME type or extension.
    if (!isImageMagicBytes(buffer)) {
      return NextResponse.json(
        { error: 'File content does not match a valid image format.' },
        { status: 415 }
      );
    }

    // 7. Upload to Cloudinary with strict image-only settings
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'calotes-vintage',
          // SECURITY: Force 'image' resource type — never 'auto'.
          // 'auto' would accept video/raw files; 'image' ensures Cloudinary
          // validates and re-encodes the file as an actual image, stripping
          // any embedded malicious payloads (SSRF, EXIF data abuse, etc.)
          resource_type: 'image',
          // Normalize all uploads to WebP for consistency and to strip EXIF metadata
          format: 'webp',
          // Cloudinary will strip EXIF metadata by default on re-encode
          invalidate: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Return the resulting Cloudinary secure URL
    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

/**
 * Validates image magic bytes (file signature) to confirm the buffer is
 * actually an image, regardless of what the MIME type header claims.
 *
 * Magic bytes reference:
 *   JPEG: FF D8 FF
 *   PNG:  89 50 4E 47
 *   WebP: 52 49 46 46 ... 57 45 42 50
 *   AVIF: (ftyp box at offset 4)
 */
function isImageMagicBytes(buf: Buffer): boolean {
  if (buf.length < 12) return false;

  // JPEG
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return true;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) return true;
  // WebP (RIFF....WEBP)
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return true;
  // AVIF/HEIF (ftyp box — bytes 4-7 should be 'ftyp')
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return true;

  return false;
}


