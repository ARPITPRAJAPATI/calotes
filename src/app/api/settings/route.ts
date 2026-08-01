import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Settings from '@/models/Settings';
import { auth } from '@/auth';
import { StoreSettingsInputSchema } from '@/lib/validations';

// Public fields safe to expose to unauthenticated visitors
// Private fields (promo codes, admin config, API keys) are excluded
const PUBLIC_SETTINGS_FIELDS = {
  storeName: 1,
  freeShippingThreshold: 1,
  shippingFlatRate: 1,
  contactEmail: 1,
  supportPhone: 1,
} as const;

// GET settings API route: returns PUBLIC settings to guests, FULL settings to admins
export async function GET() {
  try {
    await connectDB();
    const session = await auth();
    const isAdmin = session?.user && (session.user as any).role === 'admin';

    let settings;
    if (isAdmin) {
      settings = await Settings.findOne().lean();
    } else {
      settings = await Settings.findOne().select(PUBLIC_SETTINGS_FIELDS).lean();
    }

    if (!settings && isAdmin) {
      // Fallback: create empty settings doc if missing (admin only)
      const doc = await Settings.create({});
      settings = doc.toObject();
    }

    return NextResponse.json(settings || {}, {
      headers: {
        // Cache public settings for 2 minutes — admin settings never cached
        'Cache-Control': isAdmin ? 'no-store' : 'public, s-maxage=120, stale-while-revalidate=600',
      },
    });
  } catch (error: any) {
    console.error('Settings fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// POST settings API route: updates store settings (Admin protected)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    // Validate body against schema before writing to DB
    const parsed = StoreSettingsInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid settings data' }, { status: 400 });
    }

    let settings = await Settings.findOne();
    let updated;
    if (!settings) {
      updated = await Settings.create(parsed.data);
    } else {
      updated = await Settings.findByIdAndUpdate(settings._id, parsed.data, { new: true });
    }

    return NextResponse.json(updated ? updated.toObject() : {});
  } catch (error: any) {
    console.error('Settings update failed:', error);
    return NextResponse.json({ error: 'Settings update failed' }, { status: 500 });
  }
}
