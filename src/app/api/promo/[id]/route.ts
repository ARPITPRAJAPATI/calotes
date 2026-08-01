import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PromoCode from '@/models/PromoCode';
import AuditLog from '@/models/AuditLog';
import { auth } from '@/auth';
import { isValidObjectId } from '@/lib/sanitize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid promo ID' }, { status: 400 });
    }

    await connectDB();
    const deleted = await PromoCode.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    await AuditLog.create({
      action: 'PROMO_DELETED',
      adminId: (session.user as any).id,
      adminEmail: session.user.email || 'unknown',
      targetModel: 'PromoCode',
      targetId: deleted._id,
      before: deleted.toObject(),
      after: null,
    });

    return NextResponse.json({ message: 'Promo code deleted successfully' });
  } catch (error: any) {
    console.error('Promo code deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete promo code' }, { status: 500 });
  }
}


