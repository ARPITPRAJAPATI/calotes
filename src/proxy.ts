// Import the NextAuth library to initialize authentication rules and helper functions
import NextAuth from "next-auth";

// Import authConfig configuration options to supply settings to NextAuth middleware
import { authConfig } from "./auth.config";

// Import NextResponse to customize and send HTTP response actions
import { NextResponse } from "next/server";

// Import our rate limiter utility
import { checkRateLimit, getRateLimitConfig } from "@/lib/rateLimit";

// Import safe redirect validator
import { isSafeRedirectUrl } from "@/lib/sanitize";

// Destructure the main edge-compatible auth wrapper function from NextAuth
const { auth } = NextAuth(authConfig);

// Export the NextAuth middleware wrapper, wrapping our custom request processing function
export default auth(async (req) => {
  const { nextUrl } = req; // Destructure the requested URL details
  const isLoggedIn = !!req.auth; // Boolean flag checking if session token is validated

  const isAdmin = (req.auth?.user as any)?.role === 'admin';

  // ── 1. Rate Limiting for API Endpoints ─────────────────────────────────────
  // Exclude internal NextAuth auth flow endpoints & Admin users completely from rate limiting
  if (!isAdmin && nextUrl.pathname.startsWith('/api') && !nextUrl.pathname.startsWith('/api/auth') && !nextUrl.pathname.startsWith('/api/admin')) {
    // Extract IP address from request metadata, proxy headers, or fallback to loopback
    // Note: On Vercel, x-forwarded-for is injected by the edge network and is reliable
    const rawIp = (req as any).ip ?? req.headers.get("x-forwarded-for") ?? '127.0.0.1';
    // Take only the first IP if multiple are in the chain (leftmost = client IP)
    const ip = rawIp.split(",")[0].trim();

    // Get the tightest applicable rate limit config for this route
    const { limit, windowMs } = getRateLimitConfig(nextUrl.pathname);

    // Build a namespaced key so different endpoints don't share quotas
    const rateLimitKey = `${nextUrl.pathname}:${ip}`;
    const { allowed, remaining, resetAt } = await checkRateLimit(rateLimitKey, limit, windowMs);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(resetAt),
          },
        }
      );
    }
  }


  // ── 2. callbackUrl Open-Redirect Protection ─────────────────────────────────
  // Validate any callbackUrl in query params to ensure it is same-origin.
  // This prevents attackers from crafting `/login?callbackUrl=https://evil.com`
  // links that redirect victims to phishing sites after they authenticate.
  const callbackUrl = nextUrl.searchParams.get('callbackUrl');
  if (callbackUrl && !isSafeRedirectUrl(callbackUrl)) {
    // Strip the dangerous callbackUrl and redirect to safe default
    const safeUrl = new URL('/login', nextUrl);
    return Response.redirect(safeUrl);
  }

  // ── 3. NextAuth Routing & Access Control Rules ──────────────────────────────
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

  // Array matching of public pages that guests are permitted to view without active login session
  const isPublicRoute = ["/", "/shop", "/about", "/lookbook"].some(
    (path) => nextUrl.pathname === path || nextUrl.pathname.startsWith("/shop/product/")
  );

  // Routes reserved specifically for unauthenticated users (login and registration forms)
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  // Webhooks must bypass auth entirely (they use their own signature verification)
  if (nextUrl.pathname.startsWith('/api/webhooks')) return;

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
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  return; // Allow standard routing to proceed
});

// Configure matcher settings specifying which paths will trigger this middleware execution
export const config = {
  // Run middleware on all sub-paths except for webhooks (own auth), static files, image optimizer, favicon
  matcher: ["/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)" ],
};


