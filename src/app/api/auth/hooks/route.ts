import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { getResend, FROM } from '@/lib/resend'
import { accountConfirmationHtml, accountConfirmationText } from '@/lib/emails/account-confirmation'

function passwordResetHtml({ userName, resetUrl }: { userName: string; resetUrl: string }) {
  const firstName = userName.split(' ')[0]
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><title>Restablecer contraseña — iiknala Yoga</title></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
        <tr><td align="center" style="padding-bottom:32px;">
          <img src="https://www.iiknalayoga.com/logo.png" alt="iiknala Yoga" width="140" style="display:block;height:auto;"/>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:20px;padding:40px 36px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#4a6741;">Recuperar acceso</p>
          <h1 style="margin:0 0 24px;font-size:26px;font-weight:300;color:#1c1917;">Hola, ${firstName} 🌿</h1>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#57534e;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong style="color:#1c1917;">iiknala</strong>. Haz clic en el botón de abajo para crear una nueva.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
            <tr><td style="background:#4a6741;border-radius:12px;">
              <a href="${resetUrl}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">
                Restablecer contraseña
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.6;">
            Si no solicitaste este cambio, puedes ignorar este mensaje.<br/>El enlace expira en 1 hora.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:28px 0 8px;">
          <p style="margin:0 0 4px;font-size:15px;color:#78716c;">Hari Om 🙏</p>
          <p style="margin:0;font-size:12px;color:#a8a29e;">iiknala Yoga · Mérida, Yucatán</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// Supabase Auth Hook — Send Email
// Configure in: Supabase Dashboard → Authentication → Hooks → Send Email
// Hook URL: https://www.iiknalayoga.com/api/auth/hooks

function verifySignature(secret: string, body: string, signature: string, timestamp: string): boolean {
  try {
    const base64Secret = secret.replace(/^v1,whsec_/, '')
    const keyBuffer = Buffer.from(base64Secret, 'base64')
    const signedContent = `${timestamp}.${body}`
    const hmac = createHmac('sha256', keyBuffer)
    hmac.update(signedContent)
    const computed = `v1,${hmac.digest('base64')}`
    return computed === signature
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const hookSecret = process.env.SUPABASE_HOOK_SECRET

  const rawBody = await req.text()

  const body = JSON.parse(rawBody) as {
    user: { email: string; user_metadata?: { full_name?: string } }
    email_data: {
      email_action_type: string
      token_hash: string
      redirect_to: string
      site_url: string
    }
  }

  const { user, email_data } = body

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const userName = user?.user_metadata?.full_name ?? user.email.split('@')[0]
  const actionType = email_data?.email_action_type

  if (actionType === 'signup') {
    const confirmUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=signup&redirect_to=${encodeURIComponent(email_data.redirect_to)}`
    try {
      const resend = getResend()
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: 'Confirma tu cuenta en iiknala Yoga',
        html: accountConfirmationHtml({ userName, confirmUrl }),
        text: accountConfirmationText({ userName, confirmUrl }),
      })
    } catch (err) {
      console.error('[auth-hook] Error sending confirmation email:', err)
    }
  } else if (actionType === 'recovery') {
    const resetUrl = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=recovery&redirect_to=${encodeURIComponent(email_data.redirect_to)}`
    try {
      const resend = getResend()
      await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: 'Restablece tu contraseña — iiknala Yoga',
        html: passwordResetHtml({ userName, resetUrl }),
        text: `Hola ${userName.split(' ')[0]},\n\nRestablece tu contraseña aquí: ${resetUrl}\n\nHari Om 🙏\niiknala Yoga`,
      })
    } catch (err) {
      console.error('[auth-hook] Error sending recovery email:', err)
    }
  }

  return NextResponse.json({ ok: true })
}
