import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

/**
 * GET /api/user/sync
 * Retrieves cross-device synced cart and wishlist items for the logged-in user.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ cart: [], wishlist: [] }, { status: 200 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return NextResponse.json({ cart: [], wishlist: [] }, { status: 200 });
    }

    return NextResponse.json({
      cart: user.cart || [],
      wishlist: user.savedWishlist || [],
    });
  } catch (error: any) {
    console.error('Error fetching user synced data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/user/sync
 * Updates cross-device synced cart and/or wishlist items for the logged-in user.
 * Body: { cart?: CartItem[], wishlist?: WishlistItem[] }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const updateData: any = {};

    if (Array.isArray(body.cart)) {
      updateData.cart = body.cart;
    }
    if (Array.isArray(body.wishlist)) {
      updateData.savedWishlist = body.wishlist;
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      cart: updatedUser?.cart || [],
      wishlist: updatedUser?.savedWishlist || [],
    });
  } catch (error: any) {
    console.error('Error syncing user data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
