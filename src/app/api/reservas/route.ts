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

  const today = new Date().toISOString().split('T')[0]

  // 1. Own active package with available classes
  const { data: ownPkg } = await admin
    .from('user_packages')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const hasOwnCredit = ownPkg && (ownPkg.classes_total === null || ownPkg.classes_used < ownPkg.classes_total)

  // 2. Shared package (user is shared_with_id) — used only when own package has no credit
  let activePkg = hasOwnCredit ? ownPkg : null

  if (!activePkg) {
    const { data: sharedPkg } = await admin
      .from('user_packages')
      .select('*')
      .eq('shared_with_id', user.id)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .maybeSingle()

    if (sharedPkg && (sharedPkg.classes_total === null || sharedPkg.classes_used < sharedPkg.classes_total)) {
      activePkg = sharedPkg
    }
  }

  const hasPackageCredit = !!activePkg

  if (!hasPackageCredit) {
    // Check guest credit
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
      if (!ownPkg) return NextResponse.json({ error: 'Necesitas un paquete activo para reservar' }, { status: 400 })
      return NextResponse.json({ error: 'Has usado todas las clases de tu paquete' }, { status: 400 })
    }

    const { data: newBooking, error: guestBookingError } = await supabase.from('bookings').insert({
      user_id: user.id, class_id: classId, status: 'confirmed',
    }).select('id').single()
    if (guestBookingError) return NextResponse.json({ error: guestBookingError.message }, { status: 500 })

    await admin.from('guest_class_credits').update({
      status: 'used', used_at: new Date().toISOString(), booking_id: newBooking.id,
    }).eq('id', guestCredit.id)

    await admin.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)
    return NextResponse.json({ ok: true })
  }

  // Book and deduct from package (own or shared — same counter)
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
