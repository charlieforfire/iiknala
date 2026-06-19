import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { stripe } from '@/lib/stripe'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/stripe-fix?session_id=cs_live_... — diagnose + auto-fix missing booking
export async function GET(req: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Falta session_id' }, { status: 400 })

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const { type, classId, userId, paqueteId, formationId } = session.metadata ?? {}

  const result: Record<string, unknown> = {
    payment_status: session.payment_status,
    customer_email: session.customer_email,
    metadata: session.metadata,
  }

  if (type === 'class' && classId && userId) {
    const { data: existing } = await adminDb
      .from('bookings').select('id, status').eq('user_id', userId).eq('class_id', classId).maybeSingle()

    result.booking_exists = !!existing
    result.booking = existing

    if (!existing) {
      const { data: newBooking, error } = await adminDb.from('bookings').insert({
        user_id: userId,
        class_id: classId,
        status: 'confirmed',
        stripe_payment_intent: session.payment_intent as string,
      }).select('id').single()

      if (error) {
        result.insert_error = error.message
      } else {
        const { data: cls } = await adminDb.from('yoga_classes').select('enrolled').eq('id', classId).single()
        if (cls) await adminDb.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)
        result.booking_created = newBooking?.id
        result.fixed = true
      }
    }
  }

  if (type === 'paquete' && userId && paqueteId) {
    const { data: existing } = await adminDb
      .from('user_packages').select('id, status').eq('stripe_session_id', sessionId).maybeSingle()
    result.package_exists = !!existing
    result.package = existing
  }

  if (type === 'formation' && userId) {
    const { data: existing } = await adminDb
      .from('purchases').select('id, status').eq('stripe_session_id', sessionId).maybeSingle()
    result.purchase_exists = !!existing
    result.purchase = existing
  }

  return NextResponse.json(result, { status: 200 })
}
