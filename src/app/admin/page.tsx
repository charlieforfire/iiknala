import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { isAdminAuthed } from '@/lib/admin-auth'
import ZoomButton from '@/components/admin/ZoomButton'
import ConfirmCashButton from '@/components/admin/ConfirmCashButton'
import EditClassForm from '@/components/admin/EditClassForm'
import AdminLogout from '@/components/admin/AdminLogout'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

export default async function AdminPage() {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const supabase = await createClient()

  const { data: classes } = await supabase
    .from('yoga_classes')
    .select('*, bookings(id, status, user_id)')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, yoga_class:yoga_classes(title, date, time)')
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: pendingCash } = await supabase
    .from('bookings')
    .select('*, yoga_class:yoga_classes(title, date, time)')
    .eq('status', 'pending_cash')
    .order('created_at', { ascending: false })

  // Obtener emails de alumnos con pago pendiente
  const pendingWithEmail = await Promise.all(
    (pendingCash ?? []).map(async (b: any) => {
      const { data } = await adminDb.auth.admin.getUserById(b.user_id)
      return {
        ...b,
        userEmail: data.user?.email ?? '—',
        userName: data.user?.user_metadata?.full_name ?? null,
      }
    })
  )

  // Emails para las últimas reservas confirmadas
  const bookingsWithEmail = await Promise.all(
    (allBookings ?? []).map(async (b: any) => {
      const { data } = await adminDb.auth.admin.getUserById(b.user_id)
      return {
        ...b,
        userEmail: data.user?.email ?? b.user_id,
        userName: data.user?.user_metadata?.full_name ?? null,
      }
    })
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Panel de administración</p>
          <h1 className="text-3xl font-light text-stone-800">iiknala Admin</h1>
        </div>
        <AdminLogout />
      </div>

      {/* Resumen de clases */}
      <section className="mb-16">
        <h2 className="text-lg font-medium text-stone-700 mb-6">Próximas clases — ocupación</h2>
        <div className="flex flex-col gap-3">
          {(classes ?? []).map((cls: any) => {
            const confirmed = (cls.bookings ?? []).filter((b: any) => b.status === 'confirmed').length
            const pending = (cls.bookings ?? []).filter((b: any) => b.status === 'pending_cash').length
            const total = confirmed + pending
            const pct = Math.round((total / cls.capacity) * 100)
            const d = new Date(cls.date + 'T12:00:00')
            const label = `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${cls.time.slice(0,5)}`

            return (
              <div key={cls.id} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-stone-800">{cls.title}</p>
                    <p className="text-xs text-stone-400">{label} · {cls.instructor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-stone-800">{total} / {cls.capacity}</p>
                    <p className="text-xs text-stone-400">
                      {confirmed} confirmadas
                      {pending > 0 && <span className="text-amber-500"> · {pending} pend.</span>}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-1.5">
                  <div
                    className="bg-[#4a6741] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <ZoomButton classId={cls.id} currentZoomLink={cls.zoom_link} />
                <EditClassForm cls={cls} />
              </div>
            )
          })}
        </div>
      </section>

      {/* Caja — pagos pendientes en estudio */}
      <section className="mb-16">
        <h2 className="text-lg font-medium text-stone-700 mb-6 flex items-center gap-3">
          Caja — pago en estudio
          {pendingWithEmail.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {pendingWithEmail.length} pendiente{pendingWithEmail.length > 1 ? 's' : ''}
            </span>
          )}
        </h2>
        {pendingWithEmail.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin pagos pendientes.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingWithEmail.map((b: any) => {
              const d = b.yoga_class ? new Date(b.yoga_class.date + 'T12:00:00') : null
              const label = d ? `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${b.yoga_class.time.slice(0,5)}` : '—'
              return (
                <div key={b.id} className="bg-white rounded-xl border border-amber-200 bg-amber-50/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-800">{b.yoga_class?.title ?? '—'}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{label}</p>
                    <p className="text-sm text-stone-700 mt-1">
                      {b.userName ? `${b.userName} · ` : ''}<span className="text-stone-500">{b.userEmail}</span>
                    </p>
                  </div>
                  <ConfirmCashButton bookingId={b.id} />
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Últimas reservas */}
      <section>
        <h2 className="text-lg font-medium text-stone-700 mb-6">Últimas reservas confirmadas</h2>
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
            <span>Alumno</span>
            <span>Clase</span>
            <span>Fecha y hora</span>
          </div>
          {bookingsWithEmail.length === 0 ? (
            <p className="px-6 py-8 text-stone-400 text-sm">No hay reservas aún.</p>
          ) : (
            bookingsWithEmail.map((b: any) => {
              const d = b.yoga_class ? new Date(b.yoga_class.date + 'T12:00:00') : null
              const label = d ? `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${b.yoga_class.time.slice(0,5)}` : '—'
              return (
                <div key={b.id} className="grid grid-cols-3 px-6 py-4 border-b border-stone-100 last:border-0 text-sm">
                  <div>
                    {b.userName && <p className="text-stone-800 font-medium">{b.userName}</p>}
                    <p className="text-stone-500 text-xs">{b.userEmail}</p>
                  </div>
                  <p className="text-stone-700 self-center">{b.yoga_class?.title ?? '—'}</p>
                  <p className="text-stone-500 self-center">{label}</p>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
