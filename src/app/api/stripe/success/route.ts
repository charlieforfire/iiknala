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
        .from('bookings').select('id').eq('user_id', userId).eq('class_id', classId).single()

      if (!existing) {
        const { data: newBooking } = await supabase.from('bookings').insert({
          user_id: userId, class_id: classId, status: 'confirmed',
          stripe_payment_intent: session.payment_intent as string,
        }).select('id').single()

        const { data: cls } = await supabase.from('yoga_classes').select('enrolled, title, date, time, instructor').eq('id', classId).single()
        if (cls) await supabase.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)

        // Send booking confirmation email
        if (newBooking && cls && session.customer_email) {
          try {
            const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
            const authUser = users.find(u => u.id === userId)
            const userName = authUser?.user_metadata?.full_name ?? session.customer_email?.split('@')[0] ?? 'Alumna'
            const resend = getResend()
            await resend.emails.send({
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
            console.error('Error sending booking email:', emailErr)
          }
        }
      }
    }

    if (type === 'paquete' && userId && paqueteId) {
      const { data: existing } = await supabase
        .from('user_packages').select('id').eq('stripe_session_id', session.id).single()

      if (!existing) {
        const { data: pkgConfig } = await supabase
          .from('packages')
          .select('clases, vigencia_dias, is_shareable')
          .eq('id', paqueteId)
          .single()

        const classes = pkgConfig?.clases ?? 1
        const days = pkgConfig?.vigencia_dias ?? null
        const shareable = pkgConfig?.is_shareable ?? false

        const expiresAt = days
          ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null

        const { data: newPkg } = await supabase.from('user_packages').insert({
          user_id: userId,
          package_id: paqueteId,
          package_name: nombre ?? paqueteId,
          classes_total: classes,
          classes_used: 0,
          expires_at: expiresAt,
          status: 'active',
          stripe_session_id: session.id,
          is_shareable: shareable,
        }).select('id').single()

        if (newPkg) {
          const codesCount = inviteCodesForPackage(paqueteId)
          await createInviteCodes(supabase, newPkg.id, userId, codesCount, expiresAt)
        }

        // Send package confirmation email
        if (newPkg && session.customer_email) {
          try {
            const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId)
            const pkgUserName = authUser?.user_metadata?.full_name ?? session.customer_email.split('@')[0]
            const resend = getResend()
            await resend.emails.send({
              from: FROM,
              to: session.customer_email,
              subject: packageConfirmedSubject(nombre ?? 'Paquete iiknala'),
              html: packageConfirmedHtml({
                userName: pkgUserName,
                packageName: nombre ?? 'Paquete iiknala',
                classesTotal: classes,
                expiresAt,
                paymentMethod: session.id,
                packageId: newPkg.id,
              }),
            })
          } catch (emailErr) {
            console.error('Error sending package email:', emailErr)
          }
        }
      }
    }

    if (type === 'formation' && userId) {
      const { data: existing } = await supabase
        .from('purchases').select('id').eq('stripe_session_id', session.id).single()
      if (!existing) {
        await supabase.from('purchases').insert({
          user_id: userId, formation_id: formationId ?? 'formacion-200h',
          stripe_session_id: session.id, status: 'completed',
        })
      }
    }
  } catch (err) {
    console.error('Error procesando pago:', err)
  }

  // Redirect to a client page so the browser re-establishes the auth session
  // before landing on dashboard (avoids logout caused by cookie propagation in API redirects)
  return NextResponse.redirect(`${appUrl}/pago-exitoso`)
}
