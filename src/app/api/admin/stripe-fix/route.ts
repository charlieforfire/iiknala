import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { stripe } from '@/lib/stripe'
import { inviteCodesForPackage, createInviteCodes } from '@/lib/invite-codes'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/stripe-fix?session_id=cs_live_... — diagnose + auto-fix missing booking or package
export async function GET(req: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Falta session_id' }, { status: 400 })

  const session = await stripe.checkout.sessions.retrieve(sessionId)
  const { type, classId, userId, paqueteId, nombre } = session.metadata ?? {}
  const formationId = session.metadata?.formationId

  const result: Record<string, unknown> = {
    payment_status: session.payment_status,
    customer_email: session.customer_email,
    metadata: session.metadata,
  }

  if (session.payment_status !== 'paid') {
    result.error = 'El pago no está marcado como completado en Stripe'
    return NextResponse.json(result)
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

    if (!existing) {
      const { data: pkgConfig } = await adminDb
        .from('packages')
        .select('nombre, clases, vigencia_dias, is_shareable')
        .eq('id', paqueteId)
        .maybeSingle()

      const packageName = pkgConfig?.nombre ?? nombre ?? paqueteId
      const classes = pkgConfig?.clases ?? null
      const days = pkgConfig?.vigencia_dias ?? null
      const shareable = pkgConfig?.is_shareable ?? false
      const expiresAt = days
        ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : null

      const { data: newPkg, error } = await adminDb.from('user_packages').insert({
        user_id: userId,
        package_id: paqueteId,
        package_name: packageName,
        classes_total: classes,
        classes_used: 0,
        expires_at: expiresAt,
        status: 'active',
        stripe_session_id: sessionId,
        is_shareable: shareable,
      }).select('id').single()

      if (error) {
        result.insert_error = error.message
      } else {
        try {
          const codesCount = inviteCodesForPackage(paqueteId)
          await createInviteCodes(adminDb, newPkg!.id, userId, codesCount, expiresAt)
        } catch {}
        result.package_created = newPkg?.id
        result.fixed = true
      }
    }
  }

  if (type === 'formation' && userId) {
    const { data: existing } = await adminDb
      .from('purchases').select('id, status').eq('stripe_session_id', sessionId).maybeSingle()
    result.purchase_exists = !!existing
    result.purchase = existing

    if (!existing) {
      const { error } = await adminDb.from('purchases').insert({
        user_id: userId, formation_id: formationId ?? 'formacion-200h',
        stripe_session_id: sessionId, status: 'completed',
      })
      if (error) result.insert_error = error.message
      else result.fixed = true
    }
  }

  return NextResponse.json(result, { status: 200 })
}
