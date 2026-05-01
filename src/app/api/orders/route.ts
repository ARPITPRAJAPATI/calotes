import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { items, totalAmount, shippingAddress } = await req.json();

    // 1. Create order in MongoDB
    const newOrder = await Order.create({
      user: session.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentStatus: 'Pending',
    });

    // 2. Create order in Razorpay
    const options = {
      amount: totalAmount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: newOrder._id.toString(),
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // 3. Update MongoDB order with Razorpay ID
    newOrder.razorpayOrderId = razorpayOrder.id;
    await newOrder.save();

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
