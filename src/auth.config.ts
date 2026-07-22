// Import NextAuthConfig type definitions from next-auth package to enforce typescript check on configuration
import type { NextAuthConfig } from "next-auth";

// Import Google provider configuration from next-auth providers to support third-party Google Sign-In
import Google from "next-auth/providers/google";

// Import Credentials provider helper to define credentials authentication interface matching
import Credentials from "next-auth/providers/credentials";

// Export the edge-compatible NextAuth configuration object
export const authConfig = {
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  // Define active authentication providers
  providers: [
    // Configure standard Google Sign-In provider using environment credentials
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,         // Read Google Client ID from environment variables
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Read Google Client Secret from environment variables
      allowDangerousEmailAccountLinking: true,       // Allow linking Google OAuth accounts with existing email user records
    }),
    
    // Register credentials provider stub here (Edge middleware doesn't support direct Node.js DB connections, so the logic is in full auth.ts)
    Credentials({
      // Provide a dummy authorization method returning null to avoid initialization crash in Edge runtime
      authorize: async () => null 
    })
  ],

  // Configure middleware-compatible callbacks that execute during login/session verification
  callbacks: {
    // The jwt callback runs whenever a JSON Web Token is created or updated (e.g., at login or token refresh)
    async jwt({ token, user }) {
      // If user object exists (this block executes only during the initial sign-in phase)
      if (user) {
        token.id = user.id || (user as any)._id?.toString(); // Persist the custom database user ID inside the encrypted JWT token
        token.role = (user as any).role || "customer"; // Persist the user role (customer/admin) in the JWT token
      }
      return token;                                   // Return the updated token object
    },

    // The session callback runs whenever a session is verified (e.g., when useSession() is called in UI)
    async session({ session, token }) {
      // If the session object contains a user object (which is standard)
      if (session.user) {
        (session.user as any).id = token.id;          // Map user ID from JWT token metadata back into the current session user object
        (session.user as any).role = token.role;      // Map user role from JWT token metadata back into the current session user object
      }
      return session;                                 // Return the session object for client-side usage
    },
  },

  // Map customized authentication page routes
  pages: {
    signIn: "/login", // Redirect unauthorized page requests to our custom login route instead of default /api/auth/signin
  },

  // Session storage settings
  session: {
    strategy: "jwt",  // Use secure client-side JSON Web Token cookie storage instead of database session records
  },
} satisfies NextAuthConfig; // Enforce typing validation against NextAuthConfig shape

