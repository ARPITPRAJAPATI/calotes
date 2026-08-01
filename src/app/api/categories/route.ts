import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/models/Category';
import { auth } from '@/auth';

// GET categories API route: queries all category records sorted alphabetically by name
export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().populate('parent').sort('name').lean();
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Categories fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST categories API route: creates a new category record (Admin protected)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { name, slug, description, image, parent } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      parent: parent || null,
    });

    return NextResponse.json(category.toObject(), { status: 201 });
  } catch (error: any) {
    console.error('Category creation failed:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}


