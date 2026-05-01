import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import BookButton from '@/components/clases/BookButton'
import type { YogaClass } from '@/types'

export const revalidate = 60

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function groupByDate(classes: YogaClass[]) {
  const map: Record<string, YogaClass[]> = {}
  for (const cls of classes) {
    if (!map[cls.date]) map[cls.date] = []
    map[cls.date].push(cls)
  }
  return map
}

export default async function ClasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: classes } = await supabase
    .from('yoga_classes')
    .select('*')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  const today = new Date().toISOString().split('T')[0]

  const [{ data: myBookings }, { data: myPackage }] = await Promise.all([
    user
      ? supabase.from('bookings').select('class_id').eq('user_id', user.id).eq('status', 'confirmed')
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from('user_packages').select('*').eq('user_id', user.id).eq('status', 'active')
          .or(`expires_at.is.null,expires_at.gte.${today}`).limit(1).single()
      : Promise.resolve({ data: null }),
  ])

  const bookedIds = new Set((myBookings ?? []).map(b => b.class_id))
  const hasPackage = !!myPackage
  const waiverAccepted = user?.user_metadata?.waiver_accepted === true
  const grouped = groupByDate((classes ?? []) as YogaClass[])

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Próximas clases</p>
          <h1 className="text-4xl font-light text-stone-800">Reserva tu lugar</h1>
        </div>
        <Link
          href="/paquetes"
          className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm"
        >
          Ver paquetes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-24 text-stone-400">No hay clases programadas por el momento.</div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(grouped).map(([date, dayClasses]) => {
            const d = new Date(date + 'T12:00:00')
            const label = `${diasSemana[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`
            return (
              <div key={date}>
                <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-widest mb-4 pb-2 border-b border-stone-200">
                  {label}
                </h2>
                <div className="flex flex-col gap-3">
                  {dayClasses.map(cls => {
                    const spotsLeft = cls.capacity - cls.enrolled
                    const isFull = spotsLeft <= 0
                    return (
                      <div key={cls.id} className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="text-center min-w-[50px]">
                            <p className="text-2xl font-light text-[#4a6741]">{cls.time.slice(0,5)}</p>
                            <p className="text-xs text-stone-400">{parseInt(cls.time) < 12 ? 'AM' : 'PM'}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800">{cls.title}</p>
                            <p className="text-sm text-stone-400 mt-0.5">{cls.instructor} · {cls.duration_minutes} min</p>
                            <p className="text-xs mt-1 text-stone-400">
                              {isFull
                                ? <span className="text-red-500 font-medium">Clase completa</span>
                                : <span>{spotsLeft} lugar{spotsLeft !== 1 ? 'es' : ''} disponible{spotsLeft !== 1 ? 's' : ''}</span>
                              }
                            </p>
                          </div>
                        </div>
                        <div className="sm:min-w-[160px]">
                          <BookButton
                            classId={cls.id}
                            classTitle={cls.title}
                            classDate={cls.date}
                            classTime={cls.time}
                            instructor={cls.instructor}
                            isBooked={bookedIds.has(cls.id)}
                            isFull={isFull}
                            isLoggedIn={!!user}
                            waiverAccepted={waiverAccepted}
                            hasPackage={hasPackage}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
