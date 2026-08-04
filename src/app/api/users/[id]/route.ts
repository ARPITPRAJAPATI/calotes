import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import { auth } from '@/auth';
import { isValidObjectId } from '@/lib/sanitize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT handler: updates user profile role options (Admin protected, blocks self-demotions)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    // Verify admin authority status
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate ObjectId to prevent CastError crashes
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    await connectDB();
    const { role } = await req.json();

    // Validate that new role input parameter is a registered role shape option
    if (!role || !['customer', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Safety Guard: Do not allow active administrator to demote themselves from admin role power
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot change your own admin role!' }, { status: 400 });
    }

    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Limit maximum administrators to 3
    if (role === 'admin' && existingUser.role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount >= 3) {
        return NextResponse.json({ error: 'Maximum limit of 3 admin users reached!' }, { status: 400 });
      }
    }

    const previousRole = existingUser.role;

    existingUser.role = role;
    await existingUser.save();

    // Audit log recording for security compliance
    await AuditLog.create({
      action: 'ROLE_CHANGED',
      adminId: (session.user as any).id,
      adminEmail: session.user.email || 'unknown',
      targetModel: 'User',
      targetId: existingUser._id,
      before: { role: previousRole },
      after: { role: existingUser.role },
    });

    return NextResponse.json({ message: 'User role updated successfully', user: existingUser.toObject() });
  } catch (error: any) {
    console.error('User role update failed:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}


