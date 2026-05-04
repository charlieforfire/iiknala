import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { id } = await params
  const { birthday, notes } = await req.json()

  const { data: { user } } = await adminDb.auth.admin.getUserById(id)
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  const { error } = await adminDb.auth.admin.updateUserById(id, {
    user_metadata: {
      ...user.user_metadata,
      birthday: birthday || null,
      notes: notes || null,
    },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
