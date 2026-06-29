import { NextResponse } from 'next/server'; // Import response helper
import connectDB from '@/lib/db'; // Import DB connection helper
import User from '@/models/User'; // Import User schema model
import { auth } from '@/auth'; // Import NextAuth session validator

// Route params type definition
interface RouteParams {
  params: Promise<{ id: string }>; // Asynchronous params object promise
}

// PUT handler: updates user profile role options (Admin protected, blocks self-demotions)
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    // 1. Resolve parameters promise to retrieve user id
    const { id } = await params;
    // 2. Confirm session credentials role authorization
    const session = await auth();

    // Verify admin authority status
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Establish connection to MongoDB database
    await connectDB();
    const { role } = await req.json();

    // Validate that new role input parameter is a registered role shape option
    if (!role || !['customer', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // 4. Safety Guard: Do not allow active administrator to demote themselves from admin role power
    if (session.user.id === id) {
      return NextResponse.json({ error: 'You cannot change your own admin role!' }, { status: 400 });
    }

    // 5. Update user document role value in Mongoose collections
    const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

