import { NextResponse } from 'next/server'; // Import response helpers
import connectDB from '@/lib/db'; // Import connection cache helper
import Order from '@/models/Order'; // Import Order schema model
import { auth } from '@/auth'; // Import NextAuth session validator

// Route params definition
interface RouteParams {
  params: Promise<{ id: string }>; // App Router asynchronous URL parameters
}

// PUT order detailed API route: updates order status tags like delivery or payments (Admin protected)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params; // Await parameter resolution
    const session = await auth(); // Validate session role

    // Check credentials matching admin roles
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Block unauthorized mutations
    }

    await connectDB();
    const { orderStatus, paymentStatus } = await req.json(); // Read status payloads

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Assign status overrides if supplied in payload
    if (orderStatus) {
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save(); // Save mongoose changes
    return NextResponse.json({ message: 'Order updated successfully', order: order.toObject() });
  } catch (error: any) {
    console.error('Order update failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET order detailed API route: retrieves details of a specific order transaction
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params; // Await URL parameters
    const session = await auth(); // Validate credentials

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const order = await Order.findById(id).lean(); // Query orders collection

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security Check: Verify requesting user owns the order, OR matches admin privilege roles
    if (order.user.toString() !== session.user.id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard customer order privacy
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

