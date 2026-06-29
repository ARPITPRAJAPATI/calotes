import { NextResponse } from 'next/server'; // Import next router response helpers
import connectDB from '@/lib/db'; // Import connection cache helper
import Order from '@/models/Order'; // Import Order schema model
import { auth } from '@/auth'; // Import NextAuth session validator

// GET user orders API route: retrieves order history specifically matching the logged-in user profile session ID
export async function GET() {
  try {
    // 1. Validate session credentials
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Reject unauthenticated calls
    }

    await connectDB();
    // Query orders collection matching the session user ID, sorted newest first
    const orders = await Order.find({ user: session.user.id })
      .sort('-createdAt')
      .lean();

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

