import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { str, num, bool, oneOf, validDate, validTime, ValidationError } from '@/lib/validate'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LEVELS = ['multinivel', 'principiantes', 'avanzado'] as const

export async function POST(req: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  try {
    const title = str(b.title, { required: true, label: 'Título', maxLen: 120, minLen: 2 })!
    const date = validDate(b.date, { required: true, label: 'Fecha' })!
    const time = validTime(b.time, { required: true, label: 'Hora' })!
    const instructor = str(b.instructor, { required: true, label: 'Instructor', maxLen: 80, minLen: 2 })!
    const capacity = num(b.capacity, { required: true, label: 'Capacidad', min: 1, max: 200, integer: true })!
    const description = str(b.description, { label: 'Descripción', maxLen: 600 })
    const is_online = bool(b.is_online) ?? false
    const level = oneOf(b.level, LEVELS, { label: 'Nivel' }) ?? 'multinivel'

    const { data, error } = await adminDb
      .from('yoga_classes')
      .insert({ title, date, time, instructor, capacity, description, is_online, level, enrolled: 0 })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, data })
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
