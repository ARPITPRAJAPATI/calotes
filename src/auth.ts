// Import the core NextAuth package to handle configuration and initialization of Auth.js (v5)
import NextAuth from "next-auth";

// Import the MongoDB adapter for Auth.js to allow automatic persistence of OAuth accounts/sessions in MongoDB
import { MongoDBAdapter } from "@auth/mongodb-adapter";

// Import clientPromise which holds the connection singleton to MongoDB for Auth.js adapter use
import clientPromise from "@/lib/mongodb";

// Import our custom Mongoose connection utility to ensure we connect to MongoDB for custom Mongoose operations
import connectDB from "@/lib/db";

// Import the User model defined using Mongoose to query user data from the database
import User from "@/models/User";

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
      // The authorize function runs when a user attempts to sign in via Credentials (email/password)
      async authorize(credentials) {
        // If email or password is not provided in the credentials object, abort the login process immediately
        if (!credentials?.email || !credentials?.password) return null;

        // Establish connection to MongoDB using Mongoose connection helper
        await connectDB();

        // Query the database for the user with the matching email address, explicitly selecting the password field (which is hidden by default in the schema)
        const user = await User.findOne({ email: credentials.email }).select("+password");

        // If no user is found with this email, or the user does not have a password (e.g. they registered via Google), deny authentication
        if (!user || !user.password) return null;

        // Compare the plaintext password input with the hashed password retrieved from the database
        const isPasswordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        // If password verification fails, return null to deny access
        if (!isPasswordMatch) return null;

        // On successful authentication, return user details that will be serialized into the JWT token and session
        return {
          id: user._id.toString(), // Convert MongoDB ObjectId to string format
          name: user.name,         // Attach name
          email: user.email,       // Attach email
          role: user.role,         // Attach role (important for admin page access control)
          image: user.avatar || user.image, // Fallback profile image selection
        };
      },
    }),
  ],

  // Enable debug logging in development to output authentication events, warnings, and errors to the console
  debug: true,
});

