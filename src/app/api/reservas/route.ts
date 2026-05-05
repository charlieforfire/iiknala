import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { classId } = await req.json()

  const { data: existing } = await supabase
    .from('bookings').select('id').eq('user_id', user.id).eq('class_id', classId).eq('status', 'confirmed').single()
  if (existing) return NextResponse.json({ error: 'Ya tienes esta clase reservada' }, { status: 400 })

  const { data: cls } = await supabase
    .from('yoga_classes').select('capacity, enrolled').eq('id', classId).single()
  if (!cls || cls.enrolled >= cls.capacity) return NextResponse.json({ error: 'Clase completa' }, { status: 400 })

  // Buscar paquete activo con clases disponibles
  const today = new Date().toISOString().split('T')[0]
  const { data: activePkg } = await supabase
    .from('user_packages')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  // Verificar crédito de invitado si no hay paquete activo con clases
  const hasPackageCredit = activePkg && (activePkg.classes_total === null || activePkg.classes_used < activePkg.classes_total)

  if (!hasPackageCredit) {
    const today = new Date().toISOString().split('T')[0]
    const { data: guestCredit } = await supabase
      .from('guest_class_credits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'available')
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (!guestCredit) {
      if (!activePkg) return NextResponse.json({ error: 'Necesitas un paquete activo para reservar' }, { status: 400 })
      return NextResponse.json({ error: 'Has usado todas las clases de tu paquete' }, { status: 400 })
    }

    // Usar crédito de invitado
    const { data: newBooking, error } = await supabase.from('bookings').insert({
      user_id: user.id, class_id: classId, status: 'confirmed',
    }).select('id').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await admin.from('guest_class_credits').update({
      status: 'used',
      used_at: new Date().toISOString(),
      booking_id: newBooking.id,
    }).eq('id', guestCredit.id)

    await admin.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)

    return NextResponse.json({ ok: true })
  }

  // Usar paquete propio
  const { error } = await supabase.from('bookings').insert({
    user_id: user.id, class_id: classId, status: 'confirmed',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const newUsed = activePkg.classes_used + 1
  const newStatus = activePkg.classes_total !== null && newUsed >= activePkg.classes_total ? 'exhausted' : 'active'
  await admin.from('user_packages').update({ classes_used: newUsed, status: newStatus }).eq('id', activePkg.id)

  await admin.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)

  return NextResponse.json({ ok: true })
}
