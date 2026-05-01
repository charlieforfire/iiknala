import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = await params
  const { status, method } = await req.json()

  if (!['confirmed', 'cancelled'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
  }

  const { data: booking } = await adminDb
    .from('bookings')
    .select('status, class_id')
    .eq('id', id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 })

  const update: Record<string, string> = { status }
  if (status === 'confirmed' && (method === 'efectivo' || method === 'transferencia')) {
    update.stripe_payment_intent = method
  }

  await adminDb.from('bookings').update(update).eq('id', id)

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
