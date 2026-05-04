import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthed } from '@/lib/admin-auth'
import AdminNav from '@/components/admin/AdminNav'
import AdminLogout from '@/components/admin/AdminLogout'
import ConfirmCashButton from '@/components/admin/ConfirmCashButton'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

export default async function ClaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const { id } = await params

  const { data: cls } = await adminDb
    .from('yoga_classes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cls) redirect('/admin')

  const { data: bookings } = await adminDb
    .from('bookings')
    .select('*')
    .eq('class_id', id)
    .in('status', ['confirmed', 'pending_cash'])
    .order('created_at', { ascending: true })

  // Obtener info de cada alumno
  const alumnosConInfo = await Promise.all(
    (bookings ?? []).map(async (b: any) => {
      const { data } = await adminDb.auth.admin.getUserById(b.user_id)
      return {
        ...b,
        userName: data.user?.user_metadata?.full_name ?? '—',
        userEmail: data.user?.email ?? b.user_id,
      }
    })
  )

  const confirmados = alumnosConInfo.filter(b => b.status === 'confirmed')
  const pendientes = alumnosConInfo.filter(b => b.status === 'pending_cash')

  const d = new Date(cls.date + 'T12:00:00')
  const label = `${diasSemana[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} · ${cls.time.slice(0,5)}`

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Panel de administración</p>
          <h1 className="text-3xl font-light text-stone-800">iiknala Admin</h1>
        </div>
        <AdminLogout />
      </div>

      <AdminNav active="clases" />

      <Link href="/admin" className="text-sm text-stone-400 hover:text-stone-700 mb-6 inline-flex items-center gap-1">
        ← Todas las clases
      </Link>

      {/* Info de la clase */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8 mt-4">
        <p className="text-xl font-medium text-stone-800">{cls.title}</p>
        <p className="text-stone-500 text-sm mt-1">{label} · {cls.instructor}</p>
        <div className="flex items-center gap-6 mt-3">
          <div>
            <p className="text-xs text-stone-400">Confirmados</p>
            <p className="text-2xl font-light text-[#4a6741]">{confirmados.length}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400">Pago en estudio</p>
            <p className="text-2xl font-light text-amber-600">{pendientes.length}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400">Cupo total</p>
            <p className="text-2xl font-light text-stone-500">{cls.capacity}</p>
          </div>
        </div>
      </div>

      {/* Confirmados pagados */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <h2 className="text-base font-semibold text-stone-700">Confirmados · pagados ({confirmados.length})</h2>
        </div>
        {confirmados.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin alumnos confirmados.</p>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            {confirmados.map((b: any, i: number) => (
              <div key={b.id} className={`px-5 py-3.5 flex items-center justify-between ${i < confirmados.length - 1 ? 'border-b border-stone-100' : ''}`}>
                <div>
                  <p className="text-stone-800 text-sm font-medium">{b.userName}</p>
                  <p className="text-stone-400 text-xs">{b.userEmail}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  b.stripe_payment_intent?.startsWith('pi_') ? 'bg-purple-100 text-purple-700' :
                  b.stripe_payment_intent === 'transferencia' ? 'bg-blue-100 text-blue-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {b.stripe_payment_intent?.startsWith('pi_') ? 'Stripe' :
                   b.stripe_payment_intent === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pendientes de pago */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <h2 className="text-base font-semibold text-stone-700">Pendientes de pago en estudio ({pendientes.length})</h2>
        </div>
        {pendientes.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin pendientes.</p>
        ) : (
          <div className="bg-white rounded-xl border border-amber-200 overflow-hidden">
            {pendientes.map((b: any, i: number) => (
              <div key={b.id} className={`px-5 py-3.5 flex items-center justify-between bg-amber-50/40 ${i < pendientes.length - 1 ? 'border-b border-amber-100' : ''}`}>
                <div>
                  <p className="text-stone-800 text-sm font-medium">{b.userName}</p>
                  <p className="text-stone-400 text-xs">{b.userEmail}</p>
                </div>
                <ConfirmCashButton bookingId={b.id} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
