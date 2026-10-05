/**
 * API Rate Limiting & Abuse Prevention (Requirement 71)
 *
 * Implements a sliding window rate limiter to protect public and authenticated endpoints
 * against brute-force logins, scraping, search flood, and upload abuse.
 * Limits are balanced to ensure smooth mobile experiences.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export type RateLimitCategory = "AUTH" | "SEARCH" | "UPLOAD" | "PUBLIC_API" | "ADMIN_ACTION";

const CATEGORY_LIMITS: Record<RateLimitCategory, RateLimitConfig> = {
  AUTH: { maxRequests: 12, windowSeconds: 60 },         // 12 login attempts / min
  SEARCH: { maxRequests: 60, windowSeconds: 60 },       // 60 queries / min (smooth typing)
  UPLOAD: { maxRequests: 20, windowSeconds: 60 },       // 20 document uploads / min
  PUBLIC_API: { maxRequests: 120, windowSeconds: 60 },  // 120 general requests / min
  ADMIN_ACTION: { maxRequests: 80, windowSeconds: 60 }, // 80 admin actions / min
};

interface ClientHistory {
  timestamps: number[];
}

const rateLimitStore = new Map<string, ClientHistory>();

// Periodic garbage collection every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((history, key) => {
    history.timestamps = history.timestamps.filter((ts: number) => now - ts < 300_000);
    if (history.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  });
}, 300_000);

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  clientIdentifier: string;
}

/**
 * Checks and increments rate limit for a client identifier and category.
 */
export function checkRateLimit(
  identifier: string,
  category: RateLimitCategory = "PUBLIC_API"
): RateLimitResult {
  const config = CATEGORY_LIMITS[category] || CATEGORY_LIMITS.PUBLIC_API;
  const key = `${category}:${identifier}`;
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  const history = rateLimitStore.get(key) || { timestamps: [] };

  // Remove timestamps outside the sliding window
  const activeTimestamps = history.timestamps.filter((ts) => now - ts < windowMs);

  if (activeTimestamps.length >= config.maxRequests) {
    const oldestTimestamp = activeTimestamps[0];
    const resetInSeconds = Math.ceil((oldestTimestamp + windowMs - now) / 1000);

    return {
      allowed: false,
      limit: config.maxRequests,
      remaining: 0,
      resetInSeconds: Math.max(1, resetInSeconds),
      clientIdentifier: identifier,
    };
  }

  // Record this request
  activeTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: activeTimestamps });

  return {
    allowed: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - activeTimestamps.length,
    resetInSeconds: config.windowSeconds,
    clientIdentifier: identifier,
  };
}

/**
 * Extracts client IP or proxy header from Next.js / Vercel request
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
