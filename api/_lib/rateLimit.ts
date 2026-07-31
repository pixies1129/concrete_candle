import type { IncomingMessage } from 'node:http'
import { HttpError } from './httpJson.js'

// Blocks direct/cross-site calls (curl, other sites' scripts) that don't
// carry a browser Origin matching the host actually serving this request.
// Not foolproof (a spoofed Origin bypasses it), but stops casual/automated
// abuse of the Gemini-backed endpoints for free.
export function assertSameOrigin(req: IncomingMessage): void {
  const origin = req.headers.origin
  const host = req.headers.host
  if (!origin || !host) {
    throw new HttpError(403, '허용되지 않은 요청입니다.')
  }
  let originHost: string
  try {
    originHost = new URL(origin).host
  } catch {
    throw new HttpError(403, '허용되지 않은 요청입니다.')
  }
  if (originHost !== host) {
    throw new HttpError(403, '허용되지 않은 요청입니다.')
  }
}

function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0]?.trim()
  return first || req.socket.remoteAddress || 'unknown'
}

interface Bucket {
  count: number
  resetAt: number
}

// Best-effort only: state lives in the function instance's memory, so it
// resets on cold start and isn't shared across concurrent instances. Still
// meaningfully raises the bar against bursty/sustained abuse at zero
// infra cost, without adding a database for an MVP this size.
const buckets = new Map<string, Bucket>()

function hit(key: string, max: number, windowMs: number): void {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }
  if (existing.count >= max) {
    throw new HttpError(429, '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.')
  }
  existing.count += 1
}

const MINUTE_MS = 60_000
const DAY_MS = 24 * 60 * 60_000

interface RateLimitOptions {
  perMinutePerIp: number
  perDayGlobal: number
}

export function enforceRateLimit(req: IncomingMessage, routeName: string, opts: RateLimitOptions): void {
  assertSameOrigin(req)
  hit(`${routeName}:ip:${clientIp(req)}`, opts.perMinutePerIp, MINUTE_MS)
  hit(`${routeName}:global-day`, opts.perDayGlobal, DAY_MS)
}
