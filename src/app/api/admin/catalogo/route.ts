import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { str, num, oneOf, bool, ValidationError } from '@/lib/validate'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TIPOS = ['regular', 'ilimitado-multimes', 'rocket', 'summer'] as const

export async function GET() {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { data, error } = await db.from('packages').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  try {
    const id = str(b.id, { required: true, label: 'id', maxLen: 80, minLen: 1 })!
    if (!/^[a-z0-9-]+$/.test(id)) return NextResponse.json({ error: 'id solo puede contener letras minúsculas, números y guiones' }, { status: 400 })
    const nombre = str(b.nombre, { required: true, label: 'nombre', maxLen: 120, minLen: 1 })!
    const precio = num(b.precio, { required: true, label: 'precio', min: 0, max: 999999, integer: true })!
    const vigencia_dias = num(b.vigencia_dias, { label: 'vigencia_dias', min: 1, max: 3650, integer: true })
    const clases = num(b.clases, { label: 'clases', min: 1, max: 9999, integer: true })
    const tipo = oneOf(b.tipo, TIPOS, { label: 'tipo' }) ?? 'regular'
    const nota = str(b.nota, { label: 'nota', maxLen: 300 })
    const sort_order = num(b.sort_order, { label: 'sort_order', min: 0, max: 9999, integer: true }) ?? 0
    const activo = bool(b.activo) ?? true
    const destacado = bool(b.destacado) ?? false
    const is_shareable = bool(b.is_shareable) ?? false

    const extras = Array.isArray(b.extras)
      ? (b.extras as unknown[]).slice(0, 10).map(e => String(e).slice(0, 100))
      : []

    const { data, error } = await db.from('packages').insert({
      id, nombre, precio, vigencia_dias, clases, activo, destacado,
      tipo, extras, is_shareable, nota, sort_order,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ package: data })
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
