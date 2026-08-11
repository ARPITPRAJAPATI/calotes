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

    // Build items HTML list with luxury image thumbnails and crisp styling
    const itemsHtml = items.map((item: any) => `
      <tr style="border-bottom: 1px solid rgba(26,20,16,0.08);">
        <td style="padding: 16px 0; width: 65px; vertical-align: middle;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 56px; height: 64px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(26,20,16,0.12); display: block;" />` : '<div style="width: 56px; height: 64px; background: #E4D4AE; border-radius: 4px;"></div>'}
        </td>
        <td style="padding: 16px 12px; vertical-align: middle;">
          <div style="font-weight: 800; font-size: 13px; text-transform: uppercase; color: #111111; letter-spacing: 0.02em; line-height: 1.3;">${item.name || 'Vintage Archive Piece'}</div>
          <div style="margin-top: 6px; display: inline-block;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; background: #111111; color: #FAF6EE; padding: 2px 7px; border-radius: 3px; letter-spacing: 0.05em;">SIZE: ${item.size || 'OS'}</span>
            <span style="font-size: 11px; color: #786C5E; margin-left: 8px;">QTY: ${item.quantity || 1}</span>
          </div>
        </td>
        <td style="padding: 16px 0; text-align: right; vertical-align: middle; font-weight: 900; font-size: 14px; color: #111111;">
          ₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    // Address formatted string
    const addressHtml = shippingAddress ? `
      <div style="font-size: 12px; color: #111111; line-height: 1.6;">
        <strong style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.02em; display: block; margin-bottom: 2px;">${shippingAddress.fullName || customerName}</strong>
        ${shippingAddress.street || ''}<br />
        ${shippingAddress.city || ''}${shippingAddress.state ? `, ${shippingAddress.state}` : ''} &bull; ${shippingAddress.postalCode || ''}<br />
        <span style="color: #786C5E; font-size: 11px;">Phone: ${shippingAddress.phone || 'N/A'}</span>
      </div>
    ` : '<div style="font-size: 12px; color: #786C5E;">Standard Shipping Destination</div>';

    // Payment breakdown HTML
    const paymentBreakdownHtml = paymentMethod === 'Partial COD' ? `
      <div style="background: rgba(200, 90, 50, 0.06); border: 1px solid rgba(200, 90, 50, 0.25); padding: 14px 16px; border-radius: 6px; margin-top: 14px;">
        <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #C85A32; letter-spacing: 0.1em; margin-bottom: 8px;">Payment Breakdown (Partial COD)</div>
        <div style="font-size: 12px; margin-top: 4px; color: #111111; display: table; width: 100%;">
          <span style="display: table-cell; text-align: left;">Advance Paid Online:</span>
          <strong style="display: table-cell; text-align: right; color: #15803d; font-size: 13px;">₹${paidAmount.toLocaleString('en-IN')}</strong>
        </div>
        <div style="font-size: 12px; margin-top: 6px; color: #111111; display: table; width: 100%;">
          <span style="display: table-cell; text-align: left;">Payable to Courier on Delivery:</span>
          <strong style="display: table-cell; text-align: right; color: #C85A32; font-size: 13px;">₹${codAmountDue.toLocaleString('en-IN')}</strong>
        </div>
      </div>
    ` : `
      <div style="background: rgba(21, 128, 61, 0.06); border: 1px solid rgba(21, 128, 61, 0.2); padding: 12px 16px; border-radius: 6px; margin-top: 14px; font-size: 11px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.05em;">
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
        <body style="margin: 0; padding: 0; background-color: #EDE0C4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;">
          
          <!-- MAIN CONTAINER -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #EDE0C4; padding: 30px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #F5EDD8; border: 1px solid rgba(26,20,16,0.15); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.12);">
                  
                  <!-- TOP BRAND ACCENT BAR -->
                  <tr>
                    <td style="height: 4px; background-color: #C85A32;"></td>
                  </tr>

                  <!-- HIGH-FASHION EDITORIAL BANNER IMAGE -->
                  <tr>
                    <td style="background-color: #0F0F0F; text-align: center; line-height: 0;">
                      <img src="https://calotes.in/images/calotes-email-hero.png" alt="Calotes Vintage Editorial" style="width: 100%; max-width: 600px; height: auto; display: block; border-bottom: 2px solid #C85A32;" />
                    </td>
                  </tr>

                  <!-- HERO HUMAN GREETING -->
                  <tr>
                    <td style="padding: 36px 36px 12px 36px;">
                      <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; color: #C85A32; margin-bottom: 8px;">ARCHIVE CONFIRMATION</div>
                      <h1 style="color: #1A1410; font-size: 24px; font-weight: 900; margin: 0 0 14px 0; letter-spacing: -0.02em;">
                        Hey ${customerName},
                      </h1>
                      <div style="font-size: 16px; font-weight: 800; color: #1A1410; line-height: 1.5; margin-bottom: 14px;">
                        Your drip is officially <span style="background: #C85A32; color: #F5EDD8; padding: 3px 10px; border-radius: 4px; font-size: 14px; letter-spacing: 0.05em; display: inline-block;">SECURED 🔒</span>
                      </div>
                      <p style="color: #6B6050; font-size: 13px; line-height: 1.6; margin: 0;">
                        Welcome to <strong>Calotes Vintage</strong> — born from a rebellion against the disposable culture of modern fast fashion. Every piece in our archive is rare, curated, and straight-up different.
                      </p>
                    </td>
                  </tr>

                  <!-- BRAND MANIFESTO QUOTE -->
                  <tr>
                    <td style="padding: 0 36px 20px 36px;">
                      <div style="background: rgba(200,90,50,0.06); border-left: 3px solid #C85A32; padding: 14px 18px; border-radius: 0 6px 6px 0;">
                        <p style="color: #1A1410; font-size: 12px; font-style: italic; line-height: 1.5; margin: 0;">
                          &ldquo;We believe garments are artifacts &mdash; pieces of history that gain character, soul, and value over time.&rdquo;
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- PROGRESS TRACKER BAR -->
                  <tr>
                    <td style="padding: 0 36px 24px 36px;">
                      <div style="background: #E4D4AE; padding: 14px 20px; border-radius: 6px; border: 1px solid rgba(26,20,16,0.1);">
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #15803d; letter-spacing: 0.05em;">
                              ✓ SECURED
                            </td>
                            <td align="center" style="font-size: 10px; color: #6B6050;">&mdash;&mdash;</td>
                            <td align="center" style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #C85A32; letter-spacing: 0.05em;">
                              QUALITY CHECK
                            </td>
                            <td align="center" style="font-size: 10px; color: #6B6050;">&mdash;&mdash;</td>
                            <td align="center" style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #6B6050; letter-spacing: 0.05em;">
                              DISPATCH
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                  </tr>

                  <!-- ORDER ARCHIVE SUMMARY CARD -->
                  <tr>
                    <td style="padding: 0 36px 20px 36px;">
                      <div style="background: #E4D4AE; border: 1px solid rgba(26,20,16,0.12); padding: 22px; border-radius: 8px;">
                        
                        <div style="display: table; width: 100%; border-bottom: 1px solid rgba(26,20,16,0.12); padding-bottom: 12px; margin-bottom: 8px;">
                          <div style="display: table-cell; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: #1A1410;">
                            ORDER REF: #${safeOrderId.slice(-8).toUpperCase()}
                          </div>
                          <div style="display: table-cell; text-align: right;">
                            <span style="font-size: 9px; font-weight: 900; text-transform: uppercase; background: #1A1410; color: #F5EDD8; padding: 3px 8px; border-radius: 3px; letter-spacing: 0.1em;">CONFIRMED</span>
                          </div>
                        </div>

                        <!-- ITEMS TABLE -->
                        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                          ${itemsHtml}
                        </table>

                        <!-- TOTALS BREAKDOWN -->
                        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(26,20,16,0.12);">
                          <div style="display: table; width: 100%; font-size: 13px; font-weight: 900; color: #1A1410;">
                            <span style="display: table-cell; text-align: left; letter-spacing: 0.05em;">TOTAL ARCHIVE VALUE:</span>
                            <span style="display: table-cell; text-align: right; color: #C85A32; font-size: 15px;">₹${finalTotal.toLocaleString('en-IN')}</span>
                          </div>
                          ${paymentBreakdownHtml}
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- SHIPPING DESTINATION CARD -->
                  <tr>
                    <td style="padding: 0 36px 20px 36px;">
                      <div style="background: #F5EDD8; border: 1px solid rgba(26,20,16,0.12); padding: 18px; border-radius: 6px;">
                        <div style="font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #6B6050; margin-bottom: 8px;">SHIPPING DESTINATION</div>
                        ${addressHtml}
                      </div>
                    </td>
                  </tr>

                  <!-- WHAT HAPPENS NEXT SECTION -->
                  <tr>
                    <td style="padding: 10px 36px 20px 36px;">
                      <div style="font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #1A1410; margin-bottom: 6px;">
                        🐍 What happens next?
                      </div>
                      <p style="color: #6B6050; font-size: 12px; line-height: 1.6; margin: 0 0 10px 0;">
                        Your piece is now going through our <strong>selection + quality check phase</strong><br />
                        <span style="font-style: italic; color: #C85A32;">(because we don’t send mid stuff 🚫)</span>
                      </p>
                      <p style="color: #1A1410; font-size: 12px; font-weight: 700; margin: 0;">
                        📦 Shipping update will hit your inbox as soon as it dispatches.
                      </p>
                    </td>
                  </tr>

                  <!-- VAULT REMINDER CARD -->
                  <tr>
                    <td style="padding: 0 36px 24px 36px;">
                      <div style="background: #1A1410; color: #F5EDD8; padding: 22px 20px; border-radius: 6px; text-align: center; border: 1px solid rgba(200,90,50,0.3);">
                        <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; color: #C85A32; margin-bottom: 6px;">🔥 VAULT REMINDER</div>
                        <div style="font-size: 13px; font-weight: 800; line-height: 1.5; letter-spacing: 0.02em;">
                          You didn’t just buy clothes.<br />You just unlocked a <span style="color: #C85A32; border-bottom: 1px solid #C85A32;">1-of-1 vibe</span>.
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- CALL TO ACTION BUTTON -->
                  <tr>
                    <td style="padding: 0 36px 30px 36px; text-align: center;">
                      <a href="https://calotes.in/profile" style="display: inline-block; background-color: #1A1410; color: #F5EDD8; text-decoration: none; padding: 16px 32px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; border-radius: 4px; border: 1px solid #1A1410; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        VIEW ORDER IN ARCHIVE &rarr;
                      </a>
                    </td>
                  </tr>

                  <!-- FOOTER LINKS & SUPPORT -->
                  <tr>
                    <td style="padding: 28px 36px 36px 36px; text-align: center; border-top: 1px solid rgba(26,20,16,0.1); background-color: #EDE0C4;">
                      <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #1A1410; margin-bottom: 10px;">STAY TAPPED IN</div>
                      <div style="font-size: 12px; margin-bottom: 16px;">
                        <a href="https://www.instagram.com/calotes.live/" style="color: #C85A32; font-weight: 800; text-decoration: none; margin: 0 10px;">Instagram @calotes.live</a> &bull;
                        <a href="https://calotes.in" style="color: #1A1410; font-weight: 800; text-decoration: none; margin: 0 10px;">Website calotes.in</a>
                      </div>
                      <p style="font-size: 11px; color: #6B6050; line-height: 1.5; margin: 0 0 12px 0;">
                        If you got any queries, just reply directly to this mail. We got you.
                      </p>
                      <div style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #1A1410;">
                        &mdash; TEAM CALOTES
                      </div>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>

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


