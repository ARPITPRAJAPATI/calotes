// Import the core NextAuth package to handle configuration and initialization of Auth.js (v5)
import NextAuth from "next-auth";

// Import the MongoDB adapter for Auth.js to allow automatic persistence of OAuth accounts/sessions in MongoDB
import { MongoDBAdapter } from "@auth/mongodb-adapter";

// Import clientPromise which holds the connection singleton to MongoDB for Auth.js adapter use
import clientPromise from "@/lib/mongodb";

// Import our custom Mongoose connection utility to ensure we connect to MongoDB for custom Mongoose operations
import connectDB from "@/lib/db";

// Import the User and OTP models defined using Mongoose to query user data from the database
import User from "@/models/User";
import OTP from "@/models/OTP";

// Import bcryptjs library to securely compare plaintext passwords with database hashed passwords
import bcrypt from "bcryptjs";

// Import basic configuration shared between auth.ts and edge middleware (next-auth callbacks, session config, pages)
import { authConfig } from "./auth.config";

// Import the Credentials provider to support custom username/email and password authentication
import Credentials from "next-auth/providers/credentials";

// Destructure handlers (GET/POST endpoints), auth (session retrieval function), and signIn/signOut helpers from NextAuth initialization
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Spread all initial/shared configurations (callbacks, pages, session strategy) from auth.config
  ...authConfig,

  // Set the MongoDB adapter to use the verified MongoDB connection promise for Auth.js schema migrations
  adapter: MongoDBAdapter(clientPromise),

  // Configure authentication providers
  providers: [
    // Filter out the stub credentials provider defined in the edge-compatible config so we can define the full database-connected one here
    ...authConfig.providers.filter(p => p.id !== "credentials"),

    // Register our fully-functional credentials provider
    Credentials({
      // The authorize function runs when a user attempts to sign in via Credentials (email/password or phone/OTP)
      async authorize(credentials) {
        if (!credentials) return null;

        // Establish connection to MongoDB using Mongoose connection helper
        await connectDB();

        const email = credentials.email ? (credentials.email as string).toLowerCase().trim() : "";
        const phone = credentials.phone ? (credentials.phone as string).trim() : "";
        const password = credentials.password ? (credentials.password as string) : "";
        const otp = credentials.otp ? (credentials.otp as string).trim() : "";

        // Case 1: Email + Password Authentication
        if (email && password) {
          const user = await User.findOne({ email }).select("+password");
          if (!user || !user.password) return null;
          const isPasswordMatch = await bcrypt.compare(password, user.password);
          if (!isPasswordMatch) return null;
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar || user.image,
          };
        }

        // Case 2: Phone + OTP Verification Code Authentication
        if (phone && otp) {
          // Query OTP document (supports real OTP or master test code 123456)
          let otpRecord = await OTP.findOne({ phone, otp });
          if (!otpRecord && otp === "123456") {
            otpRecord = await OTP.findOne({ phone }).sort({ createdAt: -1 });
          }
          if (!otpRecord && otp !== "123456") return null;

          // Find existing user by phone or auto-create account for phone user
          let user = await User.findOne({ phone });
          if (!user) {
            const cleanDigits = phone.replace(/\D/g, "");
            const generatedEmail = `${cleanDigits || Date.now()}@phone.user`;
            user = await User.findOne({ email: generatedEmail });
            if (!user) {
              user = await User.create({
                name: `User ${phone.slice(-4) || "Phone"}`,
                email: generatedEmail,
                phone: phone,
                role: "customer",
              });
            }
          }

          // Clear used OTP record
          if (otpRecord) {
            await OTP.deleteMany({ phone });
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar || user.image,
          };
        }

        // Case 3: Phone + Password Authentication
        if (phone && password) {
          const user = await User.findOne({ phone }).select("+password");
          if (!user || !user.password) return null;
          const isPasswordMatch = await bcrypt.compare(password, user.password);
          if (!isPasswordMatch) return null;
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.avatar || user.image,
          };
        }

        return null;
      },
    }),
  ],

  // Enable debug logging in development to output authentication events, warnings, and errors to the console
  debug: true,
});


