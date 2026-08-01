import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

// GET handler: returns list of all registered users (Admin protected)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({}, 'name email role createdAt avatar').sort('-createdAt').lean();
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Users fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}


