# Branded email templates

Drop-in HTML for Supabase Auth's transactional emails so they match
the Pitonenterprise brand instead of the default Supabase look.

## How to apply

1. Open **Supabase Dashboard → Authentication → Email Templates**
2. For each template below, paste the matching HTML into the **Body**
   field and the matching subject into the **Subject** field. Save.

| Supabase template     | File                       | Suggested subject                                                  |
|-----------------------|----------------------------|--------------------------------------------------------------------|
| Confirm signup        | `confirm-signup.html`      | Welcome to Pitonenterprise — confirm your email                    |
| Reset password        | `reset-password.html`      | Reset your Pitonenterprise password                                |
| Magic link            | `magic-link.html`          | Your Pitonenterprise sign-in link                                  |

The `{{ .ConfirmationURL }}` token in each template is replaced by
Supabase at send time with the correct one-use link.

## Sender domain (`noreply@mail.app.supabase.io` → your own)

The default sender is fine for testing but looks unbranded. To send
from `noreply@pitonenterprise.com` (or similar) you need a transactional
email provider:

1. Sign up for **Resend** (3,000 free emails/mo), **SendGrid**, **Mailgun**,
   or **AWS SES**. Verify your sending domain (DNS records).
2. In Supabase → **Project Settings → Authentication → SMTP Settings**:
   - Enable custom SMTP
   - Paste the host / port / user / password from your provider
   - Set "Sender email" to e.g. `noreply@pitonenterprise.com`
   - Set "Sender name" to `Pitonenterprise`
3. Save. Next signup will arrive from your own domain.

The free Supabase tier limits email sends — switching to your own SMTP
also removes that bottleneck.
