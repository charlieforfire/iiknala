import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { str, validDate, ValidationError } from '@/lib/validate'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    const birthday = validDate(b.birthday, { label: 'Fecha de nacimiento' })
    const notes = str(b.notes, { label: 'Notas', maxLen: 1000 })

    const { data: { user } } = await adminDb.auth.admin.getUserById(id)
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const { error } = await adminDb.auth.admin.updateUserById(id, {
      user_metadata: { ...user.user_metadata, birthday, notes },
    })

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

  await Promise.all([
    adminDb.from('bookings').delete().eq('user_id', id),
    adminDb.from('user_packages').delete().eq('user_id', id),
    adminDb.from('purchases').delete().eq('user_id', id),
  ])

  const { error } = await adminDb.auth.admin.deleteUser(id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
