import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import OTP from "@/models/OTP";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Clean and normalize phone number
    const cleanPhone = phone.trim().replace(/\s+/g, "");

    // Validate phone length/format (basic sanity check: at least 7 digits)
    const digitsOnly = cleanPhone.replace(/\D/g, "");
    if (digitsOnly.length < 7) {
      return NextResponse.json(
        { message: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any existing OTP for this phone and create a fresh OTP record
    await OTP.deleteMany({ phone: cleanPhone });
    await OTP.create({
      phone: cleanPhone,
      otp: otpCode,
    });

    console.log(`[DEV OTP LOG] Phone: ${cleanPhone}, OTP: ${otpCode}`);

    return NextResponse.json(
      {
        message: "Verification code sent to your phone number",
        testHint: process.env.NODE_ENV !== "production" ? `Test OTP: ${otpCode}` : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Send phone OTP error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to send verification code" },
      { status: 500 }
    );
  }
}
