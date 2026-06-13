import { redirect, notFound } from 'next/navigation'
import { isTeacherAuthed } from '@/lib/teacher-auth'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Users } from 'lucide-react'
import AsignarPaqueteModal from '@/components/maestros/AsignarPaqueteModal'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function ClaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await isTeacherAuthed()) redirect('/maestros/login')

  const { data: cls } = await adminDb
    .from('yoga_classes')
    .select('id, title, date, time, instructor, capacity, enrolled')
    .eq('id', id)
    .single()

  if (!cls) notFound()

  const { data: bookings } = await adminDb
    .from('bookings')
    .select('id, user_id, status, guest')
    .eq('class_id', id)
    .eq('status', 'confirmed')

  const studentIds = [...new Set((bookings ?? []).map(b => b.user_id))]

  // Get user info — single listUsers call to avoid N+1 Auth Admin requests
  const userDetails: Record<string, { full_name: string; email: string }> = {}
  if (studentIds.length) {
    const { data: { users: allUsers } } = await adminDb.auth.admin.listUsers({ perPage: 1000 })
    for (const u of allUsers ?? []) {
      if (studentIds.includes(u.id)) {
        userDetails[u.id] = {
          full_name: u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? u.id,
          email: u.email ?? '',
        }
      }
    }
  }

  // Get active packages
  const today = new Date().toISOString().split('T')[0]
  const { data: userPackages } = studentIds.length
    ? await adminDb
        .from('user_packages')
        .select('user_id, package_name, classes_total, classes_used')
        .in('user_id', studentIds)
        .eq('status', 'active')
        .or(`expires_at.is.null,expires_at.gte.${today}`)
    : { data: [] }

  const packagesByUser: Record<string, { package_name: string; classes_total: number | null; classes_used: number }> = {}
  for (const pkg of userPackages ?? []) {
    if (!packagesByUser[pkg.user_id]) packagesByUser[pkg.user_id] = pkg
  }

  // Packages catalog for assignment modal
  const { data: catalogPackages } = await adminDb
    .from('packages')
    .select('id, nombre, clases, vigencia_dias')
    .eq('activo', true)
    .order('sort_order')

  const dateLabel = new Date(cls.date + 'T00:00:00Z').toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href="/maestros" className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Todas las clases
      </Link>

      <div className="bg-white rounded-2xl border border-stone-200 px-6 py-5 mb-8">
        <h1 className="text-xl font-medium text-stone-800 mb-2">{cls.title}</h1>
        <div className="flex flex-wrap items-center gap-5 text-sm text-stone-500">
          <span className="flex items-center gap-1.5 capitalize">
            <Calendar className="w-3.5 h-3.5" />{dateLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />{cls.time.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />{cls.enrolled} / {cls.capacity}
          </span>
          <span className="text-stone-400">{cls.instructor}</span>
        </div>
      </div>

      <h2 className="text-lg font-medium text-stone-700 mb-4">
        Alumnos registrados <span className="text-stone-400 font-normal text-base">({bookings?.length ?? 0})</span>
      </h2>

      {!bookings?.length ? (
        <div className="text-center py-12 text-stone-400">
          <p>No hay alumnos registrados en esta clase.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map(booking => {
            const info = userDetails[booking.user_id]
            const pkg = packagesByUser[booking.user_id]
            const remaining = pkg
              ? pkg.classes_total === null ? '∞' : pkg.classes_total - pkg.classes_used
              : null

            return (
              <div key={booking.id} className="bg-white rounded-2xl border border-stone-200 px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium text-stone-800 truncate">{info?.full_name ?? 'Alumno'}</span>
                  <span className="text-sm text-stone-500 truncate">{info?.email}</span>
                  {pkg ? (
                    <span className="text-xs text-[#4a6741] mt-1">
                      {pkg.package_name} · {remaining} clases restantes
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600 mt-1">Sin paquete activo</span>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <AsignarPaqueteModal
                    userId={booking.user_id}
                    userName={info?.full_name ?? 'Alumno'}
                    packages={catalogPackages ?? []}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
