import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { getResend, FROM } from '@/lib/resend'
import { accountConfirmationHtml, accountConfirmationText } from '@/lib/emails/account-confirmation'

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

  // Only handle signup confirmation
  if (email_data?.email_action_type !== 'signup') {
    return NextResponse.json({ ok: true })
  }

  const userName = user?.user_metadata?.full_name ?? user.email.split('@')[0]
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
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
    // Never block registration due to email failure
  }

  return NextResponse.json({ ok: true })
}
