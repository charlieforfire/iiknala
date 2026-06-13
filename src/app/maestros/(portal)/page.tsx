import { redirect } from 'next/navigation'
import { isTeacherAuthed } from '@/lib/teacher-auth'
import { createClient as createAdmin } from '@supabase/supabase-js'
import Link from 'next/link'
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function MaestrosPage() {
  if (!await isTeacherAuthed()) redirect('/maestros/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: classes } = await adminDb
    .from('yoga_classes')
    .select('id, title, date, time, instructor, enrolled, capacity')
    .gte('date', today)
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-light text-stone-800 mb-6">Clases próximas</h1>

      {!classes?.length ? (
        <div className="text-center py-16">
          <p className="text-stone-400 text-lg">No hay clases próximas registradas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {classes.map(cls => {
            const dateLabel = new Date(cls.date + 'T00:00:00Z').toLocaleDateString('es-MX', {
              weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
            })
            return (
              <Link
                key={cls.id}
                href={`/maestros/clases/${cls.id}`}
                className="bg-white rounded-2xl border border-stone-200 px-6 py-5 flex items-center justify-between hover:border-[#4a6741]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="font-medium text-stone-800 group-hover:text-[#4a6741] transition-colors">{cls.title}</span>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                    <span className="flex items-center gap-1.5 capitalize">
                      <Calendar className="w-3.5 h-3.5" />{dateLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />{cls.time.slice(0, 5)}
                    </span>
                    <span className="text-stone-400">{cls.instructor}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 text-sm text-stone-500">
                    <Users className="w-4 h-4" />
                    <span>{cls.enrolled} / {cls.capacity}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#4a6741] transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
