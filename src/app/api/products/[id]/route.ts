import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import AuditLog from '@/models/AuditLog';
import { auth } from '@/auth';
import { ProductInputSchema } from '@/lib/validations';
import { isValidObjectId } from '@/lib/sanitize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET product detailed API route: retrieves details of a single product matching URL id parameter
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(id).populate('category').lean();
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    const response = NextResponse.json(product);
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
    return response;
  } catch (error: any) {
    console.error('Product fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}


// PUT product detailed API route: updates details of a single product (Admin protected)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();
    const body = await req.json();
    
    if (!body.sku || body.sku.trim() === '' || body.sku === 'null') {
      const brandPrefix = (body.brand || 'VINT').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      body.sku = `CV-${brandPrefix}-${randHex}`;
    }

    const parsed = ProductInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid product data' }, { status: 400 });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const beforeState = existingProduct.toObject();
    const updatedProduct = await Product.findByIdAndUpdate(id, parsed.data, { new: true });

    await AuditLog.create({
      action: 'PRODUCT_UPDATED',
      adminId: (session.user as any).id,
      adminEmail: session.user.email || 'unknown',
      targetModel: 'Product',
      targetId: existingProduct._id,
      before: beforeState,
      after: updatedProduct?.toObject(),
    });

    return NextResponse.json(updatedProduct?.toObject());
  } catch (error: any) {
    console.error('Product update failed:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product detailed API route: deletes product record from collections (Admin protected)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    await connectDB();
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await AuditLog.create({
      action: 'PRODUCT_DELETED',
      adminId: (session.user as any).id,
      adminEmail: session.user.email || 'unknown',
      targetModel: 'Product',
      targetId: deletedProduct._id,
      before: deletedProduct.toObject(),
      after: null,
    });
    
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Product deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}


