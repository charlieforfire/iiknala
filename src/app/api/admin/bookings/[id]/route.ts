import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_EMAIL = 'iiknalayoga@gmail.com'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { status } = await req.json()

  if (!['confirmed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const { data: booking } = await adminDb
    .from('bookings')
    .select('status, class_id')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  await adminDb.from('bookings').update({ status }).eq('id', id)

  // Si se cancela una reserva pending_cash, liberar el lugar
  if (status === 'cancelled' && booking.status === 'pending_cash') {
    const { data: cls } = await adminDb
      .from('yoga_classes')
      .select('enrolled')
      .eq('id', booking.class_id)
      .single()
    if (cls && cls.enrolled > 0) {
      await adminDb.from('yoga_classes').update({ enrolled: cls.enrolled - 1 }).eq('id', booking.class_id)
    }
  }

  return NextResponse.json({ ok: true })
}
