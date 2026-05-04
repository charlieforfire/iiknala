import { createClient as createAdmin } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { isAdminAuthed } from '@/lib/admin-auth'
import AdminNav from '@/components/admin/AdminNav'
import AdminLogout from '@/components/admin/AdminLogout'
import AssignPackageForm from '@/components/admin/AssignPackageForm'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function fmtDate(str: string) {
  const d = new Date(str + 'T12:00:00')
  return `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`
}

export default async function PaquetesPage() {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const { data: { users } } = await adminDb.auth.admin.listUsers({ perPage: 200 })

  const { data: packagesRaw } = await adminDb
    .from('user_packages')
    .select('*')
    .order('created_at', { ascending: false })

  const packages = packagesRaw ?? []

  // Enriquecer con info de usuario
  const userMap: Record<string, { name: string; email: string }> = {}
  for (const u of users) {
    userMap[u.id] = {
      name: u.user_metadata?.full_name ?? '—',
      email: u.email ?? u.id,
    }
  }

  const userList = users.map(u => ({
    id: u.id,
    name: u.user_metadata?.full_name ?? '',
    email: u.email ?? '',
  }))

  const activos = packages.filter((p: any) => p.status === 'active')
  const inactivos = packages.filter((p: any) => p.status !== 'active')

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Panel de administración</p>
          <h1 className="text-3xl font-light text-stone-800">iiknala Admin</h1>
        </div>
        <AdminLogout />
      </div>

      <AdminNav active="paquetes" />

      <AssignPackageForm users={userList} />

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Activos</p>
          <p className="text-3xl font-light text-stone-800">{activos.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Agotados / Expirados</p>
          <p className="text-3xl font-light text-stone-800">{inactivos.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Total histórico</p>
          <p className="text-3xl font-light text-stone-800">{packages.length}</p>
        </div>
      </div>

      {/* Paquetes activos */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-stone-700 mb-4">Paquetes activos ({activos.length})</h2>
        {activos.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin paquetes activos.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
              <span className="col-span-1">Usuario</span>
              <span>Paquete</span>
              <span className="text-center">Clases</span>
              <span className="text-right">Vence</span>
            </div>
            {activos.map((p: any) => {
              const u = userMap[p.user_id]
              const usedPct = p.classes_total ? Math.min(Math.round((p.classes_used / p.classes_total) * 100), 100) : null
              return (
                <div key={p.id} className="grid grid-cols-4 px-6 py-4 border-b border-stone-100 last:border-0 text-sm items-center">
                  <div>
                    <p className="text-stone-800 font-medium text-sm">{u?.name ?? '—'}</p>
                    <p className="text-stone-400 text-xs">{u?.email}</p>
                  </div>
                  <div>
                    <p className="text-stone-700 text-sm">{p.package_name}</p>
                    <span className="text-xs text-stone-400">{p.stripe_session_id ? 'Stripe' : 'Manual'}</span>
                  </div>
                  <div className="text-center">
                    {p.classes_total === null ? (
                      <span className="text-xs text-stone-400">Ilimitado</span>
                    ) : (
                      <div>
                        <p className="text-stone-800 font-medium text-sm">{p.classes_used}/{p.classes_total}</p>
                        <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${(usedPct ?? 0) >= 90 ? 'bg-red-400' : (usedPct ?? 0) >= 60 ? 'bg-amber-400' : 'bg-[#4a6741]'}`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-stone-400 text-xs text-right">
                    {p.expires_at ? fmtDate(p.expires_at) : '—'}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Histórico */}
      {inactivos.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-stone-700 mb-4">Agotados / Expirados ({inactivos.length})</h2>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden opacity-70">
            {inactivos.map((p: any) => {
              const u = userMap[p.user_id]
              return (
                <div key={p.id} className="grid grid-cols-3 px-6 py-3 border-b border-stone-100 last:border-0 text-sm">
                  <p className="text-stone-600">{u?.name ?? '—'}</p>
                  <p className="text-stone-500">{p.package_name}</p>
                  <p className="text-stone-400 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'exhausted' ? 'bg-stone-100 text-stone-500' : 'bg-red-50 text-red-400'}`}>
                      {p.status === 'exhausted' ? 'Agotado' : 'Expirado'}
                    </span>
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
