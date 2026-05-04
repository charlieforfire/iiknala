import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthed } from '@/lib/admin-auth'
import AdminNav from '@/components/admin/AdminNav'
import AdminLogout from '@/components/admin/AdminLogout'
import ConfirmCashButton from '@/components/admin/ConfirmCashButton'
import EditUserForm from '@/components/admin/EditUserForm'
import DeleteUserButton from '@/components/admin/DeleteUserButton'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const mesesLargo = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function fmtDate(str: string) {
  const d = new Date(str + 'T12:00:00')
  return `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`
}

function fmtBirthday(str: string) {
  const d = new Date(str + 'T12:00:00')
  return `${d.getDate()} de ${mesesLargo[d.getMonth()]}`
}

export default async function UsuarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!await isAdminAuthed()) redirect('/admin/login')

  const { id } = await params
  const supabase = await createClient()

  const [{ data: { user } }, bookingsRes, packagesRes, purchasesRes] = await Promise.all([
    adminDb.auth.admin.getUserById(id),
    supabase.from('bookings').select('*, yoga_class:yoga_classes(title, date, time)').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('user_packages').select('*').eq('user_id', id).order('created_at', { ascending: false }),
    supabase.from('purchases').select('*').eq('user_id', id).order('created_at', { ascending: false }),
  ])

  if (!user) redirect('/admin/usuarios')

  const name = user.user_metadata?.full_name ?? '—'
  const birthday = user.user_metadata?.birthday as string | undefined
  const notes = user.user_metadata?.notes as string | undefined
  const gender = user.user_metadata?.gender as string | undefined
  const phone = user.user_metadata?.phone as string | undefined
  const bookings = bookingsRes.data ?? []
  const packages = packagesRes.data ?? []
  const purchases = purchasesRes.data ?? []

  const activePackage = packages.find((p: any) => p.status === 'active')

  const statusLabel: Record<string, string> = {
    confirmed: 'Pagado',
    pending_cash: 'Pago en estudio',
    cancelled: 'Cancelada',
    completed: 'Completado',
    pending: 'Pendiente',
  }
  const statusColor: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-emerald-700',
    pending_cash: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-stone-100 text-stone-500',
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-yellow-100 text-yellow-700',
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

      <AdminNav active="usuarios" />

      <div className="flex items-center justify-between mb-6 mt-2">
        <Link href="/admin/usuarios" className="text-sm text-stone-400 hover:text-stone-700 inline-flex items-center gap-1">
          ← Todos los usuarios
        </Link>
        <DeleteUserButton userId={id} userName={name} />
      </div>

      {/* Perfil */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6 mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xl font-medium text-stone-800">{name}</p>
            <p className="text-stone-500 text-sm mt-0.5">{user.email}</p>
            <p className="text-stone-400 text-xs mt-1">
              Registrado el {new Date(user.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            {birthday && (
              <p className="text-stone-400 text-xs mt-1">🎂 Cumpleaños: {fmtBirthday(birthday)}</p>
            )}
            {phone && (
              <p className="text-stone-400 text-xs mt-0.5">📱 {phone}</p>
            )}
            {gender && (
              <p className="text-stone-400 text-xs mt-0.5 capitalize">{gender.replace('-', ' ')}</p>
            )}
          </div>
          {activePackage && (
            <div className="bg-[#eef2ec] rounded-xl px-4 py-3 min-w-[160px]">
              <p className="text-xs text-[#4a6741] font-medium mb-1">{activePackage.package_name}</p>
              {activePackage.classes_total === null ? (
                <p className="text-xs text-stone-500">Ilimitado</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-stone-800">
                    {activePackage.classes_used} <span className="text-stone-400 font-normal text-xs">de {activePackage.classes_total} clases</span>
                  </p>
                  <div className="w-full bg-white/60 rounded-full h-1.5 mt-1.5">
                    <div
                      className="bg-[#4a6741] h-1.5 rounded-full"
                      style={{ width: `${Math.min(Math.round((activePackage.classes_used / activePackage.classes_total) * 100), 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {notes && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <p className="text-xs text-amber-700 font-medium mb-1 uppercase tracking-wide">Notas</p>
            <p className="text-sm text-stone-700 whitespace-pre-line">{notes}</p>
          </div>
        )}
      </div>

      {/* Editar cumpleaños + notas */}
      <EditUserForm
        userId={id}
        initialBirthday={birthday}
        initialNotes={notes}
      />

      {/* Paquetes */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Paquetes de clases</h2>
        {packages.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin paquetes.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {packages.map((p: any) => {
              const usedPct = p.classes_total ? Math.min(Math.round((p.classes_used / p.classes_total) * 100), 100) : null
              return (
                <div key={p.id} className="bg-white border border-stone-200 rounded-xl px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-stone-800 text-sm">{p.package_name}</p>
                      {p.classes_total !== null ? (
                        <>
                          <p className="text-xs text-stone-400 mt-0.5">{p.classes_used} de {p.classes_total} clases usadas</p>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 mt-2">
                            <div
                              className={`h-1.5 rounded-full ${(usedPct ?? 0) >= 90 ? 'bg-red-400' : (usedPct ?? 0) >= 60 ? 'bg-amber-400' : 'bg-[#4a6741]'}`}
                              style={{ width: `${usedPct}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-stone-400 mt-0.5">Ilimitado</p>
                      )}
                      <p className="text-xs text-stone-400 mt-1.5">
                        {new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {p.expires_at && ` · Vence ${fmtDate(p.expires_at)}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        {p.stripe_session_id ? 'Stripe' : 'Efectivo'}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === 'active' ? 'bg-[#eef2ec] text-[#4a6741]' : 'bg-stone-100 text-stone-500'}`}>
                        {p.status === 'active' ? 'Activo' : p.status === 'exhausted' ? 'Agotado' : 'Expirado'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Reservas */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Historial de reservas</h2>
        {bookings.length === 0 ? (
          <p className="text-stone-400 text-sm">Sin reservas.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b: any) => {
              const d = b.yoga_class ? new Date(b.yoga_class.date + 'T12:00:00') : null
              const label = d ? `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}` : '—'
              return (
                <div key={b.id} className="bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-stone-800 text-sm">{b.yoga_class?.title ?? '—'}</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {label}{b.yoga_class?.time && ` · ${b.yoga_class.time.slice(0,5)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {b.status === 'confirmed' && (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        b.stripe_payment_intent?.startsWith('pi_') ? 'bg-purple-100 text-purple-700' :
                        b.stripe_payment_intent === 'transferencia' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {b.stripe_payment_intent?.startsWith('pi_') ? 'Stripe' :
                         b.stripe_payment_intent === 'transferencia' ? 'Transferencia' : 'Efectivo'}
                      </span>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[b.status] ?? 'bg-stone-100 text-stone-500'}`}>
                      {statusLabel[b.status] ?? b.status}
                    </span>
                    {b.status === 'pending_cash' && <ConfirmCashButton bookingId={b.id} />}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Formaciones */}
      {purchases.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-stone-700 mb-4">Formaciones</h2>
          <div className="flex flex-col gap-3">
            {purchases.map((p: any) => (
              <div key={p.id} className="bg-white border border-stone-200 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800 text-sm">YTT 200H Vinyasa Progresivo</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(p.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[p.status] ?? 'bg-stone-100 text-stone-500'}`}>
                  {statusLabel[p.status] ?? p.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
