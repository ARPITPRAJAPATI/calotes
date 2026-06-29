// Import the NextAuth library to initialize authentication rules and helper functions
import NextAuth from "next-auth";

// Import authConfig configuration options to supply settings to NextAuth middleware
import { authConfig } from "./auth.config";

// Import NextResponse to customize and send HTTP response actions (e.g. rate limit JSON payloads)
import { NextResponse } from "next/server";

// Destructure the main edge-compatible auth wrapper function from NextAuth
const { auth } = NextAuth(authConfig);

// A simple in-memory Map store for rate limiting (Note: clears on server restart or edge function cold start)
// Key: Client IP string, Value: Object tracking requests count and when the window reset timer started
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

// Rate limit evaluator function that checks if an IP has exceeded the allowed query limit within a timeframe
function applyRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now(); // Get current timestamp in milliseconds
  const record = rateLimitMap.get(ip); // Retrieve history of this IP
  
  // If no entry exists, or the current time exceeds the reset window threshold
  if (!record || (now - record.lastReset) > windowMs) {
    // Reset/initialize tracking for this IP
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true; // Request allowed
  }

  // If request count has reached or exceeded the configured limit
  if (record.count >= limit) {
    return false; // Request blocked (rate limited)
  }

  // Increment request count by 1
  record.count += 1;
  return true; // Request allowed
}

// Export the NextAuth middleware wrapper, wrapping our custom request processing function
export default auth((req) => {
  const { nextUrl } = req; // Destructure the requested URL details
  const isLoggedIn = !!req.auth; // Boolean flag checking if session token is validated

  // 1. Rate Limiting for API Endpoints (Excluding the default NextAuth internal endpoints)
  if (nextUrl.pathname.startsWith('/api') && !nextUrl.pathname.startsWith('/api/auth')) {
    // Extract IP address from request metadata, custom proxy headers, or fallback to localhost loopback
    const ip = (req as any).ip ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? '127.0.0.1';
    
    let limit = 120; // Default API limit (raised to 120 to ensure seamless high-speed browsing)
    
    // Set a much lower limit for the register endpoint to mitigate bot account creation scripts
    if (nextUrl.pathname.startsWith('/api/register')) {
      limit = 15; // Stricter for register route
    }

    // Apply rate limit check over a 1-minute (60,000ms) sliding window
    const allowed = applyRateLimit(ip, limit, 60 * 1000); // 1 minute window
    
    // If rate limit checks fail, block request and return HTTP 429 Too Many Requests response
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  }

  // 2. NextAuth Routing & Access Control Rules
  const isApiRoute = nextUrl.pathname.startsWith("/api"); // True if calling backend API routes
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth"); // True if calling auth controller handlers
  
  // Array matching of public pages that guests are permitted to view without active login session
  const isPublicRoute = ["/", "/shop", "/products"].some(path => nextUrl.pathname === path || nextUrl.pathname.startsWith("/shop/product/"));
  
  // Routes reserved specifically for unauthenticated users (login and registration forms)
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  // If the target is an API endpoint or internal auth controller, allow Next.js to route normally
  if (isApiRoute || isApiAuthRoute) return;

  // If visiting an auth-only page (e.g. login or register)
  if (isAuthRoute) {
    // Redirect authenticated users trying to access login/register back to the homepage
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl));
    }
    return; // Allow guest access to sign-in forms
  }

  // If user is guest (not logged in) and attempting to request private routes (e.g. checkout or profile)
  if (!isLoggedIn && !isPublicRoute) {
    // Redirect user to login page, appending original route as a callback redirect query param
    return Response.redirect(new URL("/login", nextUrl));
  }

  return; // Allow standard routing to proceed
});

// Configure matcher settings specifying which paths will trigger this middleware execution
export const config = {
  // Run middleware on all sub-paths except for webhooks, static files, next image optimizers, and favicon
  matcher: ["/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)"],
};

