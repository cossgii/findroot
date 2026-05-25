interface RequestRecord {
  count: number;
  resetAt: number;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const store = new Map<string, RequestRecord>();

export const RATE_LIMITS = {
  DEFAULT: { windowMs: 60_000, max: 60 },
  AUTH: { windowMs: 60_000, max: 10 },
  WRITE: { windowMs: 60_000, max: 30 },
} satisfies Record<string, RateLimitConfig>;

export function checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetAt < now) {
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (record.count >= config.max) {
    return false;
  }

  record.count++;
  return true;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
