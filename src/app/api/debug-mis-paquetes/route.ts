import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createUserClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const adminDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/debug-mis-paquetes?session_id=cs_live_...
// Shows what's in the DB for the logged-in user and optionally retries inserting a package
export async function GET(req: NextRequest) {
  const userClient = await createUserClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const today = new Date().toISOString().split('T')[0]

  const [{ data: packages }, { data: bookings }] = await Promise.all([
    adminDb.from('user_packages').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    adminDb.from('bookings').select('id, class_id, status, created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const result: Record<string, unknown> = {
    user_id: user.id,
    email: user.email,
    packages_in_db: packages ?? [],
    bookings_in_db: bookings ?? [],
    today,
  }

  // If session_id provided, attempt to re-insert the package
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId)
      result.stripe_session = {
        id: session.id,
        payment_status: session.payment_status,
        metadata: session.metadata,
      }

      const { type, paqueteId, userId, nombre } = session.metadata ?? {}

      if (userId !== user.id) {
        result.warning = `El userId del pago (${userId}) no coincide con tu user_id actual (${user.id})`
      }

      if (type === 'paquete' && paqueteId) {
        const { data: existing } = await adminDb
          .from('user_packages').select('id').eq('stripe_session_id', session.id).maybeSingle()
        result.package_already_exists = !!existing

        if (!existing) {
          const { data: pkgConfig, error: pkgLookupErr } = await adminDb
            .from('packages').select('nombre, clases, vigencia_dias, is_shareable').eq('id', paqueteId).maybeSingle()

          result.package_config_found = !!pkgConfig
          result.package_config = pkgConfig
          if (pkgLookupErr) result.pkg_lookup_error = pkgLookupErr

          const packageName = pkgConfig?.nombre ?? nombre ?? paqueteId
          const classes = pkgConfig?.clases ?? null
          const days = pkgConfig?.vigencia_dias ?? null
          const expiresAt = days
            ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : null

          const { data: newPkg, error: insertErr } = await adminDb.from('user_packages').insert({
            user_id: user.id,
            package_id: paqueteId,
            package_name: packageName,
            classes_total: classes,
            classes_used: 0,
            expires_at: expiresAt,
            status: 'active',
            stripe_session_id: session.id,
            is_shareable: pkgConfig?.is_shareable ?? false,
          }).select('id').single()

          if (insertErr) {
            result.insert_error = insertErr
            result.fixed = false
          } else {
            result.package_created = newPkg?.id
            result.fixed = true
          }
        }
      }
    } catch (e: unknown) {
      result.stripe_error = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json(result, { status: 200 })
}
