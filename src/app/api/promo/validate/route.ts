import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromoCode from '@/models/PromoCode';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    if (!promo) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    const orderSubtotal = parseFloat(subtotal) || 0;
    if (promo.minOrderAmount && orderSubtotal < promo.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount of ₹${promo.minOrderAmount} required for this coupon`,
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (orderSubtotal * promo.discountValue) / 100;
    } else {
      discountAmount = promo.discountValue;
    }

    // Cap discount at order subtotal
    if (discountAmount > orderSubtotal) {
      discountAmount = orderSubtotal;
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
