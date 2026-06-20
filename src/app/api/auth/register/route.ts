import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { generateOtp, hashOtp, OTP_TTL_MS } from '@/lib/otp'
import { sendEmail, otpEmailHtml } from '@/lib/email'

export async function POST(req: Request) {
  let body: { firstName?: string; lastName?: string; email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const { password, firstName, lastName } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const existing = await payload.find({
    collection: 'customers',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  const found = existing.docs[0] as any
  if (found?.isVerified) {
    return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 })
  }

  const code = generateOtp()
  const otpHash = hashOtp(code, email)
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString()

  try {
    if (found) {
      // Unverified account exists, update credentials + new OTP.
      await payload.update({
        collection: 'customers',
        id: found.id,
        overrideAccess: true,
        data: { password, firstName, lastName, otpHash, otpExpiresAt, otpAttempts: 0 },
      })
    } else {
      await payload.create({
        collection: 'customers',
        overrideAccess: true,
        data: { email, password, firstName, lastName, isVerified: false, otpHash, otpExpiresAt, otpAttempts: 0 },
      })
    }
  } catch (err: any) {
    const msg = err?.data?.errors?.[0]?.message || err?.message || 'Could not create account'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const sent = await sendEmail({
    to: email,
    subject: 'Your Piton Enterprise verification code',
    html: otpEmailHtml(code, firstName),
  })

  return NextResponse.json({ ok: true, email, emailConsoleOnly: sent.consoleOnly === true })
}
