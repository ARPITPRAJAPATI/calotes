import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sort') || '-createdAt';
    
    let query: any = {};
    
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
      .limit(20);

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
