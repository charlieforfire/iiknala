import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getResend, FROM } from '@/lib/resend'
import { packageConfirmedHtml, packageConfirmedSubject } from '@/lib/emails/package-confirmed'
import { inviteCodesForPackage, createInviteCodes } from '@/lib/invite-codes'
import { str, num, oneOf, ValidationError } from '@/lib/validate'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PAYMENT_METHODS = ['efectivo', 'transferencia'] as const

function calcExpiresAt(vigencia_dias: number | null): string | null {
  if (!vigencia_dias) return null
  const d = new Date()
  d.setDate(d.getDate() + vigencia_dias)
  return d.toISOString().split('T')[0]
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
    const user_id = str(b.user_id, { required: true, label: 'user_id', maxLen: 100 })!
    const package_id = str(b.package_id, { required: true, label: 'package_id', maxLen: 100 })!
    const payment_method = oneOf(b.payment_method, PAYMENT_METHODS, { label: 'Método de pago' }) ?? 'efectivo'

    let package_name: string
    let classes_total: number | null
    let expires_at: string | null
    let final_package_id: string

    if (package_id === '__custom__') {
      const custom_nombre = str(b.custom_nombre, { required: true, label: 'Nombre del paquete', maxLen: 120, minLen: 1 })!
      const custom_clases = num(b.custom_clases, { label: 'Clases', min: 1, max: 9999, integer: true })
      const custom_vigencia_dias = num(b.custom_vigencia_dias, { label: 'Vigencia días', min: 1, max: 3650, integer: true })

      package_name = custom_nombre
      classes_total = custom_clases
      expires_at = calcExpiresAt(custom_vigencia_dias)
      final_package_id = custom_nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80)
    } else {
      const { data: catalogPkg, error: catalogErr } = await adminDb
        .from('packages')
        .select('nombre, clases, vigencia_dias')
        .eq('id', package_id)
        .single()

      if (catalogErr || !catalogPkg) {
        return NextResponse.json({ error: 'Paquete no encontrado en el catálogo' }, { status: 404 })
      }

      package_name = catalogPkg.nombre
      classes_total = catalogPkg.clases
      expires_at = calcExpiresAt(catalogPkg.vigencia_dias)
      final_package_id = package_id
    }

    const { data: pkg, error } = await adminDb.from('user_packages').insert({
      user_id,
      package_id: final_package_id,
      package_name,
      classes_total,
      classes_used: 0,
      status: 'active',
      expires_at,
      stripe_session_id: `manual_${payment_method}_${crypto.randomUUID()}`,
    }).select('id').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const codesCount = inviteCodesForPackage(final_package_id)
    await createInviteCodes(adminDb, pkg.id, user_id, codesCount, expires_at)

    try {
      const { data: { user } } = await adminDb.auth.admin.getUserById(user_id)
      if (user?.email) {
        await getResend().emails.send({
          from: FROM,
          to: user.email,
          subject: packageConfirmedSubject(package_name),
          html: packageConfirmedHtml({
            userName: user.user_metadata?.full_name ?? user.email,
            packageName: package_name,
            classesTotal: classes_total,
            expiresAt: expires_at,
            paymentMethod: payment_method,
            packageId: pkg.id,
          }),
        })
      }
    } catch (err) {
      console.error('Email error:', err)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ValidationError) return NextResponse.json({ error: err.message }, { status: 400 })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
