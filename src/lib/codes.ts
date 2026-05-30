import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type ApplyCodeResult =
  | { ok: true; type: 'referral'; message: string }
  | { ok: true; type: 'promo'; message: string; discount_pct: number | null }
  | { ok: false; error: string }

export async function applyCode(userId: string, rawCode: string): Promise<ApplyCodeResult> {
  const code = rawCode.trim().toUpperCase()

  const { data: rec } = await admin
    .from('codes')
    .select('*')
    .eq('code', code)
    .maybeSingle()

  if (!rec) return { ok: false, error: 'Código no válido' }

  if (rec.max_uses !== null && rec.uses_count >= rec.max_uses)
    return { ok: false, error: 'Este código ya alcanzó su límite de usos' }

  if (rec.expires_at && new Date(rec.expires_at) < new Date())
    return { ok: false, error: 'Este código ha expirado' }

  if (rec.type === 'referral') {
    if (rec.owner_id === userId)
      return { ok: false, error: 'No puedes usar tu propio código' }

    const { data: existingShare } = await admin
      .from('user_packages')
      .select('id')
      .eq('shared_with_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (existingShare)
      return { ok: false, error: 'Ya tienes acceso a un paquete compartido' }

    const today = new Date().toISOString().split('T')[0]
    const { data: pkg } = await admin
      .from('user_packages')
      .select('*')
      .eq('user_id', rec.owner_id)
      .eq('is_shareable', true)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gte.${today}`)
      .is('shared_with_id', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!pkg)
      return { ok: false, error: 'El dueño de este código no tiene un paquete compartible activo' }

    if (pkg.classes_total !== null && pkg.classes_used >= pkg.classes_total)
      return { ok: false, error: 'El paquete no tiene clases disponibles' }

    await admin.from('user_packages').update({ shared_with_id: userId }).eq('id', pkg.id)

    await admin.from('referrals').insert({
      code_id: rec.id,
      referrer_id: rec.owner_id,
      referred_id: userId,
      package_id: pkg.id,
    })

    await admin.from('codes').update({ uses_count: rec.uses_count + 1 }).eq('id', rec.id)

    // Clear pending_code from user metadata if present
    const { data: { user } } = await admin.auth.admin.getUserById(userId)
    if (user?.user_metadata?.pending_code) {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { ...user.user_metadata, pending_code: null },
      })
    }

    return { ok: true, type: 'referral', message: `¡Listo! Ahora compartes el paquete "${pkg.package_name}".` }
  }

  if (rec.type === 'promo') {
    await admin.from('codes').update({ uses_count: rec.uses_count + 1 }).eq('id', rec.id)
    return {
      ok: true,
      type: 'promo',
      discount_pct: rec.discount_pct ?? null,
      message: rec.discount_pct
        ? `Código aplicado: ${rec.discount_pct}% de descuento en tu siguiente compra.`
        : 'Código promocional aplicado.',
    }
  }

  return { ok: false, error: 'Tipo de código no reconocido' }
}
