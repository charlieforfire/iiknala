import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const body = await req.json()
  const { title, date, time, instructor, capacity, description, is_online, level } = body

  if (!title || !date || !time || !instructor || !capacity) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data, error } = await adminDb
    .from('yoga_classes')
    .insert({
      title,
      date,
      time,
      instructor,
      capacity: Number(capacity),
      description: description || null,
      is_online: !!is_online,
      level: level || 'multinivel',
      enrolled: 0,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, data })
}
