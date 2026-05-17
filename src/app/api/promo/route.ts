import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import { auth } from '@/auth';

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
    const { code, discountType, discountValue, isActive, minOrderAmount } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'Code and Discount Value are required' }, { status: 400 });
    }

    // Check unique
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

    return NextResponse.json(promo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
