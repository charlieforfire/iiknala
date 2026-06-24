import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { str, num, oneOf, bool, ValidationError } from '@/lib/validate'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TIPOS = ['regular', 'ilimitado-multimes', 'rocket', 'summer'] as const

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  if (!id || id.length > 80) return NextResponse.json({ error: 'id inválido' }, { status: 400 })

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  try {
    const update: Record<string, unknown> = {}
    if ('nombre' in b) update.nombre = str(b.nombre, { required: true, label: 'nombre', maxLen: 120, minLen: 1 })
    if ('precio' in b) update.precio = num(b.precio, { required: true, label: 'precio', min: 0, max: 999999, integer: true })
    if ('vigencia_dias' in b) update.vigencia_dias = num(b.vigencia_dias, { label: 'vigencia_dias', min: 1, max: 3650, integer: true })
    if ('clases' in b) update.clases = num(b.clases, { label: 'clases', min: 1, max: 9999, integer: true })
    if ('tipo' in b) update.tipo = oneOf(b.tipo, TIPOS, { label: 'tipo' }) ?? 'regular'
    if ('nota' in b) update.nota = str(b.nota, { label: 'nota', maxLen: 300 })
    if ('sort_order' in b) update.sort_order = num(b.sort_order, { label: 'sort_order', min: 0, max: 9999, integer: true }) ?? 0
    if ('activo' in b) update.activo = bool(b.activo)
    if ('destacado' in b) update.destacado = bool(b.destacado)
    if ('is_shareable' in b) update.is_shareable = bool(b.is_shareable)
    if ('extras' in b) {
      update.extras = Array.isArray(b.extras)
        ? (b.extras as unknown[]).slice(0, 10).map(e => String(e).slice(0, 100))
        : []
    }

    const { error } = await db.from('packages').update(update).eq('id', id)
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
  if (!id || id.length > 80) return NextResponse.json({ error: 'id inválido' }, { status: 400 })
  const { error } = await db.from('packages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
