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

  // No duplicar reservas activas
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', user.id)
    .eq('class_id', classId)
    .in('status', ['confirmed', 'pending_cash'])
    .single()
  if (existing) return NextResponse.json({ error: 'Ya tienes esta clase reservada' }, { status: 400 })

  // Verificar capacidad contando confirmed + pending_cash
  const { data: cls } = await supabase
    .from('yoga_classes')
    .select('capacity, enrolled')
    .eq('id', classId)
    .single()
  if (!cls) return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })
  if (cls.enrolled >= cls.capacity) return NextResponse.json({ error: 'Clase completa' }, { status: 400 })

  const { error } = await supabase.from('bookings').insert({
    user_id: user.id,
    class_id: classId,
    status: 'pending_cash',
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin.from('yoga_classes').update({ enrolled: cls.enrolled + 1 }).eq('id', classId)

  return NextResponse.json({ ok: true })
}
