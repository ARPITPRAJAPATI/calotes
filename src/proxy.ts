import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// A simple in-memory store for rate limiting (Note: clears on server restart/edge function cold start)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

function applyRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || (now - record.lastReset) > windowMs) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true; // allowed
  }

  if (record.count >= limit) {
    return false; // blocked
  }

  record.count += 1;
  return true; // allowed
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Rate Limiting for APIs (Excluding NextAuth routes)
  if (nextUrl.pathname.startsWith('/api') && !nextUrl.pathname.startsWith('/api/auth')) {
    const ip = (req as any).ip ?? req.headers.get("x-forwarded-for")?.split(",")[0] ?? '127.0.0.1';
    
    let limit = 120; // Default API limit (raised to 120 to ensure seamless high-speed browsing)
    if (nextUrl.pathname.startsWith('/api/register')) {
      limit = 15; // Stricter for register route
    }

    const allowed = applyRateLimit(ip, limit, 60 * 1000); // 1 minute window
    
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  }

  // 2. NextAuth Routing Rules
  const isApiRoute = nextUrl.pathname.startsWith("/api");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = ["/", "/shop", "/products"].some(path => nextUrl.pathname === path || nextUrl.pathname.startsWith("/shop/product/"));
  const isAuthRoute = ["/login", "/register"].includes(nextUrl.pathname);

  if (isApiRoute || isApiAuthRoute) return;

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  return;
});

export const config = {
  // Run on all routes except webhooks, static files, images, favicon
  matcher: ["/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)"],
};
