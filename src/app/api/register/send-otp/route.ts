import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import { Resend } from "resend";
import { RegisterSchema } from "@/lib/validations";
import { sanitizeMongoOperators } from "@/lib/sanitize";

export async function POST(req: Request) {
  try {
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    const sanitizedBody = sanitizeMongoOperators(rawBody);
    const parsed = RegisterSchema.safeParse(sanitizedBody);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { name, email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      return NextResponse.json(
        { message: "If this email is not already registered, a verification code has been sent." },
        { status: 200 }
      );
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any existing OTP for this email and create fresh OTP record without password field
    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      name: name.trim(),
    });

    // Send Email via Resend gracefully (only if API key exists)
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Calotes Vintage <onboarding@resend.dev>";
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: [normalizedEmail],
          subject: `${otpCode} is your Calotes Verification Code`,
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
                      <!-- Minimalist Lock Icon - Gmail Compatible Img Tag -->
                      <img src="https://img.icons8.com/ios-glyphs/48/222222/lock--v1.png" width="22" height="22" alt="Verification Lock" style="display: block; margin: 0 auto 12px auto; border: 0;" />
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
                        VERIFICATION CODE
                      </h1>
                    </td>
                  </tr>

                  <!-- SUBTITLE / DESCRIPTION -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <p style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-weight: 400; color: #555555; line-height: 1.6; max-width: 440px; margin: 0 auto; letter-spacing: 0.02em; font-style: italic;">
                        Hi <strong>${name}</strong>, enter the verification code below to complete your registration and unlock access to the archive.
                      </p>
                    </td>
                  </tr>

                  <!-- PILL CODE OTP DISPLAY -->
                  <tr>
                    <td align="center" style="padding-bottom: 32px;">
                      <div style="display: inline-block; border: 1px solid #222222; border-radius: 50px; padding: 18px 40px; background-color: #FAFAFA;">
                        <span style="font-family: 'Cinzel', 'Didot', 'Bodoni MT', Georgia, serif; font-size: 34px; font-weight: 500; letter-spacing: 0.25em; color: #222222; display: block;">${otpCode}</span>
                      </div>
                    </td>
                  </tr>

                  <!-- VALIDITY NOTE -->
                  <tr>
                    <td align="center" style="padding-bottom: 36px;">
                      <p style="font-size: 11px; color: #888888; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-weight: 300; line-height: 1.5;">
                        This code is valid for 10 minutes. If you did not request this code, please ignore this email.
                      </p>
                    </td>
                  </tr>

                  <!-- THIN DIVIDER LINE -->
                  <tr>
                    <td style="padding-bottom: 36px;">
                      <div style="border-top: 1px solid #E5E5E5; width: 100%;"></div>
                    </td>
                  </tr>

                  <!-- RETENTIONLY STYLE SOCIAL ICONS ROW (FB, IG, X, WA) & FOOTER -->
                  <tr>
                    <td align="center">
                      <!-- CIRCULAR SOCIAL MEDIA ICONS ROW -->
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
                        Don't want to receive this email? <a href="https://calotes.in" style="color: #444444; text-decoration: underline;">Unsubscribe here</a>
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

        if (sendResult.error) {
          console.warn("[Resend Notice]:", sendResult.error.message);
        }
      } catch (emailErr: any) {
        console.warn("[Resend Exception]:", emailErr.message);
      }
    }

    return NextResponse.json(
      { 
        message: "Verification code sent to your email"
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { message: "Failed to send verification code" },
      { status: 500 }
    );
  }
}


