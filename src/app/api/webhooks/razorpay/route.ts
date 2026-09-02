import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

/**
 * Razorpay Server-to-Server Webhook Handler
 *
 * This is the CANONICAL source of truth for payment confirmation.
 * Unlike the client-callback at /api/orders/verify (which is called by the
 * browser after the Razorpay popup closes), this endpoint is called DIRECTLY
 * by Razorpay's servers and cannot be spoofed or bypassed by a malicious client.
 *
 * SETUP REQUIRED (manual action):
 * 1. Go to Razorpay Dashboard → Settings → Webhooks → Add New Webhook
 * 2. Set URL to: https://your-domain.com/api/webhooks/razorpay
 * 3. Select events: payment.captured, payment.failed, refund.processed
 * 4. Copy the Webhook Secret and set it as RAZORPAY_WEBHOOK_SECRET in your env vars
 *
 * IMPORTANT: This route is excluded from NextAuth middleware auth checks
 * (see proxy.ts matcher). It uses its own signature-based authentication.
 */
export async function POST(req: Request) {
  try {
    // 1. ── Read the raw request body as text (required for HMAC verification) ──
    // We must read the raw body BEFORE parsing as JSON because any transformation
    // would invalidate the HMAC signature computed over the original bytes.
    const rawBody = await req.text();

    // 2. ── Extract Razorpay signature from header ─────────────────────────────
    const razorpaySignature = req.headers.get('x-razorpay-signature');

    if (!razorpaySignature) {
      console.warn('[WEBHOOK] Missing X-Razorpay-Signature header — rejecting');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // 3. ── Verify webhook signature using RAZORPAY_WEBHOOK_SECRET ─────────────
    // NOTE: This uses RAZORPAY_WEBHOOK_SECRET (set in Razorpay Dashboard),
    // which is DIFFERENT from RAZORPAY_KEY_SECRET used for API calls.
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[WEBHOOK] RAZORPAY_WEBHOOK_SECRET env var is not set — cannot verify webhooks');
      // Fail closed — if we can't verify, we must reject
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    // ── Timing-safe comparison ───────────────────────────────────────────────
    let isAuthentic = false;
    try {
      isAuthentic = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(razorpaySignature, 'hex')
      );
    } catch {
      isAuthentic = false;
    }

    if (!isAuthentic) {
      console.warn('[WEBHOOK] Signature verification FAILED — possible spoofing attempt');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 4. ── Parse the verified payload ─────────────────────────────────────────
    let event: Record<string, any>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = event.event as string;
    const paymentEntity = event.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id as string | undefined;
    const razorpayPaymentId = paymentEntity?.id as string | undefined;

    await connectDB();

    // 5. ── Handle event types ─────────────────────────────────────────────────
    if (eventType === 'payment.captured') {
      // Find the order by Razorpay order ID
      const order = await Order.findOne({ razorpayOrderId });

      if (!order) {
        // Order not found — log and return 200 so Razorpay doesn't retry endlessly
        console.warn(`[WEBHOOK] Order not found for Razorpay order ID: ${razorpayOrderId}`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // ── Idempotency check — skip if already Paid or Partial Paid ────────────
      if (order.paymentStatus === 'Paid' || order.paymentStatus === 'Partial Paid') {
        console.log(`[WEBHOOK] Order ${order._id} already marked ${order.paymentStatus} — skipping`);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // ── Mark order as Paid / Partial Paid (based on payment method) ────────────
      const targetStatus = order.paymentMethod === 'Partial COD' ? 'Partial Paid' : 'Paid';
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: targetStatus,
        razorpayPaymentId,
      });

      // ── Atomic stock decrement ──────────────────────────────────────────────
      try {
        const Product = (await import('@/models/Product')).default;
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
          // Floor to 0 to prevent negative stock
          await Product.findOneAndUpdate(
            { _id: item.product, stock: { $lt: 0 } },
            { $set: { stock: 0 } }
          );
        }

        // Invalidate Edge CDN cache so purchased piece immediately reflects on storefront
        revalidatePath('/', 'layout');
        revalidatePath('/shop', 'page');
      } catch (stockErr) {
        console.error(`[WEBHOOK] Stock decrement failed for order ${order._id}:`, stockErr);
      }

      console.log(`[WEBHOOK] Order ${order._id} marked Paid via webhook (payment: ${razorpayPaymentId})`);

    } else if (eventType === 'payment.failed') {
      // Mark the order as Failed if it's still Pending
      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId, paymentStatus: 'Pending' },
          { paymentStatus: 'Failed' }
        );
      }
      console.log(`[WEBHOOK] Payment failed for Razorpay order: ${razorpayOrderId}`);

    } else if (eventType === 'refund.processed') {
      // Mark the associated order as Refunded
      if (razorpayOrderId) {
        await Order.findOneAndUpdate(
          { razorpayOrderId },
          { paymentStatus: 'Refunded' }
        );
      }
      console.log(`[WEBHOOK] Refund processed for Razorpay order: ${razorpayOrderId}`);

    } else {
      // Unknown event type — log and acknowledge (don't error so Razorpay doesn't retry)
      console.log(`[WEBHOOK] Unhandled event type: ${eventType}`);
    }

    // Always return 200 OK to Razorpay to acknowledge receipt.
    // If we return a non-2xx, Razorpay will retry the webhook (which we want for genuine errors,
    // but NOT for rejected fake requests — hence we return 400 for signature failures above).
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('[WEBHOOK] Unhandled error:', error);
    // Return 500 so Razorpay retries genuine processing failures
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
