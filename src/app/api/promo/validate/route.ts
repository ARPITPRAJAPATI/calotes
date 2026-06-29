import { NextResponse } from 'next/server'; // Import response helpers
import connectDB from '@/lib/db'; // Import connection cache helper
import PromoCode from '@/models/PromoCode'; // Import PromoCode schema model

// POST promo validation API route: checks eligibility of coupon codes and calculates discount amounts
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { code, subtotal } = body;

    // Check code existence
    if (!code) {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 });
    }

    // Lookup code in database collection, matching uppercase formatted string characters
    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    // Validate coupon existence
    if (!promo) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    // Verify code expiration parameters
    if (!promo.isActive) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    // Check minimum order subtotal requirements
    const orderSubtotal = parseFloat(subtotal) || 0;
    if (promo.minOrderAmount && orderSubtotal < promo.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount of ₹${promo.minOrderAmount} required for this coupon`,
      }, { status: 400 });
    }

    // Calculate discount value depending on coupon discount configuration types
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = (orderSubtotal * promo.discountValue) / 100; // Deduct percentage of subtotal
    } else {
      discountAmount = promo.discountValue; // Deduct fixed value amount
    }

    // Cap calculated discount value at total order subtotal amount
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

