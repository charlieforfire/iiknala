import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const body = await req.json()
  const { nombre, precio, vigencia_dias, clases, activo, destacado, tipo, extras, is_shareable, nota, sort_order } = body

  const { error } = await db.from('packages').update({
    nombre,
    precio: Number(precio),
    vigencia_dias: vigencia_dias ? Number(vigencia_dias) : null,
    clases: clases ? Number(clases) : null,
    activo: !!activo,
    destacado: !!destacado,
    tipo,
    extras: extras ?? [],
    is_shareable: !!is_shareable,
    nota: nota || null,
    sort_order: sort_order ? Number(sort_order) : 0,
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { error } = await db.from('packages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
