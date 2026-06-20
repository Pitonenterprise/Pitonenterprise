// Email sending via Resend's HTTP API. If RESEND_API_KEY is absent, emails are
// logged to the server console so flows are testable without a provider. See Doc/ENV.md.

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export const isEmailEnabled = () => !!process.env.RESEND_API_KEY

const FROM = process.env.EMAIL_FROM || 'Piton Enterprise <onboarding@resend.dev>'

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}): Promise<{ ok: boolean; consoleOnly?: boolean; error?: string }> {
  if (!isEmailEnabled()) {
    // Dev fallback — surface the content so OTPs can be read from the dev log.
    console.log(`\n📧 [email:console] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}\n`)
    return { ok: true, consoleOnly: true }
  }
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    })
    if (!res.ok) {
      const body = await res.text()
      return { ok: false, error: `Resend ${res.status}: ${body}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: (err as Error).message }
  }
}

export function otpEmailHtml(code: string, name?: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f7f1e8;color:#2a2320">
    <div style="text-align:center;margin-bottom:24px">
      <div style="font-family:Georgia,serif;font-size:26px;color:#6e1f3b">Piton</div>
      <div style="font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#b68a3e">Enterprise</div>
    </div>
    <p style="font-size:15px">Hi${name ? ` ${name}` : ''},</p>
    <p style="font-size:15px">Your verification code is:</p>
    <div style="font-size:34px;letter-spacing:10px;font-weight:bold;text-align:center;color:#6e1f3b;background:#fff;padding:18px;border-radius:8px;margin:18px 0">${code}</div>
    <p style="font-size:13px;color:#8a7d70">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
  </div>`
}
