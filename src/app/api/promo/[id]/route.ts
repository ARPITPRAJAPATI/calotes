import { NextResponse } from 'next/server'; // Import response helper
import connectDB from '@/lib/db'; // Import DB connection helper
import PromoCode from '@/models/PromoCode'; // Import PromoCode schema model
import { auth } from '@/auth'; // Import NextAuth session validator

// Route params definition
interface RouteParams {
  params: Promise<{ id: string }>; // Asynchronous params object promise
}

// DELETE handler: deletes a promotional coupon code (Admin protected)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    // 1. Resolve parameters promise to retrieve promo ID
    const { id } = await params;
    // 2. Confirm session credentials role authorization
    const session = await auth();

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard endpoint
    }

    // 3. Establish connection to MongoDB database
    await connectDB();
    
    // 4. Delete coupon document from MongoDB PromoCode collection
    const deleted = await PromoCode.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Promo code not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Promo code deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

