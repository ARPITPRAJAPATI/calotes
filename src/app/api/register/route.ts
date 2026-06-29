// Import NextResponse utility from Next.js server to handle API JSON responses and HTTP status codes
import { NextResponse } from "next/server";

// Import our database connector helper to establish connection to MongoDB
import connectDB from "@/lib/db";

// Import the Mongoose User model to query and create user documents
import User from "@/models/User";

// Import bcryptjs to securely hash user passwords before storing them in the database
import bcrypt from "bcryptjs";

// Export the asynchronous POST handler to handle registration requests
export async function POST(req: Request) {
  try {
    // Parse the incoming JSON request body to extract name, email, and password
    const { name, email, password } = await req.json();

    // Validate that all required registration fields are present
    if (!name || !email || !password) {
      // If any fields are missing, halt operation and return HTTP 400 Bad Request
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to MongoDB using our helper function
    await connectDB();

    // Query User collection to verify if a user with the requested email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists, block sign-up and return HTTP 400 Bad Request
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the plaintext password using bcrypt with 12 computational rounds (salt cycles)
    const hashedPassword = await bcrypt.hash(password, 12);

    // Write the new user document to MongoDB with the hashed password
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Return success response to the client with the created user's ID and HTTP 201 Created
    return NextResponse.json(
      { message: "User registered successfully", userId: user._id },
      { status: 201 }
    );
  } catch (error: any) {
    // Log unexpected runtime errors to the server console for debugging
    console.error("Registration error:", error);
    // Return HTTP 500 Internal Server Error back to client
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

