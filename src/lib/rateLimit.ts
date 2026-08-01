import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory fallback store for local development when Upstash env vars are not set
const localStore = new Map<string, RateLimitRecord>();

// Check if Upstash Redis credentials are configured in environment variables
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Instantiate Redis singleton if credentials exist
const redis = isUpstashConfigured ? Redis.fromEnv() : null;

// Cache of Ratelimit instances keyed by "limit:windowMs" to reuse connections
const ratelimitCache = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const cacheKey = `${limit}:${windowMs}`;
  if (!ratelimitCache.has(cacheKey)) {
    const seconds = Math.max(1, Math.round(windowMs / 1000));
    ratelimitCache.set(
      cacheKey,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${seconds} s`),
        analytics: true,
        prefix: '@upstash/ratelimit',
      })
    );
  }
  return ratelimitCache.get(cacheKey)!;
}

/**
 * Checks whether the given key is within the rate limit window.
 * Uses Upstash Redis in production (persistent across cold starts)
 * and falls back to in-memory store in local development.
 *
 * @param key     Unique identifier (e.g. `login:${ip}` or `/api/promo/validate:${ip}`)
 * @param limit   Maximum number of requests allowed in the window
 * @param windowMs Duration of the window in milliseconds
 * @returns `{ allowed: boolean, remaining: number, resetAt: number }`
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  // If key belongs to admin or contains admin route, bypass rate limiting completely
  if (key.includes('admin') || process.env.DISABLE_RATE_LIMIT === 'true') {
    return { allowed: true, remaining: 9999, resetAt: Date.now() + windowMs };
  }

  // Production path: Upstash Redis persistent sliding window
  if (isUpstashConfigured) {
    try {
      const limiter = getUpstashLimiter(limit, windowMs);
      if (limiter) {
        const result = await limiter.limit(key);
        return {
          allowed: result.success,
          remaining: result.remaining,
          resetAt: result.reset,
        };
      }
    } catch (err) {
      console.error('[RATE_LIMIT] Upstash Redis error, falling back to local store:', err);
    }
  }

  // Development path / fallback: In-memory store
  const now = Date.now();
  const record = localStore.get(key);

  if (!record || now > record.resetAt) {
    localStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count, resetAt: record.resetAt };
}

/**
 * Per-route rate limit configurations (limit, windowMs).
 * Tighter limits on sensitive endpoints that can be abused.
 */
export const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  // Authentication — tight to stop credential stuffing
  '/api/auth':    { limit: 10,  windowMs: 60_000 },  // 10/min for ALL auth callbacks
  '/api/register':{ limit: 5,   windowMs: 60_000 },  // 5 registrations/min per IP

  // Payment & checkout — prevent carding attacks
  '/api/orders':  { limit: 20,  windowMs: 60_000 },  // 20 order creates/min per IP
  '/api/orders/verify': { limit: 20, windowMs: 60_000 },

  // Promo abuse prevention
  '/api/promo/validate': { limit: 10, windowMs: 60_000 },
  '/api/promo':   { limit: 20,  windowMs: 60_000 },

  // Email sending — prevent abuse via internal route
  '/api/send-email': { limit: 10, windowMs: 60_000 },

  // Search & Admin edits — increased limit for fast dashboard management
  '/api/products':{ limit: 300, windowMs: 60_000 },

  // Default for all other API routes — relaxed to avoid blocking legitimate fast actions
  default:        { limit: 200, windowMs: 60_000 },
};

/**
 * Gets the rate limit config for a given pathname.
 * Matches by prefix, longer matches win.
 */
export function getRateLimitConfig(pathname: string): { limit: number; windowMs: number } {
  let bestMatch = '';
  let bestConfig = RATE_LIMITS.default;

  for (const [prefix, config] of Object.entries(RATE_LIMITS)) {
    if (prefix === 'default') continue;
    if (pathname.startsWith(prefix) && prefix.length > bestMatch.length) {
      bestMatch = prefix;
      bestConfig = config;
    }
  }

  return bestConfig;
}

