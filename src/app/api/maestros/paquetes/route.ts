import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isTeacherAuthed } from '@/lib/teacher-auth'
import { str, oneOf, ValidationError } from '@/lib/validate'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PAYMENT_METHODS = ['efectivo', 'transferencia'] as const

function calcExpiresAt(vigencia_dias: number | null): string | null {
  if (vigencia_dias === null || vigencia_dias === undefined) return null
  const d = new Date()
  d.setDate(d.getDate() + vigencia_dias)
  return d.toISOString().split('T')[0]
}

export async function POST(req: NextRequest) {
  if (!await isTeacherAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  let b: Record<string, unknown>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  try {
    const user_id = str(b.user_id, { required: true, label: 'user_id', maxLen: 100 })!
    const package_id = str(b.package_id, { required: true, label: 'package_id', maxLen: 100 })!
    const payment_method = oneOf(b.payment_method, PAYMENT_METHODS, { label: 'Método de pago' }) ?? 'efectivo'

    const { data: pkg, error: pkgError } = await adminDb
      .from('packages')
      .select('nombre, clases, vigencia_dias, admin_only')
      .eq('id', package_id)
      .eq('activo', true)
      .single()

    if (pkgError || !pkg) return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 })
    if (pkg.admin_only) return NextResponse.json({ error: 'No autorizado para asignar este paquete' }, { status: 403 })

    const { error } = await adminDb.from('user_packages').insert({
      user_id,
      package_id,
      package_name: pkg.nombre,
      classes_total: pkg.clases,
      classes_used: 0,
      status: 'active',
      expires_at: calcExpiresAt(pkg.vigencia_dias),
      stripe_session_id: `manual_${payment_method}_${crypto.randomUUID()}`,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
