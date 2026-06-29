import { NextResponse } from 'next/server'; // Import next router response helpers
import Razorpay from 'razorpay'; // Import Razorpay payment gateway Node.js SDK
import connectDB from '@/lib/db'; // Import connection cache helper
import Order from '@/models/Order'; // Import Order mongoose schema model
import { auth } from '@/auth'; // Import NextAuth session helper

// POST order API route: initiates order verification, logs pending transaction in MongoDB, and triggers Razorpay payment order
export async function POST(req: Request) {
  try {
    // 1. Instantiate Razorpay API SDK client using environment secrets
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
    // 2. Validate session credentials
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { items, totalAmount, shippingAddress } = await req.json();

    // Map frontend product reference IDs to target database product ObjectID keys
    const mappedItems = (items || []).map((item: any) => ({
      product: item.product || item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      image: item.image,
    }));

    // 3. Create order log record in MongoDB database with Pending status
    const newOrder = await Order.create({
      user: session.user.id,
      items: mappedItems,
      totalAmount,
      shippingAddress,
      paymentStatus: 'Pending',
    });

    // 4. Initialize transaction on Razorpay gateway
    const options = {
      amount: totalAmount * 100, // Razorpay gateway processes amounts scaled in smallest currency units (paise for INR)
      currency: "INR",
      receipt: newOrder._id.toString(), // Link MongoDB order ID as reference receipt key
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 5. Update local database order record with target Razorpay token identifier
    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

    // Return reference pointers to launch Razorpay checkout screens on client browsers
    return NextResponse.json({
      orderId: newOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET orders API route: returns lists of all transaction logs globally (Admin protected)
export async function GET(req: Request) {
  try {
    // 1. Confirm administrative authorization session role privileges
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

