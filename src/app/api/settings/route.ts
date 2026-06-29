import { NextResponse } from 'next/server'; // Import response helpers
import connectDB from '@/lib/db'; // Import database connection pool
import Settings from '@/models/Settings'; // Import Settings mongoose model schema
import { auth } from '@/auth'; // Import NextAuth session validator

// GET settings API route: retrieves store settings properties
export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      // Fallback: create empty settings doc structure if missing
      const doc = await Settings.create({});
      settings = doc.toObject();
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST settings API route: updates store settings properties (Admin protected)
export async function POST(req: Request) {
  try {
    // 1. Validate session role
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); // Gate mutative updates
    }

    await connectDB();
    const body = await req.json(); // Read target setting values

    let settings = await Settings.findOne();
    let updated;
    if (!settings) {
      // Create new settings record
      updated = await Settings.create(body);
    } else {
      // Update existing settings record
      updated = await Settings.findByIdAndUpdate(settings._id, body, { new: true });
    }

    return NextResponse.json(updated ? updated.toObject() : {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

