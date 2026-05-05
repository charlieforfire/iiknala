import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { formatDate, formatTime } from '@/lib/utils'
import { Video, MapPin, Calendar, BookOpen, ExternalLink, Package, Gift } from 'lucide-react'
import CancelButton from '@/components/dashboard/CancelButton'
import CopyCodeButton from '@/components/dashboard/CopyCodeButton'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]

  const [{ data: bookings }, { data: purchases }, { data: activePackage }, { data: inviteCodes }, { data: guestCredits }] = await Promise.all([
    supabase.from('bookings').select('*, yoga_class:yoga_classes(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('purchases').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('user_packages').select('*').eq('user_id', user.id).eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gte.${today}`).order('created_at', { ascending: true }).limit(1).single(),
    supabase.from('invite_codes').select('*').eq('owner_user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('guest_class_credits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const name = user.user_metadata?.full_name ?? user.email

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-light text-stone-800">Hola, {name?.split(' ')[0]} 👋</h1>
        <p className="text-stone-500 mt-1">{user.email}</p>
      </div>

      {/* Paquete activo */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-[#4a6741]" />
          <h2 className="text-xl font-medium text-stone-800">Mi paquete</h2>
        </div>
        {activePackage ? (
          <div className="bg-[#eef2ec] border border-[#4a6741]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-stone-800 text-lg">{activePackage.package_name}</p>
              <p className="text-sm text-stone-500 mt-1">
                {activePackage.classes_total === null
                  ? 'Clases ilimitadas'
                  : `${activePackage.classes_total - activePackage.classes_used} de ${activePackage.classes_total} clases restantes`
                }
                {activePackage.expires_at && ` · Vence el ${formatDate(activePackage.expires_at)}`}
              </p>
            </div>
            {activePackage.classes_total !== null && (
              <div className="w-full sm:w-48">
                <div className="flex justify-between text-xs text-stone-500 mb-1">
                  <span>Usadas</span>
                  <span>{activePackage.classes_used}/{activePackage.classes_total}</span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div
                    className="bg-[#4a6741] h-2 rounded-full"
                    style={{ width: `${(activePackage.classes_used / activePackage.classes_total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-stone-50 rounded-2xl border border-stone-200 border-dashed p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-400">No tienes un paquete activo.</p>
            <Link href="/paquetes" className="bg-[#4a6741] hover:bg-[#3a5232] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Ver paquetes
            </Link>
          </div>
        )}
      </section>

      {/* Mis reservas */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-[#4a6741]" />
          <h2 className="text-xl font-medium text-stone-800">Mis reservas</h2>
        </div>

        {!bookings || bookings.length === 0 ? (
          <EmptyState text="No tienes clases reservadas aún." />
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((booking: any) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${booking.yoga_class?.is_online ? 'bg-blue-50' : 'bg-[#eef2ec]'}`}>
                    {booking.yoga_class?.is_online
                      ? <Video className="w-5 h-5 text-blue-600" />
                      : <MapPin className="w-5 h-5 text-[#4a6741]" />}
                  </div>
                  <div>
                    <p className="font-medium text-stone-800">{booking.yoga_class?.title}</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {booking.yoga_class && `${formatDate(booking.yoga_class.date)} · ${formatTime(booking.yoga_class.time)}`}
                    </p>
                    {booking.yoga_class?.is_online && booking.yoga_class?.zoom_link && (
                      <a
                        href={booking.yoga_class.zoom_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
                      >
                        Unirse a Zoom <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={booking.status} />
                  {['confirmed', 'pending_cash'].includes(booking.status) && booking.yoga_class && (
                    <CancelButton
                      bookingId={booking.id}
                      classDate={booking.yoga_class.date}
                      classTime={booking.yoga_class.time}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Códigos de invitado — mis códigos para compartir */}
      {inviteCodes && inviteCodes.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-5 h-5 text-[#4a6741]" />
            <h2 className="text-xl font-medium text-stone-800">Mis códigos de invitado</h2>
          </div>
          <div className="flex flex-col gap-3">
            {(inviteCodes as any[]).map((c) => (
              <div key={c.id} className={`bg-white rounded-2xl border p-5 flex items-center justify-between gap-4 ${c.status === 'redeemed' ? 'border-stone-100 opacity-60' : 'border-stone-200'}`}>
                <div>
                  <p className="font-mono font-semibold text-stone-800 tracking-widest text-lg">{c.code}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {c.status === 'redeemed' ? 'Canjeado' : c.expires_at ? `Vence ${formatDate(c.expires_at)}` : 'Sin vencimiento'}
                  </p>
                </div>
                {c.status === 'available'
                  ? <CopyCodeButton code={c.code} />
                  : <span className="text-xs bg-stone-100 text-stone-400 px-3 py-1.5 rounded-full">Usado</span>
                }
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3">Comparte estos códigos con amigos — podrán reservar una clase gratis.</p>
        </section>
      )}

      {/* Crédito de clase recibido como invitado */}
      {guestCredits && guestCredits.some((c: any) => c.status === 'available') && (
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-medium text-stone-800">Clase de invitado</h2>
          </div>
          <div className="bg-[#eef2ec] border border-[#4a6741]/20 rounded-2xl p-6">
            <p className="font-medium text-stone-800">Tienes {(guestCredits as any[]).filter((c: any) => c.status === 'available').length} clase{(guestCredits as any[]).filter((c: any) => c.status === 'available').length > 1 ? 's' : ''} de invitado disponible{(guestCredits as any[]).filter((c: any) => c.status === 'available').length > 1 ? 's' : ''} 🎁</p>
            <p className="text-sm text-stone-500 mt-1">Ve a <Link href="/clases" className="text-[#4a6741] underline">Clases</Link> y reserva tu lugar.</p>
          </div>
        </section>
      )}

      {/* Mis compras (formaciones) */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-5 h-5 text-[#4a6741]" />
          <h2 className="text-xl font-medium text-stone-800">Mis formaciones</h2>
        </div>

        {!purchases || purchases.length === 0 ? (
          <EmptyState text="No has comprado ninguna formación todavía." />
        ) : (
          <div className="flex flex-col gap-4">
            {purchases.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800">Formación de Profesores 200H</p>
                  <p className="text-sm text-stone-500 mt-0.5">Comprado el {formatDate(p.created_at)}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: 'bg-emerald-100 text-[#4a6741]',
    completed: 'bg-emerald-100 text-[#4a6741]',
    pending_cash: 'bg-amber-100 text-amber-700',
    pending: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-stone-100 text-stone-500',
    refunded: 'bg-red-100 text-red-600',
  }
  const labels: Record<string, string> = {
    confirmed: 'Confirmada',
    completed: 'Completada',
    pending_cash: 'Pago en estudio',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
    refunded: 'Reembolsada',
  }

  return (
    <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${map[status] ?? 'bg-stone-100 text-stone-500'}`}>
      {labels[status] ?? status}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-stone-50 rounded-2xl border border-stone-200 border-dashed p-12 text-center text-stone-400">
      {text}
    </div>
  )
}
