import { NextResponse } from 'next/server'; // Import Next response helpers
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary Node.js SDK
import { auth } from '@/auth'; // Import NextAuth session validator

// Configure Cloudinary SDK credentials using environment properties
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST upload API route: handles file uploads and streams them to Cloudinary (Admin protected)
export async function POST(req: Request) {
  try {
    // 1. Confirm session credentials role authorization
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard upload endpoint
    }

    // 2. Parse incoming multipart form data fields
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 3. Convert file binary payload to Node.js Buffer structure
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Upload file buffer stream to Cloudinary using a Promise wrapper to support async/await patterns
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'calotes-vintage', // Target directory folder in Cloudinary
          resource_type: 'auto', // Auto-detect image/video/raw asset types
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer); // Write buffer stream to end connection pipeline
    });

    // Return the resulting Cloudinary asset secure URL
    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

