import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const { user_id, package_name, classes_total, expires_at, payment_method } = await req.json()

  if (!user_id || !package_name) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { error } = await adminDb.from('user_packages').insert({
    user_id,
    package_id: package_name.toLowerCase().replace(/\s+/g, '-'),
    package_name,
    classes_total: classes_total ? Number(classes_total) : null,
    classes_used: 0,
    status: 'active',
    expires_at: expires_at || null,
    stripe_session_id: payment_method ?? null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
