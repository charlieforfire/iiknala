import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthed } from '@/lib/admin-auth'
import AdminNav from '@/components/admin/AdminNav'
import AdminLogout from '@/components/admin/AdminLogout'
import EditClassForm from '@/components/admin/EditClassForm'
import ZoomButton from '@/components/admin/ZoomButton'
import CreateClassForm from '@/components/admin/CreateClassForm'
import DeleteClassButton from '@/components/admin/DeleteClassButton'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

export default async function ClasesAdminPage() {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const { data: upcoming } = await adminDb
    .from('yoga_classes')
    .select('*, bookings(id, status)')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  const { data: past } = await adminDb
    .from('yoga_classes')
    .select('*, bookings(id, status)')
    .lt('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: false })
    .order('time', { ascending: false })
    .limit(30)

  function ClassCard({ cls, isPast }: { cls: any; isPast?: boolean }) {
    const confirmed = (cls.bookings ?? []).filter((b: any) => b.status === 'confirmed').length
    const pending = (cls.bookings ?? []).filter((b: any) => b.status === 'pending_cash').length
    const total = confirmed + pending
    const pct = Math.round((total / cls.capacity) * 100)
    const d = new Date(cls.date + 'T12:00:00')
    const label = `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${cls.time.slice(0,5)}`

    return (
      <div className={`bg-white rounded-xl border p-4 ${isPast ? 'border-stone-100 opacity-70' : 'border-stone-200'}`}>
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <p className="font-medium text-stone-800">{cls.title}</p>
            <p className="text-xs text-stone-400 mt-0.5">{label} · {cls.instructor}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-stone-800 text-sm">{total} / {cls.capacity}</p>
            <p className="text-xs text-stone-400">
              {confirmed} conf.{pending > 0 && <span className="text-amber-500"> · {pending} pend.</span>}
            </p>
          </div>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-1.5 mb-3">
          <div className="bg-[#4a6741] h-1.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isPast && <ZoomButton classId={cls.id} currentZoomLink={cls.zoom_link} />}
            <Link href={`/admin/clases/${cls.id}`} className="text-xs text-stone-400 hover:text-stone-700 transition-colors">
              Ver alumnos →
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <EditClassForm cls={cls} />
            <DeleteClassButton classId={cls.id} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Panel de administración</p>
          <h1 className="text-3xl font-light text-stone-800">iiknala Admin</h1>
        </div>
        <AdminLogout />
      </div>

      <AdminNav active="clases" />

      <CreateClassForm />

      {/* Próximas */}
      <section className="mb-12">
        <h2 className="text-lg font-medium text-stone-700 mb-4">
          Próximas clases <span className="text-stone-400 font-normal text-base">({(upcoming ?? []).length})</span>
        </h2>
        {(upcoming ?? []).length === 0 ? (
          <p className="text-stone-400 text-sm">Sin clases programadas.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {(upcoming ?? []).map((cls: any) => <ClassCard key={cls.id} cls={cls} />)}
          </div>
        )}
      </section>

      {/* Pasadas */}
      {(past ?? []).length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-stone-700 mb-4">
            Clases pasadas <span className="text-stone-400 font-normal text-base">(últimas 30)</span>
          </h2>
          <div className="flex flex-col gap-3">
            {(past ?? []).map((cls: any) => <ClassCard key={cls.id} cls={cls} isPast />)}
          </div>
        </section>
      )}
    </div>
  )
}
