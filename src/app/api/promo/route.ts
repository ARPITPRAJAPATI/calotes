import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import AuditLog from '@/models/AuditLog';
import { auth } from '@/auth';

// GET handler: returns list of all promotional coupon codes (Admin protected)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const codes = await PromoCode.find({}).sort('-createdAt').lean();
    return NextResponse.json(codes);
  } catch (error: any) {
    console.error('Promo codes fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch promo codes' }, { status: 500 });
  }
}

// POST handler: creates new promotional discount code (Admin protected)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { code, discountType, discountValue, isActive, minOrderAmount } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and Discount Value are required' }, { status: 400 });
    }

    const exists = await PromoCode.findOne({ code: code.toUpperCase() });
    if (exists) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      isActive: isActive !== undefined ? isActive : true,
      minOrderAmount: parseFloat(minOrderAmount) || 0,
    });

    await AuditLog.create({
      action: 'PROMO_CREATED',
      adminId: (session.user as any).id,
      adminEmail: session.user.email || 'unknown',
      targetModel: 'PromoCode',
      targetId: promo._id,
      before: null,
      after: promo.toObject(),
    });

    return NextResponse.json(promo);
  } catch (error: any) {
    console.error('Promo code creation failed:', error);
    return NextResponse.json({ error: 'Failed to create promo code' }, { status: 500 });
  }
}


