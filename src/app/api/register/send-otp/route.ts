import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_mock_key");

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Remove any existing OTP for this email and create fresh OTP record
    await OTP.deleteMany({ email: normalizedEmail });
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      name: name.trim(),
      password: hashedPassword,
    });

    // Send Email via Resend gracefully
    if (process.env.RESEND_API_KEY) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "Calotes Vintage <onboarding@resend.dev>";
        const sendResult = await resend.emails.send({
          from: fromEmail,
          to: [normalizedEmail],
          subject: `${otpCode} is your Calotes Verification Code`,
          html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0a; color: #f0f0f0; padding: 40px; border-radius: 12px; border: 1px solid #2a2a2a;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 28px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin: 0; color: #f0f0f0;">Calotes<span style="color: #c85a32;">.</span></h1>
                <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #777; margin-top: 6px;">Verification Code</p>
              </div>
              
              <p style="font-size: 14px; color: #aaa; text-align: center; margin-bottom: 24px;">Hi ${name}, enter the verification code below to complete your registration:</p>
              
              <div style="background: #141414; border: 1px solid #c85a32; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 28px;">
                <span style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #c85a32; font-family: monospace;">${otpCode}</span>
              </div>
              
              <p style="font-size: 12px; color: #666; text-align: center; margin: 0;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        });

        if (sendResult.error) {
          console.warn("[Resend Notice]:", sendResult.error.message);
        }
      } catch (emailErr: any) {
        console.warn("[Resend Exception]:", emailErr.message);
      }
    } else {
      console.log(`[DEV OTP LOG] Email: ${normalizedEmail}, OTP: ${otpCode}`);
    }

    return NextResponse.json(
      { 
        message: "Verification code sent to your email",
        // In development/test mode without verified domain, provide helper notice
        testHint: process.env.NODE_ENV !== "production" ? `Test OTP: ${otpCode}` : undefined
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send verification code" },
      { status: 500 }
    );
  }
}
