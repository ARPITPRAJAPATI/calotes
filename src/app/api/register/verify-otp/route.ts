import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // Query OTP document (supports real OTP or master test code 123456)
    let otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: cleanOtp,
    });

    // Master test code fallback during testing
    if (!otpRecord && cleanOtp === "123456") {
      otpRecord = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    }

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    // Double-check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      await OTP.deleteMany({ email: normalizedEmail });
      return NextResponse.json(
        { message: "Account already exists" },
        { status: 400 }
      );
    }

    // Create User record with pre-hashed password stored in OTP document
    const newUser = await User.create({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password,
    });

    // Clear used OTP record
    await OTP.deleteMany({ email: normalizedEmail });

    return NextResponse.json(
      { message: "Account created successfully", userId: newUser._id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to verify code" },
      { status: 500 }
    );
  }
}
