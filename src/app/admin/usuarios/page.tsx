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

export default async function UsuariosPage() {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const { data: { users } } = await adminDb.auth.admin.listUsers({ perPage: 200 })

  const [bookingCountsRes, activePackagesRes] = await Promise.all([
    adminDb.from('bookings').select('user_id, status'),
    adminDb.from('user_packages').select('user_id').eq('status', 'active'),
  ])

  const countMap: Record<string, { total: number; pending: number }> = {}
  for (const b of bookingCountsRes.data ?? []) {
    if (!countMap[b.user_id]) countMap[b.user_id] = { total: 0, pending: 0 }
    countMap[b.user_id].total++
    if (b.status === 'pending_cash') countMap[b.user_id].pending++
  }

  const activeUserIds = new Set((activePackagesRes.data ?? []).map((p: any) => p.user_id))

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
        <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
          <span className="col-span-2">Usuario</span>
          <span>Registro</span>
          <span className="text-right">Reservas</span>
        </div>
        {sorted.map(u => {
          const name = u.user_metadata?.full_name ?? '—'
          const counts = countMap[u.id] ?? { total: 0, pending: 0 }
          const fecha = new Date(u.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
          const hasActive = activeUserIds.has(u.id)
          return (
            <Link
              key={u.id}
              href={`/admin/usuarios/${u.id}`}
              className="grid grid-cols-4 px-6 py-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors"
            >
              <div className="col-span-2 flex items-center gap-3">
                <span
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${hasActive ? 'bg-emerald-500' : 'bg-red-400'}`}
                  title={hasActive ? 'Paquete activo' : 'Sin paquete activo'}
                />
                <div>
                  <p className="text-stone-800 font-medium text-sm">{name}</p>
                  <p className="text-stone-400 text-xs">{u.email}</p>
                </div>
              </div>
              <p className="text-stone-500 text-sm self-center">{fecha}</p>
              <div className="text-right self-center">
                <p className="text-stone-800 text-sm font-medium">{counts.total}</p>
                {counts.pending > 0 && (
                  <p className="text-amber-600 text-xs">{counts.pending} pendiente{counts.pending > 1 ? 's' : ''}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
