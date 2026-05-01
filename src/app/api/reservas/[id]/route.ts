import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await params

  const { data: booking } = await supabase
    .from('bookings')
    .select('class_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  // Verificar si la clase es en más de 24 horas
  const { data: cls } = await supabase
    .from('yoga_classes')
    .select('date, time, enrolled')
    .eq('id', booking.class_id)
    .single()

  // Cancelar la reserva
  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)

  // Reducir ocupación de la clase
  if (cls && cls.enrolled > 0) {
    await admin.from('yoga_classes').update({ enrolled: cls.enrolled - 1 }).eq('id', booking.class_id)
  }

  // Siempre devolver crédito al paquete
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
