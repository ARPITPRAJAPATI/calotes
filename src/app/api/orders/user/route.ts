import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';

// GET user orders API route: retrieves order history specifically matching the logged-in user profile session ID
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ user: session.user.id })
      .sort('-createdAt')
      .lean();

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('User orders fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch user orders' }, { status: 500 });
  }
}


