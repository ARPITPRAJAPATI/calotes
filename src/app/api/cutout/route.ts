import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/db';
import Cutout from '@/models/Cutout';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * GET /api/cutout?productIds=id1,id2,id3
 * Returns a map of { productId: cutoutUrl } for all cached cutouts.
 * Used by the Canvas page on load to pre-populate the cache.
 */
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('productIds')?.split(',').filter(Boolean) || [];

    if (ids.length === 0) {
      // Return all cached cutouts
      const all = await Cutout.find({}).lean();
      const map: Record<string, string> = {};
      all.forEach((c: any) => { map[c.productId] = c.cutoutUrl; });
      return NextResponse.json(map);
    }

    const cutouts = await Cutout.find({ productId: { $in: ids } }).lean();
    const map: Record<string, string> = {};
    cutouts.forEach((c: any) => { map[c.productId] = c.cutoutUrl; });
    return NextResponse.json(map);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/cutout
 * Body: { productId, originalUrl, cutoutBlob (base64 PNG) }
 * Uploads the transparent cutout PNG to Cloudinary and caches it in MongoDB.
 * If a cutout already exists for this productId, returns the existing URL.
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const { productId, originalUrl, cutoutBase64 } = await req.json();

    if (!productId || !cutoutBase64) {
      return NextResponse.json({ error: 'productId and cutoutBase64 required' }, { status: 400 });
    }

    // Check if cutout already cached
    const existing = await Cutout.findOne({ productId });
    if (existing) {
      return NextResponse.json({ cutoutUrl: existing.cutoutUrl, cached: true });
    }

    // Upload the base64 PNG blob to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(cutoutBase64, {
      folder: 'calotes-cutouts',
      resource_type: 'image',
      format: 'png',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    // Save to database
    await Cutout.create({
      productId,
      originalUrl: originalUrl || '',
      cutoutUrl: uploadResult.secure_url,
    });

    return NextResponse.json({ cutoutUrl: uploadResult.secure_url, cached: false });
  } catch (err: any) {
    console.error('Cutout API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
