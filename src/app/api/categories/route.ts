import { NextResponse } from 'next/server'; // Import response helper
import connectDB from '@/lib/db'; // Import connection pool helper
import Category from '@/models/Category'; // Import Category mongoose schema model
import { auth } from '@/auth'; // Import NextAuth session validator

// GET categories API route: queries all category records sorted alphabetically by name
export async function GET() {
  try {
    await connectDB();
    // Retrieve categories, populating parent structures, returning plain javascript objects (lean)
    const categories = await Category.find().populate('parent').sort('name').lean();
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST categories API route: creates a new category record (Admin protected)
export async function POST(req: Request) {
  try {
    // 1. Validate session credentials role
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Terminate unauthorized writes
    }

    await connectDB();
    const { name, slug, description, image, parent } = await req.json(); // Read request body fields

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    // Write category to MongoDB Category collection
    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parent: parent || null,
    });

    return NextResponse.json(category.toObject(), { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

