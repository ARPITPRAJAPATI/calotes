import { NextResponse } from 'next/server'; // Import response helper
import connectDB from '@/lib/db'; // Import DB connection singleton
import User from '@/models/User'; // Import User schema model
import { auth } from '@/auth'; // Import NextAuth session validator

// GET handler: returns list of all registered users (Admin protected)
export async function GET() {
  try {
    // 1. Confirm session credentials role authorization
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Guard endpoint
    }

    // 2. Establish connection to MongoDB database
    await connectDB();

    // 3. Query all users returning only projected fields name/email/role/createdAt/avatar sorted by registration dates descending
    const users = await User.find({}, 'name email role createdAt avatar').sort('-createdAt').lean();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

