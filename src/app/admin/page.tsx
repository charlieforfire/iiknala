import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ZoomButton from '@/components/admin/ZoomButton'

const ADMIN_EMAIL = 'iiknalayoga@gmail.com'

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== ADMIN_EMAIL) redirect('/')

  const { data: classes } = await supabase
    .from('yoga_classes')
    .select('*, bookings(id, status, user_id)')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  const { data: allBookings } = await supabase
    .from('bookings')
    .select('*, yoga_class:yoga_classes(title, date, time), profile:auth.users(email)')
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-12">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Panel de administración</p>
        <h1 className="text-3xl font-light text-stone-800">iiknala Admin</h1>
      </div>

      {/* Resumen de clases */}
      <section className="mb-16">
        <h2 className="text-lg font-medium text-stone-700 mb-6">Próximas clases — ocupación</h2>
        <div className="flex flex-col gap-3">
          {(classes ?? []).map((cls: any) => {
            const confirmed = (cls.bookings ?? []).filter((b: any) => b.status === 'confirmed').length
            const pct = Math.round((confirmed / cls.capacity) * 100)
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
                    <p className="font-semibold text-stone-800">{confirmed} / {cls.capacity}</p>
                    <p className="text-xs text-stone-400">{pct}% lleno</p>
                  </div>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-1.5">
                  <div
                    className="bg-[#4a6741] h-1.5 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <ZoomButton classId={cls.id} currentZoomLink={cls.zoom_link} />
              </div>
            )
          })}
        </div>
      </section>

      {/* Últimas reservas */}
      <section>
        <h2 className="text-lg font-medium text-stone-700 mb-6">Últimas reservas</h2>
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <div className="grid grid-cols-3 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
            <span>Usuario</span>
            <span>Clase</span>
            <span>Fecha y hora</span>
          </div>
          {(allBookings ?? []).length === 0 ? (
            <p className="px-6 py-8 text-stone-400 text-sm">No hay reservas aún.</p>
          ) : (
            (allBookings ?? []).map((b: any) => {
              const d = b.yoga_class ? new Date(b.yoga_class.date + 'T12:00:00') : null
              const label = d ? `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${b.yoga_class.time.slice(0,5)}` : '—'
              return (
                <div key={b.id} className="grid grid-cols-3 px-6 py-4 border-b border-stone-100 last:border-0 text-sm">
                  <p className="text-stone-700 truncate">{b.user_id}</p>
                  <p className="text-stone-700">{b.yoga_class?.title ?? '—'}</p>
                  <p className="text-stone-500">{label}</p>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
