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

    // Build items HTML list matching exact Retentionly Minimalist Atelier layout with Dior Light Typography
    const itemsHtml = items.map((item: any) => `
      <div style="text-align: center; margin-bottom: 30px;">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 210px; height: 230px; object-fit: cover; border-radius: 4px; margin: 0 auto 16px auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.04);" />` : '<div style="width: 210px; height: 230px; background: #F5F5F5; border-radius: 4px; margin: 0 auto 16px auto;"></div>'}
        <div style="font-family: 'Cinzel', 'Didot', 'Bodoni MT', 'Playfair Display', 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-weight: 400; color: #222222; margin-bottom: 6px; letter-spacing: 0.08em; text-transform: uppercase;">${item.name || 'Vintage Piece'}</div>
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; font-weight: 300; color: #666666; margin-bottom: 6px; letter-spacing: 0.02em;">Size: <strong style="color: #222222; font-weight: 500;">${item.size || 'OS'}</strong> &nbsp;&bull;&nbsp; Quantity: ${item.quantity || 1}</div>
        <div style="font-family: 'Cinzel', 'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 500; color: #222222; letter-spacing: 0.05em;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</div>
      </div>
    `).join('');

    // Address formatted string
    const addressHtml = shippingAddress ? `
      <div style="font-size: 12px; color: #555555; line-height: 1.6; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300;">
        <strong style="color: #222222; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; font-family: 'Cinzel', 'Didot', Georgia, serif; font-weight: 500;">${shippingAddress.fullName || customerName}</strong><br />
        ${shippingAddress.street || ''}, ${shippingAddress.city || ''}${shippingAddress.state ? `, ${shippingAddress.state}` : ''} - ${shippingAddress.postalCode || ''}<br />
        <span style="color: #888888; font-size: 11px;">Phone: ${shippingAddress.phone || 'N/A'}</span>
      </div>
    ` : '<div style="font-size: 12px; color: #888888; text-align: center; font-weight: 300;">Standard Shipping Destination</div>';

    // Payment breakdown HTML
    const paymentBreakdownHtml = paymentMethod === 'Partial COD' ? `
      <div style="border: 1px solid #E5E5E5; padding: 14px; border-radius: 4px; margin-top: 14px; background-color: #FAFAFA;">
        <div style="font-size: 10px; font-weight: 500; text-transform: uppercase; color: #C85A32; letter-spacing: 0.15em; text-align: center; margin-bottom: 6px; font-family: 'Cinzel', 'Didot', Georgia, serif;">Partial COD Breakdown</div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #444444; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300;">
          <span>Advance Paid Online:</span>
          <strong style="color: #15803d; font-weight: 500;">₹${paidAmount.toLocaleString('en-IN')}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #444444; margin-top: 4px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300;">
          <span>Payable on Delivery:</span>
          <strong style="color: #C85A32; font-weight: 500;">₹${codAmountDue.toLocaleString('en-IN')}</strong>
        </div>
      </div>
    ` : `
      <div style="border: 1px solid #E5E5E5; padding: 10px 14px; border-radius: 4px; margin-top: 14px; background-color: #FAFAFA; text-align: center; font-size: 10px; font-weight: 500; color: #15803d; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Cinzel', 'Didot', Georgia, serif;">
        ✓ Paid Full Online: ₹${finalTotal.toLocaleString('en-IN')}
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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet" />
        </head>
        <body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility;">
          
          <!-- MAIN CONTAINER -->
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #FFFFFF; border: 1px solid #EBEBEB; border-radius: 4px; padding: 48px 36px; box-shadow: 0 4px 25px rgba(0,0,0,0.03);">
                  
                  <!-- TOP BRAND ATELIER HEADER -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <!-- Minimalist Shopping Bag Icon - Gmail Compatible Img Tag -->
                      <img src="https://img.icons8.com/ios-glyphs/48/222222/shopping-bag.png" width="22" height="22" alt="Calotes Atelier" style="display: block; margin: 0 auto 12px auto; border: 0;" />
                      <!-- DIOR STYLE LIGHT HIGH-FASHION SERIF LOGO -->
                      <div style="font-family: 'Cinzel', 'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 400; letter-spacing: 0.3em; text-transform: uppercase; color: #222222; line-height: 1;">
                        CALOTES
                      </div>
                    </td>
                  </tr>

                  <!-- DIOR STYLE LIGHT HERO HEADING -->
                  <tr>
                    <td align="center" style="padding-bottom: 16px;">
                      <h1 style="font-family: 'Cinzel', 'Didot', 'Bodoni MT', 'Playfair Display', 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 400; color: #222222; margin: 0; letter-spacing: 0.08em; text-transform: uppercase; line-height: 1.2;">
                        YOUR DRIP IS SECURED
                      </h1>
                    </td>
                  </tr>

                  <!-- SUBTITLE / DESCRIPTION -->
                  <tr>
                    <td align="center" style="padding-bottom: 28px;">
                      <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-weight: 400; color: #555555; line-height: 1.6; max-width: 440px; margin: 0 auto; letter-spacing: 0.02em; font-style: italic;">
                        Hey <strong>${customerName}</strong>, thank you for acquiring from the archive. We saved your piece for you and are carefully preparing your order for shipment.
                      </p>
                    </td>
                  </tr>

                  <!-- PILL CODE / ORDER REF BADGE -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <div style="display: inline-block; border: 1px solid #333333; border-radius: 50px; padding: 9px 22px; font-size: 10px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; color: #222222; font-family: 'Cinzel', 'Didot', Georgia, serif;">
                        ORDER REF: #${safeOrderId.slice(-8).toUpperCase()}
                      </div>
                    </td>
                  </tr>

                  <!-- THIN DIVIDER LINE 1 -->
                  <tr>
                    <td style="padding-bottom: 36px;">
                      <div style="border-top: 1px solid #E5E5E5; width: 100%;"></div>
                    </td>
                  </tr>

                  <!-- DIOR STYLE LIGHT SECTION TITLE -->
                  <tr>
                    <td align="center" style="padding-bottom: 28px;">
                      <h2 style="font-family: 'Cinzel', 'Didot', 'Bodoni MT', 'Playfair Display', Georgia, serif; font-size: 15px; font-weight: 400; color: #222222; margin: 0; letter-spacing: 0.15em; text-transform: uppercase;">
                        HERE'S WHAT YOU ACQUIRED
                      </h2>
                    </td>
                  </tr>

                  <!-- CENTERED PRODUCTS LIST -->
                  <tr>
                    <td align="center" style="padding-bottom: 12px;">
                      ${itemsHtml}
                    </td>
                  </tr>

                  <!-- PILL ACTION BUTTON (LIGHT HIGH-FASHION STYLE) -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <a href="https://calotes.in/profile" style="display: inline-block; background-color: #222222; color: #FFFFFF; text-decoration: none; padding: 15px 38px; border-radius: 50px; font-size: 10px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; font-family: 'Cinzel', 'Didot', Georgia, serif; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        VIEW YOUR ORDER IN ARCHIVE
                      </a>
                    </td>
                  </tr>

                  <!-- SUMMARY & SHIPPING CARD -->
                  <tr>
                    <td style="padding-bottom: 32px;">
                      <div style="border: 1px solid #EAEAEA; padding: 20px; border-radius: 4px; background-color: #FAFAFA;">
                        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: 500; color: #222222; margin-bottom: 8px; font-family: 'Cinzel', 'Didot', Georgia, serif; letter-spacing: 0.05em;">
                          <span>Total Archive Value:</span>
                          <span>₹${finalTotal.toLocaleString('en-IN')}</span>
                        </div>
                        ${paymentBreakdownHtml}
                        <div style="border-top: 1px solid #EAEAEA; margin-top: 14px; padding-top: 14px;">
                          <div style="font-size: 9px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2em; color: #888888; margin-bottom: 6px; text-align: center; font-family: 'Cinzel', 'Didot', Georgia, serif;">Shipping Destination</div>
                          ${addressHtml}
                        </div>
                      </div>
                    </td>
                  </tr>

                  <!-- THIN DIVIDER LINE 2 -->
                  <tr>
                    <td style="padding-bottom: 36px;">
                      <div style="border-top: 1px solid #E5E5E5; width: 100%;"></div>
                    </td>
                  </tr>

                  <!-- RETENTIONLY STYLE SOCIAL ICONS ROW (FB, IG, X, WA) & FOOTER -->
                  <tr>
                    <td align="center">
                      <!-- CIRCULAR SOCIAL MEDIA ICONS ROW (FB, IG, X, WA) - GMAIL COMPATIBLE IMG TAGS -->
                      <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 24px auto;">
                        <tr>
                          <!-- Facebook -->
                          <td style="padding: 0 10px;">
                            <a href="https://calotes.in" style="text-decoration: none; display: inline-block;">
                              <img src="https://img.icons8.com/ios-glyphs/48/222222/facebook-new.png" width="22" height="22" alt="Facebook" style="display: block; border: 0;" />
                            </a>
                          </td>
                          <!-- Instagram -->
                          <td style="padding: 0 10px;">
                            <a href="https://www.instagram.com/calotes.live/" style="text-decoration: none; display: inline-block;">
                              <img src="https://img.icons8.com/ios-glyphs/48/222222/instagram-new.png" width="22" height="22" alt="Instagram" style="display: block; border: 0;" />
                            </a>
                          </td>
                          <!-- X (Twitter) -->
                          <td style="padding: 0 10px;">
                            <a href="https://calotes.in" style="text-decoration: none; display: inline-block;">
                              <img src="https://img.icons8.com/ios-glyphs/48/222222/twitter--v1.png" width="22" height="22" alt="X" style="display: block; border: 0;" />
                            </a>
                          </td>
                          <!-- WhatsApp -->
                          <td style="padding: 0 10px;">
                            <a href="https://wa.me/919999999999" style="text-decoration: none; display: inline-block;">
                              <img src="https://img.icons8.com/ios-glyphs/48/222222/whatsapp.png" width="22" height="22" alt="WhatsApp" style="display: block; border: 0;" />
                            </a>
                          </td>
                        </tr>
                      </table>

                      <!-- BRAND NAME & ADDRESS -->
                      <div style="font-family: 'Cinzel', 'Didot', 'Bodoni MT', Georgia, serif; font-size: 13px; font-weight: 400; color: #222222; margin-bottom: 6px; letter-spacing: 0.15em; text-transform: uppercase;">
                        Calotes Vintage
                      </div>
                      <div style="font-size: 11px; color: #777777; margin-bottom: 18px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300;">
                        New Delhi, India &bull; Hand-picked Vintage Streetwear
                      </div>

                      <!-- UNSUBSCRIBE / FOOTER NOTE -->
                      <div style="font-size: 11px; color: #888888; line-height: 1.5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300;">
                        Don't want to receive this email? <a href="https://calotes.in/profile" style="color: #444444; text-decoration: underline;">Unsubscribe here</a>
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


