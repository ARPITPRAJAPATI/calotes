import { NextResponse } from 'next/server'; // Import next router response helpers
import connectDB from '@/lib/db'; // Import database connection pool caching helper
import Product from '@/models/Product'; // Import Product mongoose model
import Category from '@/models/Category'; // Import Category mongoose model
import { auth } from '@/auth'; // Import NextAuth instance to check user sessions
import { ProductInputSchema } from '@/lib/validations'; // Import Zod validation schema

export const dynamic = 'force-dynamic'; // Prevent static route caching to get fresh catalog changes

// GET products API route: queries catalog listings matching search terms or category filters
export async function GET(req: Request) {
  try {
    await connectDB(); // Initial database connection
    
    // Parse target request search query parameters
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category'); // Filter category
    const brand = searchParams.get('brand');          // Filter brand
    const searchTerm = searchParams.get('q');         // Filter keyword
    const sort = searchParams.get('sort') || '-createdAt'; // Sort criteria
    
    let query: any = {}; // Construct dynamic query clauses object

    // If search term is present, match key-word regex against product name, brand, or descriptions
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    // Query category ObjectID matching slug parameters
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug });
      if (category) {
        query.category = category._id;
      }
    }
    
    // Filter by specific brand names
    if (brand) {
      query.brand = brand;
    }

    // Execute query with populate, sorting parameters, and limit records to prevent payload bloating
    const products = await Product.find(query)
      .populate('category')
      .sort(sort)
      .limit(20)
      .lean(); // Return plain javascript objects to optimize serialization speeds

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST products API route: creates a new product record in collections (Admin protected)
export async function POST(req: Request) {
  try {
    // 1. Confirm session credentials of requesting user matches role authorization privileges
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Terminate unauthorized requests
    }

    await connectDB(); // Connect database
    const body = await req.json(); // Read request payload json
    
    // Auto-generate SKUs if parameters are not present or blank
    if (!body.sku || body.sku.trim() === '' || body.sku === 'null') {
      const brandPrefix = (body.brand || 'VINT').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      body.sku = `CV-${brandPrefix}-${randHex}`;
    }

    // Validate body data against Zod validation schemas
    const validatedData = ProductInputSchema.parse(body);

    // Create item record in MongoDB collections
    const product = await Product.create(validatedData);
    return NextResponse.json(product.toObject(), { status: 201 });
  } catch (error: any) {
    // Return explicit field errors if Zod validations crash
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid product data' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

