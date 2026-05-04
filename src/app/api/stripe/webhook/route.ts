import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { getResend, FROM } from '@/lib/resend'
import { bookingConfirmedHtml, bookingConfirmedSubject } from '@/lib/emails/booking-confirmed'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { type, classId, formationId, userId } = session.metadata ?? {}

    if (type === 'class' && classId && userId) {
      const { data: existing } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', userId)
        .eq('class_id', classId)
        .single()

      if (!existing) {
        const { data: newBooking } = await supabase.from('bookings').insert({
          user_id: userId,
          class_id: classId,
          status: 'confirmed',
          stripe_payment_intent: session.payment_intent as string,
        }).select('id').single()

        const { data: cls } = await supabase
          .from('yoga_classes')
          .select('enrolled, title, date, time, instructor')
          .eq('id', classId)
          .single()

        if (cls) {
          await supabase
            .from('yoga_classes')
            .update({ enrolled: cls.enrolled + 1 })
            .eq('id', classId)
        }

        if (session.customer_email) {
          await createZoomMeetingIfOnline(classId, session.customer_email)
        }

        // Send confirmation email
        if (cls && session.customer_email && newBooking) {
          try {
            await getResend().emails.send({
              from: FROM,
              to: session.customer_email,
              subject: bookingConfirmedSubject(cls.title),
              html: bookingConfirmedHtml({
                userName: session.customer_details?.name ?? session.customer_email,
                classTitle: cls.title,
                classDate: cls.date,
                classTime: cls.time,
                instructor: cls.instructor,
                paymentMethod: session.payment_intent as string,
                bookingId: newBooking.id,
              }),
            })
          } catch (err) {
            console.error('Email error:', err)
          }
        }
      }
    }

    if (type === 'formation' && userId) {
      await supabase.from('purchases').insert({
        user_id: userId,
        formation_id: formationId ?? 'formacion-200h',
        stripe_session_id: session.id,
        status: 'completed',
      })
    }
  }

  return NextResponse.json({ ok: true })
}

async function createZoomMeetingIfOnline(classId: string, _email: string) {
  const { data: cls } = await supabase
    .from('yoga_classes')
    .select('is_online, zoom_link, title, date, time')
    .eq('id', classId)
    .single()

  if (!cls?.is_online || cls.zoom_link) return

  try {
    const tokenRes = await fetch('https://zoom.us/oauth/token?grant_type=account_credentials&account_id=' + process.env.ZOOM_ACCOUNT_ID, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64'),
      },
    })
    const { access_token } = await tokenRes.json()

    const [hours, minutes] = cls.time.split(':')
    const startTime = new Date(`${cls.date}T${hours}:${minutes}:00`)

    const meetingRes = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: cls.title,
        type: 2,
        start_time: startTime.toISOString(),
        duration: 75,
        settings: { join_before_host: true, waiting_room: false },
      }),
    })
    const meeting = await meetingRes.json()

    if (meeting.join_url) {
      await supabase
        .from('yoga_classes')
        .update({ zoom_link: meeting.join_url })
        .eq('id', classId)
    }
  } catch (err) {
    console.error('Error creando Zoom meeting:', err)
  }
}
