import { NextResponse } from 'next/server'; // Import routing helpers
import connectDB from '@/lib/db'; // Import connection cache helper
import Product from '@/models/Product'; // Import Product model
import { auth } from '@/auth'; // Import session provider
import { ProductInputSchema } from '@/lib/validations'; // Import schema validation checks

// GET product detailed API route: retrieves details of a single product matching URL id parameter
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // In Next.js App Router, dynamic params are resolved asynchronously
) {
  try {
    await connectDB(); // Connection pooling setup
    const { id } = await params; // Await parameter promise resolution
    const product = await Product.findById(id).populate('category').lean(); // Fetch record
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT product detailed API route: updates details of a single product (Admin protected)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Confirm session credentials are valid and roles are authorized
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard mutative writes
    }

    await connectDB();
    const { id } = await params; // Resolve URL parameters
    const body = await req.json(); // Read request body
    
    // Auto-generate SKUs if parameters are blank or null
    if (!body.sku || body.sku.trim() === '' || body.sku === 'null') {
      const brandPrefix = (body.brand || 'VINT').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      body.sku = `CV-${brandPrefix}-${randHex}`;
    }

    // Validate body data against Zod validations schema
    const validatedData = ProductInputSchema.parse(body);

    // Mongoose update query, returning updated document
    const updatedProduct = await Product.findByIdAndUpdate(id, validatedData, { new: true });
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedProduct.toObject());
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors[0]?.message || 'Invalid product data' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE product detailed API route: deletes product record from collections (Admin protected)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Confirm session role credentials
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = await params; // Resolve URL id parameter
    
    // Perform deletion query in database collection
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

