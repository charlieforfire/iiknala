import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthed } from '@/lib/admin-auth'
import AdminNav from '@/components/admin/AdminNav'
import AdminLogout from '@/components/admin/AdminLogout'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function birthdayDaysAway(birthday: string): number | null {
  if (!birthday) return null
  const today = new Date()
  const bday = new Date(birthday + 'T12:00:00')
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function UsuariosPage() {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const { data: { users } } = await adminDb.auth.admin.listUsers({ perPage: 200 })

  const [bookingCountsRes, activePackagesRes] = await Promise.all([
    adminDb.from('bookings').select('user_id, status'),
    adminDb.from('user_packages')
      .select('user_id, package_name, classes_total, classes_used, status')
      .eq('status', 'active'),
  ])

  const countMap: Record<string, { total: number; pending: number }> = {}
  for (const b of bookingCountsRes.data ?? []) {
    if (!countMap[b.user_id]) countMap[b.user_id] = { total: 0, pending: 0 }
    countMap[b.user_id].total++
    if (b.status === 'pending_cash') countMap[b.user_id].pending++
  }

  const packageMap: Record<string, { package_name: string; classes_total: number | null; classes_used: number }> = {}
  for (const p of activePackagesRes.data ?? []) {
    packageMap[p.user_id] = {
      package_name: p.package_name,
      classes_total: p.classes_total,
      classes_used: p.classes_used,
    }
  }

  const sorted = [...users].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Panel de administración</p>
          <h1 className="text-3xl font-light text-stone-800">iiknala Admin</h1>
        </div>
        <AdminLogout />
      </div>

      <AdminNav active="usuarios" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-stone-700">
          Usuarios registrados
          <span className="ml-2 text-stone-400 font-normal text-base">({sorted.length})</span>
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-5 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
          <span className="col-span-2">Usuario</span>
          <span className="col-span-2">Paquete · clases</span>
          <span className="text-right">Reservas</span>
        </div>
        {sorted.map(u => {
          const name = u.user_metadata?.full_name ?? '—'
          const counts = countMap[u.id] ?? { total: 0, pending: 0 }
          const pkg = packageMap[u.id]
          const hasActive = !!pkg
          const birthday = u.user_metadata?.birthday as string | undefined
          const daysAway = birthday ? birthdayDaysAway(birthday) : null
          const birthdaySoon = daysAway !== null && daysAway <= 7
          const hasNotes = !!(u.user_metadata?.notes as string | undefined)

          const usedPct = pkg && pkg.classes_total
            ? Math.min(Math.round((pkg.classes_used / pkg.classes_total) * 100), 100)
            : null

          return (
            <Link
              key={u.id}
              href={`/admin/usuarios/${u.id}`}
              className="grid grid-cols-5 px-6 py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors items-center"
            >
              <div className="col-span-2 flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${hasActive ? 'bg-emerald-500' : 'bg-red-400'}`}
                  title={hasActive ? 'Paquete activo' : 'Sin paquete activo'}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-stone-800 font-medium text-sm">{name}</p>
                    {birthdaySoon && <span title={`Cumpleaños en ${daysAway} día${daysAway === 1 ? '' : 's'}`}>🎂</span>}
                    {hasNotes && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Tiene notas" />}
                  </div>
                  <p className="text-stone-400 text-xs">{u.email}</p>
                </div>
              </div>

              <div className="col-span-2 pr-4">
                {pkg ? (
                  <div>
                    <p className="text-stone-700 text-xs font-medium mb-1 truncate">{pkg.package_name}</p>
                    {pkg.classes_total === null ? (
                      <p className="text-xs text-stone-400">Ilimitado</p>
                    ) : (
                      <>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 mb-0.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${(usedPct ?? 0) >= 90 ? 'bg-red-400' : (usedPct ?? 0) >= 60 ? 'bg-amber-400' : 'bg-[#4a6741]'}`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                        <p className="text-xs text-stone-400">{pkg.classes_used} / {pkg.classes_total} clases</p>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-stone-300 text-xs">Sin paquete</p>
                )}
              </div>

              <div className="text-right">
                <p className="text-stone-800 text-sm font-medium">{counts.total}</p>
                {counts.pending > 0 && (
                  <p className="text-amber-600 text-xs">{counts.pending} pend.</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
