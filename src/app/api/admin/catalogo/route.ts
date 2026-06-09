import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  const { data, error } = await db.from('packages').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json()
  const { id, nombre, precio, vigencia_dias, clases, activo, destacado, tipo, extras, is_shareable, nota, sort_order } = body

  if (!id || !nombre || !precio) {
    return NextResponse.json({ error: 'id, nombre y precio son requeridos' }, { status: 400 })
  }

  const { data, error } = await db.from('packages').insert({
    id,
    nombre,
    precio: Number(precio),
    vigencia_dias: vigencia_dias ? Number(vigencia_dias) : null,
    clases: clases ? Number(clases) : null,
    activo: activo !== false,
    destacado: !!destacado,
    tipo: tipo ?? 'regular',
    extras: extras ?? [],
    is_shareable: !!is_shareable,
    nota: nota || null,
    sort_order: sort_order ? Number(sort_order) : 0,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ package: data })
}
