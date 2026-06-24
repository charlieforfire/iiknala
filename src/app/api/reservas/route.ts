import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { str, bool, ValidationError } from '@/lib/validate'
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  if (!checkRateLimit(`reservas:${user.id}`, 20, 60_000)) return rateLimitResponse()

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  let classId: string
  let guest: boolean
  try {
    classId = str(b.classId, { required: true, label: 'classId', maxLen: 100 })!
    guest = bool(b.guest) ?? false
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: 'Entrada inválida' }, { status: 400 })
  }

  const spotsNeeded = guest ? 2 : 1

  const { data: existing } = await supabase
    .from('bookings').select('id').eq('user_id', user.id).eq('class_id', classId).eq('status', 'confirmed').single()
  if (existing) return NextResponse.json({ error: 'Ya tienes esta clase reservada' }, { status: 400 })

  const { data: cls } = await supabase
    .from('yoga_classes').select('capacity, enrolled').eq('id', classId).single()
  if (!cls) return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })

  const spotsLeft = cls.capacity - cls.enrolled
  if (spotsLeft < spotsNeeded) {
    return NextResponse.json({
      error: guest
        ? 'Esta clase no tiene lugares suficientes para traer a alguien.'
        : 'Clase completa',
    }, { status: 400 })
  }

  const today = new Date().toISOString().split('T')[0]
  const { data: activePkg } = await admin
    .from('user_packages')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const classesAvailable = activePkg
    ? (activePkg.classes_total === null ? Infinity : activePkg.classes_total - activePkg.classes_used)
    : 0

  if (classesAvailable < spotsNeeded) {
    if (!activePkg) return NextResponse.json({ error: 'Necesitas un paquete activo para reservar' }, { status: 400 })
    return NextResponse.json({
      error: guest
        ? 'No tienes suficientes clases disponibles para traer a alguien.'
        : 'Has usado todas las clases de tu paquete',
    }, { status: 400 })
  }

  if (!activePkg || classesAvailable === 0) {
    const { data: guestCredit } = await supabase
      .from('guest_class_credits')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'available')
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (!guestCredit) return NextResponse.json({ error: 'Necesitas un paquete activo para reservar' }, { status: 400 })

    const { data: newBooking, error: err } = await supabase.from('bookings').insert({
      user_id: user.id, class_id: classId, status: 'confirmed', guest: false, classes_deducted: 0,
    }).select('id').single()
    if (err) return NextResponse.json({ error: err.message }, { status: 500 })

    await admin.from('guest_class_credits').update({
      status: 'used', used_at: new Date().toISOString(), booking_id: newBooking.id,
    }).eq('id', guestCredit.id)
    await admin.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase.from('bookings').insert({
    user_id: user.id, class_id: classId, status: 'confirmed',
    guest, classes_deducted: spotsNeeded,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const newUsed = activePkg.classes_used + spotsNeeded
  const newStatus = activePkg.classes_total !== null && newUsed >= activePkg.classes_total ? 'exhausted' : 'active'
  await admin.from('user_packages').update({ classes_used: newUsed, status: newStatus }).eq('id', activePkg.id)
  await admin.from('yoga_classes').update({ enrolled: cls.enrolled + spotsNeeded }).eq('id', classId)

  return NextResponse.json({ ok: true, guest })
}
