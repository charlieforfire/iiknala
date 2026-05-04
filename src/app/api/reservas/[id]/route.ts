import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: booking } = await supabase
    .from('bookings')
    .select('class_id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  const { data: cls } = await supabase
    .from('yoga_classes')
    .select('date, time, enrolled')
    .eq('id', booking.class_id)
    .single()

  if (cls) {
    const classDateTime = new Date(`${cls.date}T${cls.time}`)
    const cutoff = new Date(classDateTime.getTime() - 2 * 60 * 60 * 1000)
    if (cutoff.getTime() < Date.now()) {
      return NextResponse.json({ error: 'No se puede cancelar con menos de 2 horas de anticipación' }, { status: 400 })
    }
  }

  // Cancelar la reserva
  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)

  // Reducir ocupación
  if (cls && cls.enrolled > 0) {
    await admin.from('yoga_classes').update({ enrolled: cls.enrolled - 1 }).eq('id', booking.class_id)
  }

  // Solo devolver crédito si era una reserva con paquete (confirmed), no si era pending_cash
  if (booking.status === 'pending_cash') {
    return NextResponse.json({ ok: true, creditRefunded: false })
  }

  const today = new Date().toISOString().split('T')[0]
  const { data: activePkg } = await admin
    .from('user_packages')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active', 'exhausted'])
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (activePkg && activePkg.classes_total !== null && activePkg.classes_used > 0) {
    await admin.from('user_packages').update({
      classes_used: activePkg.classes_used - 1,
      status: 'active',
    }).eq('id', activePkg.id)
  }

  return NextResponse.json({ ok: true, creditRefunded: true })
}
