import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { sendEmail } from '@/lib/email'

const FALLBACK_TO = 'pitonenterprise3240@gmail.com'

export async function POST(req: Request) {
  let body: { name?: string; email?: string; phone?: string; subject?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const message = (body.message || '').trim()
  const phone = (body.phone || '').trim()
  const subject = (body.subject || '').trim()

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })
  }

  const payload = await getPayloadClient()

  // Save first, durable even if email fails.
  await payload.create({
    collection: 'messages',
    overrideAccess: true,
    data: { name, email, phone: phone || undefined, subject: subject || undefined, message, status: 'new' },
  })

  // Notify the store (best-effort).
  const settings: any = await payload.findGlobal({ slug: 'settings', overrideAccess: true }).catch(() => ({}))
  const to = settings?.supportEmail || FALLBACK_TO
  await sendEmail({
    to,
    subject: `New enquiry${subject ? `: ${subject}` : ''}, from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;color:#2a2320">
        <h2 style="color:#6e1f3b">New contact message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
        ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;background:#f7f1e8;padding:12px;border-radius:6px">${message}</p>
      </div>`,
  }).catch(() => {})

  return NextResponse.json({ ok: true })
}
