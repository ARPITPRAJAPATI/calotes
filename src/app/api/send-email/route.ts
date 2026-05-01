import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend (requires RESEND_API_KEY in .env.local)
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function POST(req: Request) {
  try {
    const { to, subject, orderId, total } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return NextResponse.json({ success: true, mock: true });
    }

    const data = await resend.emails.send({
      from: 'Calotes Vintage <orders@calotesvintage.com>',
      to: [to],
      subject: subject || 'Order Confirmation - Calotes Vintage',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #F2EDE6; color: #111010; padding: 40px;">
          <h1 style="text-transform: uppercase; font-weight: 900; letter-spacing: -0.05em; margin-bottom: 24px;">Order Confirmed.</h1>
          <p style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; font-size: 12px;">Order ID: ${orderId}</p>
          <p>Thank you for shopping the archive. We are preparing your order.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #D5CFC8;">
             <strong>Total: ₹${total}</strong>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
