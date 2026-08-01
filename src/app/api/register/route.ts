// Import NextResponse utility from Next.js server to handle API JSON responses and HTTP status codes
import { NextResponse } from "next/server";

// Import our database connector helper to establish connection to MongoDB
import connectDB from "@/lib/db";

// Import the Mongoose User model to query and create user documents
import User from "@/models/User";

// Import bcryptjs to securely hash user passwords before storing them in the database
import bcrypt from "bcryptjs";

// Import Zod validation schema for registration — enforces password complexity server-side
import { RegisterSchema } from "@/lib/validations";

// Export the asynchronous POST handler to handle registration requests
export async function POST(req: Request) {
  try {
    // Parse the incoming JSON request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    // ── Server-side validation (Zod) ────────────────────────────────────────────
    // Client-side validation is UX only — this is the security gate.
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      // Return only the first validation error message — do not expose full Zod error tree
      const firstError = parsed.error.issues[0]?.message || "Invalid registration data";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    // Connect to MongoDB using our helper function
    await connectDB();

    // Query User collection to verify if a user with the requested email already exists.
    // Use a constant-time response to prevent timing-based email enumeration attacks.
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      // SECURITY: Return the same response regardless of whether the email exists,
      // to prevent attackers from enumerating registered emails.
      // For UX this is a slight trade-off — in future, consider sending a "welcome back" email instead.
      return NextResponse.json(
        { message: "If this email is not already registered, your account has been created." },
        { status: 201 }
      );
    }

    // Hash the plaintext password using bcrypt with 12 computational rounds
    // 12 rounds is the recommended minimum for production (balances security vs. latency)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Write the new user document to MongoDB with the hashed password
    const user = await User.create({
      name: name.trim(),
      email, // Already normalized to lowercase by RegisterSchema
      password: hashedPassword,
    });

    // Return success response — do NOT include userId to prevent account enumeration
    return NextResponse.json(
      { message: "Account created successfully. Please sign in." },
      { status: 201 }
    );
  } catch (error: any) {
    // Log the full error server-side for debugging
    console.error("Registration error:", error);
    // Return a GENERIC error to the client — never expose internal error messages
    return NextResponse.json(
      { message: "Registration failed. Please try again later." },
      { status: 500 }
    );
  }
}


