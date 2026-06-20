import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { verifyOtp, OTP_MAX_ATTEMPTS } from '@/lib/otp'

export async function POST(req: Request) {
  let body: { email?: string; code?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  const code = (body.code || '').trim()
  if (!email || !code) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 })
  }

  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'customers',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  const customer = res.docs[0] as any
  if (!customer) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }
  if (customer.isVerified) {
    return NextResponse.json({ ok: true, alreadyVerified: true })
  }

  // Expiry + attempt checks.
  if (!customer.otpExpiresAt || new Date(customer.otpExpiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
  }
  if ((customer.otpAttempts ?? 0) >= OTP_MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many attempts. Please request a new code.' }, { status: 429 })
  }

  if (!verifyOtp(code, email, customer.otpHash)) {
    await payload.update({
      collection: 'customers',
      id: customer.id,
      overrideAccess: true,
      data: { otpAttempts: (customer.otpAttempts ?? 0) + 1 },
    })
    return NextResponse.json({ error: 'Incorrect code. Please try again.' }, { status: 400 })
  }

  // Success — mark verified, clear OTP state.
  await payload.update({
    collection: 'customers',
    id: customer.id,
    overrideAccess: true,
    data: { isVerified: true, otpHash: null, otpExpiresAt: null, otpAttempts: 0 },
  })

  return NextResponse.json({ ok: true })
}
