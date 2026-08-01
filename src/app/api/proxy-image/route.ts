import { NextResponse } from 'next/server';

// Image proxy route to bypass client-side CORS restrictions for background removal / canvas matting
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new NextResponse('Missing url query parameter', { status: 400 });
    }

    // Fetch the remote image server-side (where CORS does not apply)
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return new NextResponse('Failed to fetch remote image', { status: imageRes.status });
    }

    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const imageBuffer = await imageRes.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Proxy image error:', error);
    return new NextResponse('Image proxy request failed', { status: 500 });
  }
}
