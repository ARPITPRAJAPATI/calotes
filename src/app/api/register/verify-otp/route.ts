import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import OTP from "@/models/OTP";
import bcrypt from "bcryptjs";
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

    const { name, email, password } = parsed.data;
    const body = sanitizedBody as Record<string, string>;
    const otp = body.otp;

    if (!otp || typeof otp !== 'string') {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // Query OTP document
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: cleanOtp,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    // Double-check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      await OTP.deleteMany({ email: normalizedEmail });
      return NextResponse.json(
        { message: "Account already exists" },
        { status: 400 }
      );
    }

    // Hash user password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create User record with hashed password
    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Clear used OTP record
    await OTP.deleteMany({ email: normalizedEmail });

    return NextResponse.json(
      { message: "Account created successfully. Please sign in." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { message: "Failed to verify code" },
      { status: 500 }
    );
  }
}

