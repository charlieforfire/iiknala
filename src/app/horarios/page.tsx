import { horarios, type Horario } from '@/lib/horarios'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Horarios | iiknala Yoga',
  description: 'Horario semanal de clases de yoga en iiknala Mérida. Vinyasa, Rocket, Dharma, Hatha y más.',
  alternates: { canonical: 'https://www.iiknalayoga.com/horarios' },
}

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const HORAS = ['7:30 AM', '9:00 AM', '9:30 AM', '5:30 PM', '7:00 PM', '8:00 PM']
const DIAS_CORTO: Record<string, string> = {
  'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mié',
  'Jueves': 'Jue', 'Viernes': 'Vie', 'Sábado': 'Sáb',
}

const NIVEL_DOT: Record<string, string> = {
  avanzado:      'w-2.5 h-2.5 rounded-full bg-[#5c2121] flex-shrink-0',
  multinivel:    'w-2.5 h-2.5 rounded-full bg-[#b85030] flex-shrink-0',
  principiantes: 'w-2.5 h-2.5 rounded-full bg-white border border-stone-400 flex-shrink-0',
}

export default function HorariosPage() {
  const lookup: Record<string, Horario> = {}
  for (const h of horarios) {
    lookup[`${h.dia}|${h.hora}`] = h
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="mb-10">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Clases semanales</p>
        <h1 className="text-4xl font-light text-stone-800">Horarios</h1>
      </div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-stone-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="w-20 py-4 px-4" />
              {DIAS.map(d => (
                <th key={d} className="py-4 px-4 text-center text-xs font-semibold text-stone-500 uppercase tracking-widest">
                  {DIAS_CORTO[d]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORAS.map((hora, ri) => (
              <tr key={hora} className={`border-b border-stone-100 last:border-0 ${ri % 2 === 0 ? 'bg-white' : 'bg-stone-50/40'}`}>
                <td className="py-5 px-4 text-center align-top border-r border-stone-100">
                  <span className="block text-sm font-semibold text-[#4a6741]">{hora.split(' ')[0]}</span>
                  <span className="block text-xs text-stone-400 mt-0.5">{hora.split(' ')[1]}</span>
                </td>
                {DIAS.map(dia => {
                  const entry = lookup[`${dia}|${hora}`]
                  return (
                    <td key={dia} className="py-4 px-3 align-top border-r border-stone-100 last:border-0">
                      {entry && (
                        <div>
                          <p className="font-semibold text-stone-800 text-sm leading-tight">{entry.clase}</p>
                          {entry.maestro && (
                            <p className="text-xs text-stone-400 mt-1">{entry.maestro}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            {[...new Set(entry.nivel)].map((n, i) => (
                              <span key={i} className={NIVEL_DOT[n]} title={n} />
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {HORAS.map(hora => {
          const clasesDeEstaHora = DIAS
            .map(dia => ({ dia, entry: lookup[`${dia}|${hora}`] }))
            .filter(x => x.entry)
          if (clasesDeEstaHora.length === 0) return null
          return (
            <div key={hora}>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2 mt-4">{hora}</p>
              <div className="flex flex-col gap-2">
                {clasesDeEstaHora.map(({ dia, entry }) => (
                  <div key={dia} className="bg-white border border-stone-200 rounded-xl p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-800 text-sm">{entry!.clase}</p>
                      {entry!.maestro && <p className="text-xs text-stone-400 mt-0.5">{entry!.maestro}</p>}
                      <div className="flex items-center gap-1 mt-2">
                        {[...new Set(entry!.nivel)].map((n, i) => (
                          <span key={i} className={NIVEL_DOT[n]} title={n} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-[#4a6741] bg-[#eef2ec] px-2.5 py-1 rounded-lg flex-shrink-0">{dia}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-8 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5c2121] flex-shrink-0" />
          <span className="text-sm text-stone-600">Avanzado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#b85030] flex-shrink-0" />
          <span className="text-sm text-stone-600">Multinivel</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white border border-stone-400 flex-shrink-0" />
          <span className="text-sm text-stone-600">Principiantes</span>
        </div>
      </div>

      <div className="mt-10">
        <Link
          href="/clases"
          className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-6 py-3 rounded-xl font-medium transition-colors text-sm"
        >
          Reservar una clase <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
