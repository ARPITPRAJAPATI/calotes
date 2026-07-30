import { NextResponse } from 'next/server'; // Import response helpers
import { Resend } from 'resend'; // Import Resend email service Node.js SDK

// Initialize Resend SDK client using process environment key variable
const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

// POST send-email API route: triggers transaction email updates (non-blocking)
export async function POST(req: Request) {
  try {
    const { to, subject, orderId, total } = await req.json();

    // Verification check: print mock emails in terminal consoles if Resend token keys are missing locally
    if (!process.env.RESEND_API_KEY) {
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return NextResponse.json({ success: true, mock: true });
    }

    // Call Resend email send method
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Calotes Vintage <onboarding@resend.dev>', // Fallback to onboarding@resend.dev if domain not verified
      to: [to], // Receiver email
      subject: subject || 'Order Confirmation - Calotes Vintage',
      // Inline styling HTML email template
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

