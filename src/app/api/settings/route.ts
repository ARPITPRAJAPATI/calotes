import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { auth } from '@/auth';

export async function GET() {
  try {
    await connectDB();
    let settings = await Settings.findOne().lean();
    if (!settings) {
      const doc = await Settings.create({});
      settings = doc.toObject();
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    let settings = await Settings.findOne();
    let updated;
    if (!settings) {
      updated = await Settings.create(body);
    } else {
      updated = await Settings.findByIdAndUpdate(settings._id, body, { new: true });
    }

    return NextResponse.json(updated ? updated.toObject() : {});
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
