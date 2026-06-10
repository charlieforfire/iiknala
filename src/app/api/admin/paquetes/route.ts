import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'
import { getResend, FROM } from '@/lib/resend'
import { packageConfirmedHtml, packageConfirmedSubject } from '@/lib/emails/package-confirmed'
import { inviteCodesForPackage, createInviteCodes } from '@/lib/invite-codes'

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
  if (!await isAdminAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

  const {
    user_id,
    package_id,
    custom_nombre,
    custom_clases,
    custom_vigencia_dias,
    payment_method,
  } = await req.json()

  if (!user_id || !package_id) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  let package_name: string
  let classes_total: number | null
  let expires_at: string | null
  let final_package_id: string

  if (package_id === '__custom__') {
    if (!custom_nombre) return NextResponse.json({ error: 'Nombre requerido para paquete personalizado' }, { status: 400 })
    package_name = custom_nombre
    classes_total = custom_clases ? Number(custom_clases) : null
    expires_at = calcExpiresAt(custom_vigencia_dias ? Number(custom_vigencia_dias) : null)
    final_package_id = custom_nombre.toLowerCase().replace(/\s+/g, '-')
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
    stripe_session_id: `manual_${payment_method ?? 'efectivo'}_${crypto.randomUUID()}`,
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
          paymentMethod: payment_method ?? 'efectivo',
          packageId: pkg.id,
        }),
      })
    }
  } catch (err) {
    console.error('Email error:', err)
  }

  return NextResponse.json({ ok: true })
}
