import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      await connectDB();
      
      const updatedOrder = await Order.findByIdAndUpdate(order_id, {
        paymentStatus: 'Paid',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      }).populate('user');

      // 2. Automatically reduce product inventory stock
      try {
        if (updatedOrder && updatedOrder.items) {
          const Product = (await import('@/models/Product')).default;
          for (const item of updatedOrder.items) {
            const productDoc = await Product.findById(item.product);
            if (productDoc) {
              const currentStock = productDoc.stock || 0;
              const quantityPurchased = item.quantity || 1;
              productDoc.stock = Math.max(0, currentStock - quantityPurchased);
              await productDoc.save();
            }
          }
        }
      } catch (stockErr) {
        console.error("Failed to automatically deduct product stock:", stockErr);
      }

      // Trigger Email Notification (Non-blocking)
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: (updatedOrder as any).user.email,
            subject: 'Order Confirmed - Calotes Vintage',
            orderId: updatedOrder._id,
            total: updatedOrder.totalAmount
          })
        });
      } catch (e) {
        console.error("Failed to trigger email", e);
      }

      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verification failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
