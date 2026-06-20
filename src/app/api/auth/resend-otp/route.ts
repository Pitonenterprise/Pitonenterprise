import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { generateOtp, hashOtp, OTP_TTL_MS } from '@/lib/otp'
import { sendEmail, otpEmailHtml } from '@/lib/email'

export async function POST(req: Request) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'customers',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  const customer = res.docs[0] as any

  // Don't reveal whether an account exists; always respond ok.
  if (!customer || customer.isVerified) {
    return NextResponse.json({ ok: true })
  }

  const code = generateOtp()
  await payload.update({
    collection: 'customers',
    id: customer.id,
    overrideAccess: true,
    data: {
      otpHash: hashOtp(code, email),
      otpExpiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      otpAttempts: 0,
    },
  })

  const sent = await sendEmail({
    to: email,
    subject: 'Your Piton Enterprise verification code',
    html: otpEmailHtml(code, customer.firstName),
  })

  return NextResponse.json({ ok: true, emailConsoleOnly: sent.consoleOnly === true })
}
