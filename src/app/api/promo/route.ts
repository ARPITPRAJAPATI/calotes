import { NextResponse } from 'next/server'; // Import response helper
import connectDB from '@/lib/db'; // Import DB connection singleton
import PromoCode from '@/models/PromoCode'; // Import PromoCode schema model
import { auth } from '@/auth'; // Import NextAuth session validator

// GET handler: returns list of all promotional coupon codes (Admin protected)
export async function GET() {
  try {
    // 1. Confirm session credentials role authorization
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard endpoint
    }

    // 2. Establish connection to MongoDB database
    await connectDB();
    
    // 3. Query all codes sorted by creation date descending
    const codes = await PromoCode.find({}).sort('-createdAt').lean();
    return NextResponse.json(codes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST handler: creates new promotional discount code (Admin protected)
export async function POST(req: Request) {
  try {
    // 1. Confirm session credentials role authorization
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard endpoint
    }

    // 2. Establish connection to MongoDB database
    await connectDB();
    
    // 3. Parse JSON request body parameters
    const body = await req.json();
    const { code, discountType, discountValue, isActive, minOrderAmount } = body;

    // Validate required fields
    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and Discount Value are required' }, { status: 400 });
    }

    // 4. Verify coupon code uniqueness (compare uppercase strings)
    const exists = await PromoCode.findOne({ code: code.toUpperCase() });
    if (exists) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    // 5. Write new coupon record to MongoDB database
    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      isActive: isActive !== undefined ? isActive : true,
      minOrderAmount: parseFloat(minOrderAmount) || 0,
    });

    return NextResponse.json(promo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

