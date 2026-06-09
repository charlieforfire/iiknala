import { createClient } from '@/lib/supabase/server'
import { formatPrice, isSummerPromo } from '@/lib/utils'
import { Check } from 'lucide-react'
import PaqueteButton from '@/components/paquetes/PaqueteButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Precios y Paquetes de Yoga',
  description: 'Paquetes de clases de yoga desde $200 MXN en Mérida, Yucatán. Clases sueltas, packs mensuales e ilimitados. Incluye clases presenciales y online.',
  alternates: { canonical: 'https://www.iiknalayoga.com/paquetes' },
  openGraph: {
    title: 'Precios y Paquetes de Yoga | iiknala Mérida',
    description: 'Desde clase suelta hasta ilimitado. Presencial y online. Precios en MXN.',
    url: 'https://www.iiknalayoga.com/paquetes',
  },
}

type Package = {
  id: string
  nombre: string
  precio: number
  vigencia_dias: number | null
  clases: number | null
  destacado: boolean
  extras: string[]
  tipo: string
  nota: string | null
}

export default async function PaquetesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const showSummer = isSummerPromo()

  const { data: allPackages = [] } = await supabase
    .from('packages')
    .select('id, nombre, precio, vigencia_dias, clases, destacado, extras, tipo, nota')
    .eq('activo', true)
    .order('sort_order')

  const regular = (allPackages as Package[]).filter(p => p.tipo === 'regular')
  const ilimitadoMultimes = (allPackages as Package[]).filter(p => p.tipo === 'ilimitado-multimes')
  const rocket = (allPackages as Package[]).filter(p => p.tipo === 'rocket')
  const summer = (allPackages as Package[]).filter(p => p.tipo === 'summer')

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-light text-stone-800 mb-4">Paquetes iiknala</h1>
        <p className="text-stone-500 max-w-lg mx-auto">
          Clases presenciales en Mérida. Los paquetes ilimitados incluyen acceso vía Zoom.
        </p>
      </div>

      {/* Summer Promo */}
      {showSummer && summer.length > 0 && (
        <section id="summer-promo" className="mb-16 scroll-mt-28">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🌞</span>
            <div>
              <h2 className="text-xl font-semibold text-stone-800">Summer Promo</h2>
              <p className="text-xs text-stone-400">Válido del 1 jun al 31 ago 2026</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summer.map(p => (
              <div key={p.id} className="bg-[#eef2ec] border border-[#c5d4c0] rounded-2xl p-6 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-stone-800">{p.nombre}</p>
                  <p className="text-xl font-light text-stone-800 whitespace-nowrap">{formatPrice(p.precio)}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4a6741] font-medium">
                    {p.vigencia_dias ? `${p.vigencia_dias} días` : 'Sin vencimiento'}
                  </p>
                  {p.nota && <p className="text-xs text-stone-500 mt-0.5">{p.nota}</p>}
                </div>
                <div className="mt-auto pt-1">
                  <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clases sueltas (first 2 regular packages) */}
      {regular.slice(0, 2).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          {regular.slice(0, 2).map(p => (
            <div key={p.id} className="bg-white border border-stone-200 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-stone-800">{p.nombre}</p>
                <p className="text-sm text-stone-400">Sin vigencia</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-light text-stone-800">{formatPrice(p.precio)}</p>
                <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paquetes regulares */}
      {regular.slice(2).length > 0 && (
        <>
          <h2 className="text-xl font-light text-stone-700 mb-6 uppercase tracking-widest text-sm">Paquetes regulares</h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-12">
            <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
              <span>Clases</span>
              <span>Vigencia</span>
              <span>Valor</span>
              <span></span>
            </div>
            {regular.slice(2).map(p => (
              <div
                key={p.id}
                className={`grid grid-cols-4 items-center px-6 py-4 border-b border-stone-100 last:border-0 ${p.destacado ? 'bg-[#eef2ec]' : ''}`}
              >
                <div>
                  <p className="font-medium text-stone-800">
                    {p.clases ?? 'Ilimitado'}
                    {p.destacado && <span className="ml-2 text-xs bg-[#4a6741] text-white px-2 py-0.5 rounded-full">Popular</span>}
                  </p>
                  {p.extras?.length > 0 && (
                    <p className="text-xs text-[#4a6741] flex items-center gap-1 mt-0.5">
                      <Check className="w-3 h-3" /> {p.extras[0]}
                    </p>
                  )}
                </div>
                <p className="text-stone-500 text-sm">{p.vigencia_dias ? `${p.vigencia_dias} días` : 'Sin vigencia'}</p>
                <p className="text-lg font-light text-stone-800">{formatPrice(p.precio)}</p>
                <div className="flex justify-end">
                  <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Ilimitado multi-mes */}
      {ilimitadoMultimes.length > 0 && (
        <>
          <h2 className="text-xl font-light text-stone-700 mb-6 uppercase tracking-widest text-sm">Ilimitado multi-mes</h2>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-12">
            <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
              <span>Plan</span>
              <span>Vigencia</span>
              <span>Valor</span>
              <span></span>
            </div>
            {ilimitadoMultimes.map(p => (
              <div key={p.id} className="grid grid-cols-4 items-center px-6 py-4 border-b border-stone-100 last:border-0">
                <p className="font-medium text-stone-800">{p.nombre}</p>
                <p className="text-stone-500 text-sm">{p.vigencia_dias} días</p>
                <p className="text-lg font-light text-stone-800">{formatPrice(p.precio)}</p>
                <div className="flex justify-end">
                  <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Rocket */}
      {rocket.length > 0 && (
        <>
          <h2 className="text-xl font-light text-stone-700 mb-2 uppercase tracking-widest text-sm">Rocket</h2>
          <p className="text-xs text-stone-400 mb-6">Paquetes de 1 y 2 clases por semana requieren una aportación de $50 por la práctica suelta de rocket.</p>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-12">
            <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
              <span>Tipo</span>
              <span>Vigencia</span>
              <span>Valor</span>
              <span></span>
            </div>
            {rocket.map(p => (
              <div key={p.id} className="grid grid-cols-4 items-center px-6 py-4 border-b border-stone-100 last:border-0">
                <p className="font-medium text-stone-800">{p.nombre}</p>
                <p className="text-stone-500 text-sm">{p.vigencia_dias ? `${p.vigencia_dias} días` : 'Sin vigencia'}</p>
                <p className="text-lg font-light text-stone-800">{formatPrice(p.precio)}</p>
                <div className="flex justify-end">
                  <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="text-center space-y-1">
        <p className="text-xs text-stone-400">Precios en MXN · Paquetes ilimitados incluyen acceso vía Zoom</p>
        <p className="text-xs text-stone-500">Paga con transferencia o efectivo y recibe un 3% de descuento</p>
      </div>
    </div>
  )
}
