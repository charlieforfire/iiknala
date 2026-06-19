import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import { inviteCodesForPackage, createInviteCodes } from '@/lib/invite-codes'
import { getResend, FROM } from '@/lib/resend'
import { bookingConfirmedHtml, bookingConfirmedSubject } from '@/lib/emails/booking-confirmed'
import { packageConfirmedHtml, packageConfirmedSubject } from '@/lib/emails/package-confirmed'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!sessionId) return NextResponse.redirect(`${appUrl}/clases`)

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.payment_status !== 'paid') return NextResponse.redirect(`${appUrl}/clases`)

    const { type, classId, formationId, userId, paqueteId, nombre } = session.metadata ?? {}

    if (type === 'class' && classId && userId) {
      const { data: existing } = await supabase
        .from('bookings').select('id').eq('user_id', userId).eq('class_id', classId).maybeSingle()

      if (!existing) {
        const { data: newBooking, error: bookingErr } = await supabase.from('bookings').insert({
          user_id: userId, class_id: classId, status: 'confirmed',
          stripe_payment_intent: session.payment_intent as string,
        }).select('id').single()

        if (bookingErr) {
          console.error('[stripe/success] booking insert error:', bookingErr)
        } else {
          const { data: cls } = await supabase.from('yoga_classes').select('enrolled, title, date, time, instructor').eq('id', classId).single()
          if (cls) await supabase.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)

          if (newBooking && cls && session.customer_email) {
            try {
              const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
              const authUser = users.find(u => u.id === userId)
              const userName = authUser?.user_metadata?.full_name ?? session.customer_email?.split('@')[0] ?? 'Alumna'
              await getResend().emails.send({
                from: FROM,
                to: session.customer_email,
                subject: bookingConfirmedSubject(cls.title),
                html: bookingConfirmedHtml({
                  userName,
                  classTitle: cls.title,
                  classDate: cls.date,
                  classTime: cls.time,
                  instructor: cls.instructor ?? '',
                  paymentMethod: session.payment_intent as string,
                  bookingId: newBooking.id,
                }),
              })
            } catch (emailErr) {
              console.error('[stripe/success] booking email error:', emailErr)
            }
          }
        }
      }
    }

    if (type === 'paquete' && userId && paqueteId) {
      const { data: existing } = await supabase
        .from('user_packages').select('id').eq('stripe_session_id', session.id).maybeSingle()

      if (!existing) {
        const { data: pkgConfig, error: pkgErr } = await supabase
          .from('packages')
          .select('nombre, clases, vigencia_dias, is_shareable')
          .eq('id', paqueteId)
          .maybeSingle()

        if (pkgErr) console.error('[stripe/success] package lookup error:', pkgErr)

        const packageName = pkgConfig?.nombre ?? nombre ?? paqueteId
        const classes = pkgConfig?.clases ?? null
        const days = pkgConfig?.vigencia_dias ?? null
        const shareable = pkgConfig?.is_shareable ?? false

        const expiresAt = days
          ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null

        const { data: newPkg, error: insertErr } = await supabase.from('user_packages').insert({
          user_id: userId,
          package_id: paqueteId,
          package_name: packageName,
          classes_total: classes,
          classes_used: 0,
          expires_at: expiresAt,
          status: 'active',
          stripe_session_id: session.id,
          is_shareable: shareable,
        }).select('id').single()

        if (insertErr) {
          console.error('[stripe/success] user_packages insert error:', insertErr)
        } else if (newPkg) {
          try {
            const codesCount = inviteCodesForPackage(paqueteId)
            await createInviteCodes(supabase, newPkg.id, userId, codesCount, expiresAt)
          } catch (codeErr) {
            console.error('[stripe/success] invite codes error:', codeErr)
          }

          if (session.customer_email) {
            try {
              const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)
              const pkgUserName = authUser?.user_metadata?.full_name ?? session.customer_email.split('@')[0]
              await getResend().emails.send({
                from: FROM,
                to: session.customer_email,
                subject: packageConfirmedSubject(packageName),
                html: packageConfirmedHtml({
                  userName: pkgUserName,
                  packageName,
                  classesTotal: classes,
                  expiresAt,
                  paymentMethod: session.id,
                  packageId: newPkg.id,
                }),
              })
            } catch (emailErr) {
              console.error('[stripe/success] package email error:', emailErr)
            }
          }
        }
      }
    }

    if (type === 'formation' && userId) {
      const { data: existing } = await supabase
        .from('purchases').select('id').eq('stripe_session_id', session.id).maybeSingle()
      if (!existing) {
        const { error: formErr } = await supabase.from('purchases').insert({
          user_id: userId, formation_id: formationId ?? 'formacion-200h',
          stripe_session_id: session.id, status: 'completed',
        })
        if (formErr) console.error('[stripe/success] formation insert error:', formErr)
      }
    }
  } catch (err) {
    console.error('[stripe/success] unhandled error:', err)
  }

  return NextResponse.redirect(`${appUrl}/pago-exitoso`)
}
