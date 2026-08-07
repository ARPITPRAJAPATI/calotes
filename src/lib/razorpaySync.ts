import Razorpay from 'razorpay';
import Order from '@/models/Order';

/**
 * Auto-reconciles a pending order with Razorpay's official REST API.
 * If the customer completed payment on PhonePe/GPay/UPI but closed the tab immediately
 * or webhook was delayed, this fetches the ground-truth payment status directly from Razorpay.
 * If Razorpay confirms 'captured', MongoDB is updated to Paid / Partial Paid automatically.
 */
export async function syncPendingOrderWithRazorpay(order: any) {
  if (!order || order.paymentStatus !== 'Pending' || !order.razorpayOrderId) {
    return order;
  }

  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return order;
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Query Razorpay official API for all payment transactions attached to this order ID
    const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
    const paymentItems = (payments as any)?.items || [];

    // Find any payment in captured state
    const capturedPayment = paymentItems.find((p: any) => p.status === 'captured');

    if (capturedPayment) {
      const targetStatus = order.paymentMethod === 'Partial COD' ? 'Partial Paid' : 'Paid';
      const orderIdStr = order._id.toString();

      await Order.findByIdAndUpdate(orderIdStr, {
        paymentStatus: targetStatus,
        razorpayPaymentId: capturedPayment.id,
      });

      // Atomic stock decrement
      try {
        const Product = (await import('@/models/Product')).default;
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
          await Product.findOneAndUpdate(
            { _id: item.product, stock: { $lt: 0 } },
            { $set: { stock: 0 } }
          );
        }
      } catch (stockErr) {
        console.error('[RAZORPAY-SYNC] Stock decrement error for order', orderIdStr, stockErr);
      }

      // Increment coupon count if applied
      if (order.appliedCoupon) {
        try {
          const PromoCode = (await import('@/models/PromoCode')).default;
          await PromoCode.findOneAndUpdate(
            { code: order.appliedCoupon },
            {
              $inc: { usageCount: 1 },
              $push: { usedBy: order.user },
            }
          );
        } catch (promoErr) {
          console.error('[RAZORPAY-SYNC] Promo update error for order', orderIdStr, promoErr);
        }
      }

      console.log(`[RAZORPAY-SYNC] Auto-reconciled order ${orderIdStr} to ${targetStatus}`);

      // Return updated order object representation
      return {
        ...order,
        paymentStatus: targetStatus,
        razorpayPaymentId: capturedPayment.id,
      };
    }
  } catch (err) {
    console.error('[RAZORPAY-SYNC] Reconciliation check failed for order:', order?._id, err);
  }

  return order;
}

/**
 * Batch reconciles multiple orders (e.g. for user profile list or admin orders table).
 */
export async function syncPendingOrdersBatch(orders: any[]) {
  if (!Array.isArray(orders) || orders.length === 0) return orders;

  // Process any pending orders in parallel
  return Promise.all(
    orders.map((order) => {
      if (order?.paymentStatus === 'Pending' && order?.razorpayOrderId) {
        return syncPendingOrderWithRazorpay(order);
      }
      return order;
    })
  );
}
