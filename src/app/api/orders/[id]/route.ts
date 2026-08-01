import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import AuditLog from '@/models/AuditLog';
import { auth } from '@/auth';
import { isValidObjectId } from '@/lib/sanitize';

// Route params definition
interface RouteParams {
  params: Promise<{ id: string }>; // App Router asynchronous URL parameters
}

// Allowed order status transitions (state machine — cannot go backwards)
const VALID_ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  Processing: ['Shipped', 'Cancelled'],
  Shipped:    ['Delivered', 'Cancelled'],
  Delivered:  [], // Terminal state
  Cancelled:  [], // Terminal state
};

// Allowed payment status transitions
const VALID_PAYMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending:  ['Paid', 'Failed'],
  Paid:     ['Refunded'],
  Failed:   ['Pending'],  // Retry only
  Refunded: [],           // Terminal state
};

// PUT order detailed API route: updates order status (Admin protected, with audit logging)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    // Verify admin authority
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectId before querying to prevent CastError crashes
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();
    const { orderStatus, paymentStatus } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ── State machine validation ────────────────────────────────────────────────
    // Enforce legal transitions — prevents illegal status manipulations like
    // setting a Delivered order back to Processing, or a Paid order to Pending.
    if (orderStatus && orderStatus !== order.orderStatus) {
      const allowed = VALID_ORDER_STATUS_TRANSITIONS[order.orderStatus] || [];
      if (!allowed.includes(orderStatus)) {
        return NextResponse.json(
          { error: `Invalid status transition: ${order.orderStatus} → ${orderStatus}` },
          { status: 409 }
        );
      }
    }

    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      const allowed = VALID_PAYMENT_STATUS_TRANSITIONS[order.paymentStatus] || [];
      if (!allowed.includes(paymentStatus)) {
        return NextResponse.json(
          { error: `Invalid payment status transition: ${order.paymentStatus} → ${paymentStatus}` },
          { status: 409 }
        );
      }
    }

    // Snapshot the before-state for the audit log
    const beforeSnapshot = order.toObject();

    // Apply status updates
    if (orderStatus)   order.orderStatus   = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // ── Audit log ────────────────────────────────────────────────────────────────
    // Record every admin mutation with attribution, before/after diff, and IP.
    await AuditLog.create({
      action: paymentStatus ? 'ORDER_PAYMENT_STATUS_CHANGED' : 'ORDER_STATUS_CHANGED',
      adminId:    (session.user as any).id,
      adminEmail: session.user.email || 'unknown',
      targetModel: 'Order',
      targetId:   order._id,
      before: { orderStatus: beforeSnapshot.orderStatus, paymentStatus: beforeSnapshot.paymentStatus },
      after:  { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus },
    });

    return NextResponse.json({ message: 'Order updated successfully', order: order.toObject() });
  } catch (error: any) {
    console.error('Order update failed:', error);
    return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
  }
}

// GET order detailed API route: retrieves details of a specific order transaction
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectId before querying
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // IDOR check: requesting user must own the order OR be an admin
    if (order.user.toString() !== session.user.id && (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Order fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

