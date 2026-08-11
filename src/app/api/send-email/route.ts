import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

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

    // Sanitize orderId before embedding in HTML to prevent stored XSS
    const safeOrderId = String(orderId || '').replace(/[^a-zA-Z0-9\-_]/g, '');

    // ── Fetch full order details for rich HTML email rendering ─────────────────
    let orderDetails: any = null;
    try {
      await connectDB();
      orderDetails = await Order.findById(safeOrderId).populate('user', 'name email').lean();
    } catch (e) {
      console.warn('[EMAIL] Could not fetch order details for email rendering:', e);
    }

    const customerName = orderDetails?.shippingAddress?.fullName || orderDetails?.user?.name || 'Icon';
    const items = orderDetails?.items || [];
    const shippingAddress = orderDetails?.shippingAddress;
    const paymentMethod = orderDetails?.paymentMethod || 'Full Online';
    const paidAmount = orderDetails?.paidAmount ?? (total || orderDetails?.totalAmount || 0);
    const codAmountDue = orderDetails?.codAmountDue || 0;
    const finalTotal = orderDetails?.totalAmount ?? (total || 0);

    // Development fallback: print mock emails in terminal if Resend token is missing locally
    if (!process.env.RESEND_API_KEY) {
      console.log(`[MOCK EMAIL] To: ${to}, Subject: ${subject}, OrderId: ${safeOrderId}`);
      return NextResponse.json({ success: true, mock: true });
    }

    // Build items HTML list with image thumbnails
    const itemsHtml = items.map((item: any) => `
      <tr style="border-bottom: 1px solid #E4D4AE;">
        <td style="padding: 12px 0; width: 60px; vertical-align: top;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 55px; object-fit: cover; border-radius: 4px; border: 1px solid #D5CFC8;" />` : ''}
        </td>
        <td style="padding: 12px 10px; vertical-align: top;">
          <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; color: #1A1410; letter-spacing: -0.01em;">${item.name || 'Vintage Piece'}</div>
          <div style="font-size: 11px; color: #6B6050; margin-top: 2px;">Size: <strong style="color: #C85A32;">${item.size || 'OS'}</strong> &nbsp;|&nbsp; Qty: ${item.quantity || 1}</div>
        </td>
        <td style="padding: 12px 0; text-align: right; vertical-align: top; font-weight: 800; font-size: 13px; color: #1A1410;">
          ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    // Address formatted string
    const addressHtml = shippingAddress ? `
      <div style="font-size: 12px; color: #1A1410; line-height: 1.6;">
        <strong>${shippingAddress.fullName || customerName}</strong><br />
        ${shippingAddress.street || ''}<br />
        ${shippingAddress.city || ''}${shippingAddress.state ? `, ${shippingAddress.state}` : ''} - ${shippingAddress.postalCode || ''}<br />
        Phone: ${shippingAddress.phone || 'N/A'}
      </div>
    ` : '<div style="font-size: 12px; color: #6B6050;">Standard Shipping</div>';

    // Payment breakdown HTML
    const paymentBreakdownHtml = paymentMethod === 'Partial COD' ? `
      <div style="background: rgba(200, 90, 50, 0.08); border: 1px solid rgba(200, 90, 50, 0.2); padding: 12px 16px; border-radius: 6px; margin-top: 16px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #C85A32; letter-spacing: 0.05em;">Payment Breakdown (Partial COD)</div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px; color: #1A1410;">
          <span>Advance Paid Online:</span>
          <strong style="color: #2e7d32;">₹${paidAmount.toLocaleString('en-IN')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 4px; color: #1A1410;">
          <span>Payable to Courier on Delivery:</span>
          <strong style="color: #C85A32;">₹${codAmountDue.toLocaleString('en-IN')}</strong>
        </div>
      </div>
    ` : `
      <div style="background: rgba(46, 125, 50, 0.08); border: 1px solid rgba(46, 125, 50, 0.2); padding: 10px 16px; border-radius: 6px; margin-top: 16px; font-size: 12px; color: #2e7d32; font-weight: 800;">
        ✓ PAID FULL ONLINE: ₹${finalTotal.toLocaleString('en-IN')}
      </div>
    `;

    // Instantiate Resend lazily only if API key is present
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Call Resend email send method
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Calotes Vintage <onboarding@resend.dev>',
      to: [to],
      subject: subject || `Your drip is officially secured! (Order #${safeOrderId.slice(-6).toUpperCase()})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin: 0; padding: 0; background-color: #EDE0C4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
          <div style="max-width: 600px; margin: 30px auto; background-color: #F5EDD8; border: 1px solid rgba(26, 20, 16, 0.15); border-radius: 8px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
            
            <!-- HEADER BANNER -->
            <div style="background-color: #1A1410; padding: 32px 24px; text-align: center; border-bottom: 3px solid #C85A32;">
              <h1 style="color: #F5EDD8; font-size: 26px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase; margin: 0;">CALOTES VINTAGE</h1>
              <p style="color: #C85A32; font-size: 10px; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; margin: 8px 0 0 0;">ADAPT. STAND OUT. BE CALOTES.</p>
            </div>

            <!-- HERO MESSAGE -->
            <div style="padding: 32px 32px 16px 32px;">
              <h2 style="color: #1A1410; font-size: 20px; font-weight: 900; margin: 0 0 12px 0;">
                Hey ${customerName},
              </h2>
              <p style="color: #1A1410; font-size: 16px; line-height: 1.5; font-weight: 800; margin: 0 0 12px 0;">
                Your drip is officially <span style="color: #C85A32; background: rgba(200,90,50,0.1); padding: 2px 8px; border-radius: 4px;">secured</span>. 🔒
              </p>
              <p style="color: #6B6050; font-size: 13px; line-height: 1.6; margin: 0;">
                Welcome to <strong>Calotes Vintage</strong> — where every piece is rare, curated, and straight-up different.
              </p>
            </div>

            <!-- ORDER SUMMARY CARD -->
            <div style="margin: 16px 32px; background: #E4D4AE; border: 1px solid rgba(26, 20, 16, 0.12); padding: 20px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(26, 20, 16, 0.15); padding-bottom: 12px; margin-bottom: 12px;">
                <span style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #1A1410;">Order Ref: #${safeOrderId.slice(-8).toUpperCase()}</span>
                <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: #1A1410; color: #F5EDD8; padding: 3px 8px; border-radius: 3px;">CONFIRMED</span>
              </div>

              <!-- ITEMS TABLE -->
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>

              <!-- TOTAL & PAYMENT BREAKDOWN -->
              <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(26, 20, 16, 0.15);">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 900; color: #1A1410;">
                  <span>TOTAL ARCHIVE VALUE:</span>
                  <span style="color: #C85A32;">₹${finalTotal.toLocaleString('en-IN')}</span>
                </div>
                ${paymentBreakdownHtml}
              </div>
            </div>

            <!-- SHIPPING ADDRESS -->
            <div style="margin: 16px 32px; background: #F5EDD8; border: 1px solid rgba(26, 20, 16, 0.12); padding: 16px; border-radius: 6px;">
              <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #6B6050; margin-bottom: 8px;">Shipping Destination:</div>
              ${addressHtml}
            </div>

            <!-- WHAT HAPPENS NEXT SECTION -->
            <div style="padding: 16px 32px;">
              <div style="font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #1A1410; margin-bottom: 6px;">
                🐍 What happens next?
              </div>
              <p style="color: #6B6050; font-size: 12px; line-height: 1.6; margin: 0 0 12px 0;">
                Your piece is now going through our <strong>selection + quality check phase</strong><br />
                <em>(because we don’t send mid stuff 🚫)</em>
              </p>
              <p style="color: #1A1410; font-size: 12px; font-weight: 700; margin: 0;">
                📦 Shipping update will hit your inbox as soon as it dispatches.
              </p>
            </div>

            <!-- VIBE REMINDER CALLOUT -->
            <div style="margin: 16px 32px; background: #1A1410; color: #F5EDD8; padding: 20px; border-radius: 6px; text-align: center;">
              <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #C85A32; margin-bottom: 4px;">🔥 Vault Reminder</div>
              <div style="font-size: 13px; font-weight: 800; line-height: 1.4;">
                You didn’t just buy clothes.<br />You just unlocked a <span style="color: #C85A32; underline;">1-of-1 vibe</span>.
              </div>
            </div>

            <!-- FOOTER LINKS & SUPPORT -->
            <div style="padding: 24px 32px 32px 32px; text-align: center; border-top: 1px solid rgba(26, 20, 16, 0.1); background-color: #EDE0C4;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #1A1410; margin-bottom: 8px;">Stay Tapped In</div>
              <div style="font-size: 12px; margin-bottom: 16px;">
                <a href="https://www.instagram.com/calotes.live/" style="color: #C85A32; font-weight: 800; text-decoration: none; margin: 0 8px;">Instagram: @calotes.live</a> &bull;
                <a href="https://calotes.in" style="color: #1A1410; font-weight: 800; text-decoration: none; margin: 0 8px;">Website: calotes.in</a>
              </div>
              <p style="font-size: 11px; color: #6B6050; line-height: 1.5; margin: 0 0 12px 0;">
                If you got any queries, just reply directly to this mail. We got you.
              </p>
              <div style="font-size: 12px; font-weight: 900; uppercase; letter-spacing: 0.1em; color: #1A1410;">
                — Team Calotes
              </div>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[EMAIL] Send failed:', error);
    return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
  }
}


