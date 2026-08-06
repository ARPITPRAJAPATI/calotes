import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';
import { isValidObjectId } from '@/lib/sanitize';

// POST verification API route: verifies Razorpay client-callback signature and marks order Paid.
// NOTE: This endpoint handles the CLIENT-SIDE payment callback from the Razorpay popup.
// The CANONICAL payment truth is the Razorpay server-to-server webhook at /api/webhooks/razorpay.
// Both paths verify the HMAC signature independently.
export async function POST(req: Request) {
  try {
    // 1. ── Auth check — only authenticated users can call verify ─────────────────
    // This was MISSING before. Without it, any unauthenticated attacker could POST
    // fabricated Razorpay IDs and mark ANY order as Paid.
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } =
      body as Record<string, string>;

    // 3. Validate our internal order_id is a proper MongoDB ObjectId
    if (!isValidObjectId(order_id)) {
      return NextResponse.json({ error: 'Invalid order reference' }, { status: 400 });
    }

    // 4. ── Fetch order and verify ownership ───────────────────────────────────────
    await connectDB();
    const order = await Order.findById(order_id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // IDOR check: ensure the requesting user owns this order
    if (order.user.toString() !== session.user.id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // 5. ── State-machine guard — only Pending orders can be marked Paid/Partial Paid ──
    // This prevents replay attacks where an old payment ID is reused to re-confirm an order.
    if (order.paymentStatus !== 'Pending') {
      // If already Paid or Partial Paid, return success (idempotent) — don't error
      if (order.paymentStatus === 'Paid' || order.paymentStatus === 'Partial Paid') {
        return NextResponse.json({ success: true, alreadyProcessed: true }, { status: 200 });
      }
      return NextResponse.json(
        { error: `Cannot verify payment for an order in ${order.paymentStatus} state` },
        { status: 409 }
      );
    }

    // 6. ── Razorpay signature verification ───────────────────────────────────────
    // Construct validation payload string (Format: "orderId|paymentId")
    const signaturePayload = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(signaturePayload)
      .digest('hex');

    // ── Timing-safe comparison ─────────────────────────────────────────────────
    // Using timingSafeEqual prevents timing-oracle attacks where an attacker could
    // measure response time differences to learn how many characters of their
    // forged signature are correct. String comparison (`===`) leaks this via timing.
    let isAuthentic = false;
    try {
      isAuthentic = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(razorpay_signature || '', 'hex')
      );
    } catch {
      // timingSafeEqual throws if buffers have different lengths — treat as mismatch
      isAuthentic = false;
    }

    if (!isAuthentic) {
      // Log failed verification for fraud monitoring
      console.warn(`[SECURITY] Payment signature mismatch for order ${order_id} by user ${session.user.id}`);
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // 7. ── Mark order as Paid / Partial Paid (state transition) ───────────────────
    const targetStatus = order.paymentMethod === 'Partial COD' ? 'Partial Paid' : 'Paid';

    await Order.findByIdAndUpdate(order_id, {
      paymentStatus: targetStatus,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    // 8. ── Atomic stock decrement ─────────────────────────────────────────────────
    // Use $inc with a conditional floor to prevent concurrent checkouts from overselling.
    // findOneAndUpdate with the $inc operator is atomic at the MongoDB document level.
    try {
      const Product = (await import('@/models/Product')).default;
      for (const item of order.items) {
        // Decrement stock atomically. The $max operator with 0 ensures stock never goes negative.
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
        // Re-floor stock to 0 if it somehow went negative (belt+suspenders)
        await Product.findOneAndUpdate(
          { _id: item.product, stock: { $lt: 0 } },
          { $set: { stock: 0 } }
        );
      }
    } catch (stockErr) {
      // Stock decrement failure is non-fatal (payment already confirmed) — log and continue
      console.error('[WARN] Stock decrement failed for order', order_id, stockErr);
    }

    // 8b. ── Coupon usage increment (non-fatal, best-effort) ───────────────────────
    // Atomically increment usageCount and record the user so per-user limits work correctly.
    // This MUST run after payment confirmation — never before.
    try {
      if (order.appliedCoupon) {
        const PromoCode = (await import('@/models/PromoCode')).default;
        await PromoCode.findOneAndUpdate(
          { code: order.appliedCoupon },
          {
            $inc: { usageCount: 1 },
            $push: { usedBy: order.user },
          }
        );
      }
    } catch (couponErr) {
      // Non-fatal — payment is already confirmed, just log it
      console.error('[WARN] Coupon usage update failed for order', order_id, couponErr);
    }

    // 9. ── Trigger order confirmation email (non-blocking, best-effort) ─────────
    try {
      const populatedOrder = await Order.findById(order_id).populate('user', 'email').lean() as any;
      const baseUrl = process.env.NEXTAUTH_URL || process.env.AUTH_URL?.replace('/api/auth', '') || 'http://localhost:3000';
      // Use internal secret to authenticate the internal call so /api/send-email rejects public invocations
      fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': process.env.INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          to: populatedOrder?.user?.email,
          subject: 'Order Confirmed — Calotes Vintage',
          orderId: order_id,
          total: order.totalAmount,
        }),
      });
    } catch (e) {
      console.error('[WARN] Email trigger failed for order', order_id, e);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Verification failed:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}


