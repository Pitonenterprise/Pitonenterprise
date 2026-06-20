import crypto from 'crypto'

export const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
export const OTP_MAX_ATTEMPTS = 5

// 6-digit numeric code (avoids leading-zero loss by zero-padding).
export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

// Store only the hash. Bound to the email so a code can't be replayed cross-account.
export function hashOtp(code: string, email: string): string {
  const secret = process.env.PAYLOAD_SECRET || 'dev-secret'
  return crypto.createHmac('sha256', secret).update(`${email}:${code}`).digest('hex')
}

export function verifyOtp(code: string, email: string, storedHash?: string | null): boolean {
  if (!storedHash) return false
  const candidate = hashOtp(code, email)
  // Constant-time comparison.
  const a = Buffer.from(candidate)
  const b = Buffer.from(storedHash)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
