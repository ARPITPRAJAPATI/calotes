import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';
import { OrderCreateSchema } from '@/lib/validations';
import { isValidObjectId, sanitizeMongoOperators } from '@/lib/sanitize';

// POST order API route: validates cart server-side, recomputes total from DB prices,
// creates pending order record, and initialises Razorpay transaction.
export async function POST(req: Request) {
  try {
    // 1. Validate session credentials — unauthenticated users cannot place orders
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate request body with Zod
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Sanitize to strip MongoDB operator keys before passing to Zod
    const sanitizedBody = sanitizeMongoOperators(rawBody);
    const parsed = OrderCreateSchema.safeParse(sanitizedBody);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid order data';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { items, shippingAddress, couponCode, paymentMethod = 'Full Online' } = parsed.data;

    await connectDB();

    // 3. ─── SERVER-SIDE PRICE RECOMPUTATION ─────────────────────────────────────
    // CRITICAL: We NEVER trust the client-supplied price.
    // Every product price and availability is fetched fresh from the database.
    // This is the primary defence against price manipulation attacks.
    let serverComputedTotal = 0;
    const validatedItems: Array<{
      product: string;
      name: string;
      price: number;
      quantity: number;
      size: string;
      image: string;
    }> = [];

    for (const item of items) {
      const productId = item.productId || item.product;
      // Validate each product ID is a proper ObjectId before querying
      if (!productId || !isValidObjectId(productId)) {
        return NextResponse.json(
          { error: `Invalid product ID: ${productId}` },
          { status: 400 }
        );
      }

      // Fetch product directly from DB — authoritative source for price and stock
      const product = await Product.findById(productId)
        .select('name price stock images')
        .lean();

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${productId}` },
          { status: 404 }
        );
      }

      // ── Stock check ───────────────────────────────────────────────────────────
      // NOTE: This is a pre-check only. Actual atomic stock decrement happens in
      // the payment verify route AFTER payment is confirmed. This prevents
      // users from placing orders on out-of-stock items before paying.
      if (product.stock !== undefined && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} available.` },
          { status: 409 }
        );
      }

      // Use DB price, completely ignoring client-supplied price
      const lineTotal = product.price * item.quantity;
      serverComputedTotal += lineTotal;

      validatedItems.push({
        product: productId,
        name: product.name,
        price: product.price,  // DB price — authoritative
        quantity: item.quantity,
        size: item.size,
        image: (product.images as string[])[0] || '',
      });
    }

    // 4. ─── COUPON APPLICATION (server-side) ─────────────────────────────────
    // Coupon is applied server-side here, not trusted from the client.
    let discountAmount = 0;
    let appliedCouponCode: string | undefined;

    if (couponCode) {
      const PromoCode = (await import('@/models/PromoCode')).default;
      const promo = await PromoCode.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
      }).lean() as any;

      if (promo) {
        // Check expiry
        const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date();
        // Check global usage limit (0 = unlimited)
        const isOverGlobalLimit = promo.usageLimit > 0 && promo.usageCount >= promo.usageLimit;
        // Check per-user limit
        const userUsageCount = (promo.usedBy || []).filter(
          (uid: any) => uid.toString() === (session.user?.id ?? '')
        ).length;
        const isOverUserLimit = promo.perUserLimit && userUsageCount >= promo.perUserLimit;
        // Check minimum order amount
        const meetsMinOrder = serverComputedTotal >= (promo.minOrderAmount || 0);

        if (!isExpired && !isOverGlobalLimit && !isOverUserLimit && meetsMinOrder) {
          if (promo.discountType === 'percentage') {
            discountAmount = Math.round((serverComputedTotal * promo.discountValue) / 100);
          } else {
            discountAmount = promo.discountValue;
          }
          // Floor discount to prevent negative totals
          discountAmount = Math.min(discountAmount, serverComputedTotal);
          appliedCouponCode = promo.code;
        }
      }
    }

    const finalAmount = Math.max(1, serverComputedTotal - discountAmount); // Minimum ₹1

    // 5. Guard against zero/negative amounts (should never happen after the above, but belt+suspenders)
    if (finalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    // 6. Calculate payment breakdown based on payment method
    let razorpayChargeAmount = finalAmount; // Default full online (INR)
    let paidAmount = finalAmount;
    let codAmountDue = 0;
    let codFee = 0;

    if (paymentMethod === 'Partial COD') {
      const tokenAmount = 0; // Testing mode: ₹0 token
      codFee = 1; // Temporary ₹1 COD fee for testing
      razorpayChargeAmount = tokenAmount + codFee; // Pay ₹1 online NOW
      paidAmount = razorpayChargeAmount;
      codAmountDue = finalAmount - tokenAmount; // Balance due to courier on delivery
    }

    // 7. Instantiate Razorpay SDK client using environment secrets
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    // 8. Create order log record in MongoDB database with Pending status
    const newOrder = await Order.create({
      user: session.user.id,
      items: validatedItems,         // Server-validated items with DB prices
      totalAmount: finalAmount,      // Server-computed total — NOT from client
      shippingAddress,
      paymentStatus: 'Pending',
      paymentMethod,
      paidAmount,
      codAmountDue,
      codFee,
      appliedCoupon: appliedCouponCode,
      discountAmount,
    });

    // 9. Initialize Razorpay transaction using server-computed amount
    const razorpayOrder = await razorpay.orders.create({
      amount: razorpayChargeAmount * 100, // Razorpay expects paise (smallest currency unit)
      currency: 'INR',
      receipt: newOrder._id.toString(),
    });

    // 10. Store Razorpay order ID on our order record for later verification
    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    // Return only what the client needs to open the Razorpay checkout
    return NextResponse.json({
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,   // Paise — Razorpay echoes back the server amount
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      serverTotal: finalAmount,
      discountApplied: discountAmount,
      paymentMethod,
      paidAmount,
      codAmountDue,
      codFee,
    });
  } catch (error: any) {
    console.error('Order creation failed:', error);
    // Never expose internal error details to the client
    return NextResponse.json({ error: 'Order creation failed. Please try again.' }, { status: 500 });
  }
}

// GET orders API route: returns lists of all transaction logs globally (Admin protected)
export async function GET() {
  try {
    // 1. Confirm administrative authorization session role privileges
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    // Retrieve all orders, populating email/name values from matching User records, sorted newest first
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .lean();

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Orders fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}


