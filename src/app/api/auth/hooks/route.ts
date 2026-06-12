import { NextRequest, NextResponse } from 'next/server'
import { getResend, FROM } from '@/lib/resend'
import { accountConfirmationHtml, accountConfirmationText } from '@/lib/emails/account-confirmation'

// Supabase Auth Hook — Send Email
// Configure in: Supabase Dashboard → Authentication → Hooks → Send Email
// Hook URL: https://www.iiknalayoga.com/api/auth/hooks

export async function POST(req: NextRequest) {
  // Validate the hook secret to ensure the request is from Supabase
  const hookSecret = process.env.SUPABASE_HOOK_SECRET
  if (hookSecret) {
    const signature = req.headers.get('x-supabase-signature') ?? ''
    if (signature !== hookSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await req.json()
  const { user, email_data } = body as {
    user: { email: string; user_metadata?: { full_name?: string } }
    email_data: {
      email_action_type: string
      token_hash: string
      redirect_to: string
      site_url: string
    }
  }

  // Only handle signup confirmation
  if (email_data?.email_action_type !== 'signup') {
    return NextResponse.json({ ok: true })
  }

  const userName = user?.user_metadata?.full_name ?? user.email.split('@')[0]
  const confirmUrl = `${email_data.site_url}/auth/v1/verify?token=${email_data.token_hash}&type=signup&redirect_to=${encodeURIComponent(email_data.redirect_to)}`

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
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
