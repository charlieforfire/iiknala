import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { str, num, bool, oneOf, validDate, validTime, ValidationError } from '@/lib/validate'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const LEVELS = ['multinivel', 'principiantes', 'avanzado'] as const

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  if (!id || id.length > 100) return NextResponse.json({ error: 'id inválido' }, { status: 400 })

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  try {
    const update: Record<string, unknown> = {}
    if ('title' in b) update.title = str(b.title, { required: true, label: 'Título', maxLen: 120, minLen: 2 })
    if ('date' in b) update.date = validDate(b.date, { required: true, label: 'Fecha' })
    if ('time' in b) update.time = validTime(b.time, { required: true, label: 'Hora' })
    if ('instructor' in b) update.instructor = str(b.instructor, { required: true, label: 'Instructor', maxLen: 80, minLen: 2 })
    if ('capacity' in b) update.capacity = num(b.capacity, { required: true, label: 'Capacidad', min: 1, max: 200, integer: true })
    if ('description' in b) update.description = str(b.description, { label: 'Descripción', maxLen: 600 })
    if ('is_online' in b) update.is_online = bool(b.is_online)
    if ('level' in b) update.level = oneOf(b.level, LEVELS, { label: 'Nivel' }) ?? 'multinivel'

    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })

    const { error } = await adminDb.from('yoga_classes').update(update).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { id } = await params
  if (!id || id.length > 100) return NextResponse.json({ error: 'id inválido' }, { status: 400 })
  await adminDb.from('bookings').delete().eq('class_id', id)
  const { error } = await adminDb.from('yoga_classes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
