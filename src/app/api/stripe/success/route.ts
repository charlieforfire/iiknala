import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const packageConfig: Record<string, { classes: number | null; days: number | null }> = {
  'primera-clase':  { classes: 1,    days: null },
  'clase-suelta':   { classes: 1,    days: null },
  'pack-4':         { classes: 4,    days: 30 },
  'pack-8':         { classes: 8,    days: 30 },
  'pack-12':        { classes: 12,   days: 30 },
  'pack-16':        { classes: 16,   days: 30 },
  'ilimitado':      { classes: null, days: 30 },
  'rocket-suelta':  { classes: 1,    days: null },
  'rocket-pack':    { classes: 4,    days: 30 },
}

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
        await supabase.from('bookings').insert({
          user_id: userId, class_id: classId, status: 'confirmed',
          stripe_payment_intent: session.payment_intent as string,
        })
        const { data: cls } = await supabase.from('yoga_classes').select('enrolled').eq('id', classId).single()
        if (cls) await supabase.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)
      }
    }

    if (type === 'paquete' && userId && paqueteId) {
      const { data: existing } = await supabase
        .from('user_packages').select('id').eq('stripe_session_id', session.id).single()

      if (!existing) {
        const config = packageConfig[paqueteId] ?? { classes: 1, days: 30 }
        const expiresAt = config.days
          ? new Date(Date.now() + config.days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : null

        await supabase.from('user_packages').insert({
          user_id: userId,
          package_id: paqueteId,
          package_name: nombre ?? paqueteId,
          classes_total: config.classes,
          classes_used: 0,
          expires_at: expiresAt,
          status: 'active',
          stripe_session_id: session.id,
        })
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

  return NextResponse.redirect(`${appUrl}/dashboard?success=true`)
}
