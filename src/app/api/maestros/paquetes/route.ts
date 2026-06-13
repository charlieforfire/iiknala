import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isTeacherAuthed } from '@/lib/teacher-auth'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function calcExpiresAt(vigencia_dias: number | null): string | null {
  if (!vigencia_dias) return null
  const d = new Date()
  d.setDate(d.getDate() + vigencia_dias)
  return d.toISOString().split('T')[0]
}

export async function POST(req: NextRequest) {
  if (!await isTeacherAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { user_id, package_id } = await req.json()
  if (!user_id || !package_id) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const { data: pkg, error: pkgError } = await adminDb
    .from('packages')
    .select('nombre, clases, vigencia_dias')
    .eq('id', package_id)
    .single()

  if (pkgError || !pkg) return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 })

  const { error } = await adminDb.from('user_packages').insert({
    user_id,
    package_id,
    package_name: pkg.nombre,
    classes_total: pkg.clases,
    classes_used: 0,
    status: 'active',
    expires_at: calcExpiresAt(pkg.vigencia_dias),
    stripe_session_id: `manual_teacher_${crypto.randomUUID()}`,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
