import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// POST send-email API route: triggers transactional email updates.
// SECURITY: This endpoint is INTERNAL-ONLY and requires the X-Internal-Secret header.
// It must never be called directly by clients — only by server-side code in this app.
// The secret prevents public abuse of our Resend sending quota and reputation.

export async function POST(req: Request) {
  try {
    // ── Internal authentication ────────────────────────────────────────────────
    // Verify the request carries our internal API secret header.
    // Without this, any public caller could spam emails through our Resend account.
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedSecret = process.env.INTERNAL_API_SECRET;

    if (!expectedSecret) {
      // Fail closed: if secret is not configured, block all sends
      console.error('[EMAIL] INTERNAL_API_SECRET is not configured — blocking email send');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
    }

    if (!internalSecret || internalSecret !== expectedSecret) {
      console.warn('[EMAIL] Blocked unauthorized email send attempt (missing or invalid internal secret)');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { to, subject, orderId, total } = await req.json();

    // Validate required fields
    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Invalid recipient' }, { status: 400 });
    }

    // Sanitize orderId before embedding in HTML to prevent stored XSS.
    // Replace any non-alphanumeric characters (except hyphens/underscores).
    const safeOrderId = String(orderId || '').replace(/[^a-zA-Z0-9\-_]/g, '');
    const safeTotal = Number(total) || 0;

    // Development fallback: print mock emails in terminal if Resend token is missing locally
    if (!process.env.RESEND_API_KEY) {
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, OrderId: ${safeOrderId}`);
      return NextResponse.json({ success: true, mock: true });
    }

    // Instantiate Resend lazily only if API key is present
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Call Resend email send method
    const data = await resend.emails.send({

      from: process.env.RESEND_FROM_EMAIL || 'Calotes Vintage <onboarding@resend.dev>',
      to: [to],
      subject: subject || 'Order Confirmation — Calotes Vintage',
      // Inline styling HTML email template with sanitized variables
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #F2EDE6; color: #111010; padding: 40px;">
          <h1 style="text-transform: uppercase; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 24px;">Order Confirmed.</h1>
          <p style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Order ID: ${safeOrderId}</p>
          <p>Thank you for shopping the archive. We are preparing your order.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #D5CFC8;">
             <strong>Total: ₹${safeTotal.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[EMAIL] Send failed:', error);
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
  }
}


