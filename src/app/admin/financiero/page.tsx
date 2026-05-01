import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdminAuthed } from '@/lib/admin-auth'
import AdminNav from '@/components/admin/AdminNav'
import AdminLogout from '@/components/admin/AdminLogout'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const packagePrices: Record<string, number> = {
  'primera-clase': 200,
  'clase-suelta': 250,
  'pack-4': 900,
  'pack-8': 1500,
  'pack-12': 1800,
  'pack-16': 2050,
  'ilimitado': 2400,
  'rocket-suelta': 300,
  'rocket-pack': 1000,
}

function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString()
}

export default async function FinancieroPage() {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const supabase = await createClient()
  const mesInicio = startOfMonth()

  const [packagesRes, purchasesRes, cashBookingsRes] = await Promise.all([
    supabase.from('user_packages').select('*').gte('created_at', mesInicio).order('created_at', { ascending: false }),
    supabase.from('purchases').select('*').eq('status', 'completed').gte('created_at', mesInicio).order('created_at', { ascending: false }),
    supabase.from('bookings').select('*, yoga_class:yoga_classes(title, date, time)')
      .eq('status', 'confirmed')
      .is('stripe_payment_intent', null)
      .gte('created_at', mesInicio)
      .order('created_at', { ascending: false }),
  ])

  const packages = packagesRes.data ?? []
  const purchases = purchasesRes.data ?? []
  const cashBookings = cashBookingsRes.data ?? []

  // Stripe packages: solo los que tienen stripe_session_id
  const stripePackages = packages.filter((p: any) => p.stripe_session_id)
  const stripePackagesTotal = stripePackages.reduce((sum: number, p: any) => {
    return sum + (packagePrices[p.package_id] ?? 0)
  }, 0)

  // Stripe formations: $36,500 o $6,000 (no tenemos el monto guardado, usamos count)
  const formacionesTotal = purchases.length * 6000 // mínimo inscripción

  const totalStripe = stripePackagesTotal + formacionesTotal
  const totalEfectivo = cashBookings.length // solo conteo

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

  const mesNombre = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Panel de administración</p>
          <h1 className="text-3xl font-light text-stone-800">iiknala Admin</h1>
        </div>
        <AdminLogout />
      </div>

      <AdminNav active="financiero" />

      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-lg font-medium text-stone-700">Panel financiero</h2>
        <span className="text-stone-400 text-sm capitalize">· {mesNombre}</span>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Stripe — Paquetes</p>
          <p className="text-3xl font-light text-stone-800">${stripePackagesTotal.toLocaleString('es-MX')}</p>
          <p className="text-xs text-stone-400 mt-1">MXN · {stripePackages.length} venta{stripePackages.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Stripe — Formaciones</p>
          <p className="text-3xl font-light text-stone-800">{purchases.length}</p>
          <p className="text-xs text-stone-400 mt-1">inscripción{purchases.length !== 1 ? 'es' : ''} este mes</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Efectivo confirmado</p>
          <p className="text-3xl font-light text-stone-800">{totalEfectivo}</p>
          <p className="text-xs text-stone-400 mt-1">pago{totalEfectivo !== 1 ? 's' : ''} en estudio este mes</p>
        </div>
      </div>

      {/* Paquetes Stripe este mes */}
      <section className="mb-10">
        <h3 className="text-base font-semibold text-stone-700 mb-4">Paquetes vendidos este mes (Stripe)</h3>
        {stripePackages.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin ventas este mes.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
              <span>Paquete</span>
              <span>Fecha</span>
              <span className="text-right">Monto</span>
            </div>
            {stripePackages.map((p: any) => (
              <div key={p.id} className="grid grid-cols-3 px-6 py-4 border-b border-stone-100 last:border-0 text-sm">
                <p className="text-stone-700">{p.package_name}</p>
                <p className="text-stone-400">
                  {new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-stone-800 font-medium text-right">
                  ${(packagePrices[p.package_id] ?? 0).toLocaleString('es-MX')}
                </p>
              </div>
            ))}
            <div className="grid grid-cols-3 px-6 py-4 bg-stone-50 text-sm font-semibold">
              <span className="text-stone-600 col-span-2">Total</span>
              <span className="text-stone-800 text-right">${stripePackagesTotal.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
        )}
      </section>

      {/* Formaciones Stripe este mes */}
      {purchases.length > 0 && (
        <section className="mb-10">
          <h3 className="text-base font-semibold text-stone-700 mb-4">Formaciones este mes (Stripe)</h3>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            {purchases.map((p: any) => (
              <div key={p.id} className="px-6 py-4 border-b border-stone-100 last:border-0 flex justify-between text-sm">
                <div>
                  <p className="text-stone-700">YTT 200H Vinyasa Progresivo</p>
                  <p className="text-stone-400 text-xs">{new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })}</p>
                </div>
                <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium self-center">Completado</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Efectivo este mes */}
      <section>
        <h3 className="text-base font-semibold text-stone-700 mb-4">Pagos en efectivo confirmados este mes</h3>
        {cashBookings.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin pagos en efectivo este mes.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="grid grid-cols-2 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
              <span>Clase</span>
              <span>Fecha</span>
            </div>
            {cashBookings.map((b: any) => {
              const d = b.yoga_class ? new Date(b.yoga_class.date + 'T12:00:00') : null
              const label = d ? `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}` : '—'
              return (
                <div key={b.id} className="grid grid-cols-2 px-6 py-4 border-b border-stone-100 last:border-0 text-sm">
                  <p className="text-stone-700">{b.yoga_class?.title ?? '—'}</p>
                  <p className="text-stone-400">{label}</p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
