import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { auth } from '@/auth';
import { ProductInputSchema } from '@/lib/validations';
import { isValidObjectId, sanitizeProductSort } from '@/lib/sanitize';

// GET products API route: returns products list with filtering, pagination, and sorting (public)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    // Pagination
    const page  = Math.max(1, parseInt(searchParams.get('page')  || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const skip  = (page - 1) * limit;

    // Filtering parameters
    const category = searchParams.get('category');
    const search   = searchParams.get('search') || searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sizes    = searchParams.get('sizes');
    const featured = searchParams.get('featured');

    // ── Sort whitelist ─────────────────────────────────────────────────────────
    // NEVER pass user-supplied sort strings directly to Mongoose — MongoDB can
    // use them for timing attacks or to cause unexpected query behavior.
    const rawSort = searchParams.get('sort');
    const sort    = sanitizeProductSort(rawSort);

    // Build query filter object
    const filter: Record<string, any> = {};

    if (category) {
      if (isValidObjectId(category)) {
        filter.category = category;
      } else {
        const categorySlug = String(category).toLowerCase();
        const catDoc = await Category.findOne({ slug: categorySlug }).lean();
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          // Fallback: match tags, name, brand, or description for slug keyword (e.g. "denim", "oversized")
          const catRegex = new RegExp(categorySlug, 'i');
          filter.$or = [
            { tags: catRegex },
            { name: catRegex },
            { brand: catRegex },
            { description: catRegex }
          ];
        }
      }
    }
    if (featured === 'true') filter.isFeatured = true;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Text search — escape special regex characters before constructing the regex
    // to prevent ReDoS (regex denial of service) attacks.
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
      filter.$or = [
        { name:        { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
        { brand:       { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    // Size filter
    if (sizes) {
      const sizeArray = sizes.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 20);
      if (sizeArray.length > 0) {
        filter.sizes = { $in: sizeArray };
      }
    }

    // Execute paginated query
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'slug name').lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error('Products fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST product API route: creates a new product (Admin protected)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Auto-generate SKUs if parameters are not present or blank
    if (!body.sku || body.sku.trim() === '' || body.sku === 'null') {
      const brandPrefix = (body.brand || 'VINT').replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
      const randHex = Math.random().toString(36).substring(2, 7).toUpperCase();
      body.sku = `CV-${brandPrefix}-${randHex}`;
    }

    const parsed = ProductInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid product data' }, { status: 400 });
    }

    const product = await Product.create(parsed.data);
    return NextResponse.json(product.toObject(), { status: 201 });
  } catch (error: any) {
    console.error('Product create failed:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

