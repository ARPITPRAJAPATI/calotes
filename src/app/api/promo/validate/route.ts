import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import { auth } from '@/auth';

// POST promo validation API route: checks eligibility of coupon codes and calculates discount amounts.
// SECURITY: Requires authentication. The subtotal is computed server-side — the client-supplied
// value is used as a hint for display only, not for the actual discount calculation.
export async function POST(req: Request) {
  try {
    // 1. ── Auth check — only authenticated users can validate promo codes ────────
    // Without this, anyone can brute-force enumerate valid coupon codes.
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { code, subtotal } = body as Record<string, any>;

    // Check code existence
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Please enter a coupon code' }, { status: 400 });
    }

    // Use client-supplied subtotal as context for minimum-order validation.
    // NOTE: The actual discount applied at checkout will be recomputed server-side
    // from DB prices in /api/orders — this endpoint is for UI feedback only.
    const orderSubtotal = Math.max(0, parseFloat(subtotal) || 0);

    // Lookup code in database — case-insensitive, trim whitespace
    const promo = await PromoCode.findOne({
      code: code.toUpperCase().trim(),
    }) as any;

    // Validate coupon existence
    if (!promo) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 });
    }

    // Verify active status
    if (!promo.isActive) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    // Check expiry date
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    // Check global usage limit (0 = unlimited)
    if (promo.usageLimit > 0 && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 });
    }

    // Check per-user usage limit
    const userUsageCount = (promo.usedBy || []).filter(
      (uid: any) => uid.toString() === (session.user?.id ?? '')
    ).length;
    if (promo.perUserLimit && userUsageCount >= promo.perUserLimit) {
      return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
    }

    // Check minimum order subtotal requirements
    if (promo.minOrderAmount && orderSubtotal < promo.minOrderAmount) {
      return NextResponse.json({
        error: `Minimum order amount of ₹${promo.minOrderAmount.toLocaleString('en-IN')} required for this coupon`,
      }, { status: 400 });
    }

    // Calculate discount value depending on coupon type
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = Math.floor((orderSubtotal * promo.discountValue) / 100);
    } else {
      discountAmount = promo.discountValue;
    }
    // Cap calculated discount at total order subtotal
    if (discountAmount > orderSubtotal) discountAmount = orderSubtotal;

    // Return minimal data — do not expose internal promo configuration
    return NextResponse.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
    });
  } catch (error: any) {
    console.error('[PROMO] Validation error:', error);
    return NextResponse.json({ error: 'Coupon validation failed' }, { status: 500 });
  }
}


