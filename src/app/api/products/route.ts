import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { auth } from '@/auth';
import { ProductInputSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const brand = searchParams.get('brand');
    const searchTerm = searchParams.get('q');
    const sort = searchParams.get('sort') || '-createdAt';
    
    let query: any = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }
    
    if (brand) {
      query.brand = brand;
    }

    const products = await Product.find(query)
      .populate('category')
      .sort(sort)
      .limit(20)
      .lean();

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    
    // Auto-generate SKU if not present or blank
    if (!body.sku || body.sku.trim() === '' || body.sku === 'null') {
      const brandPrefix = (body.brand || 'VINT').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      body.sku = `CV-${brandPrefix}-${randHex}`;
    }

    // Validate body data
    const validatedData = ProductInputSchema.parse(body);

    const product = await Product.create(validatedData);
    return NextResponse.json(product.toObject(), { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid product data' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
