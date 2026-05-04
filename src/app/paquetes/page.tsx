import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
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

const paquetesRegular = [
  { id: 'primera-clase', nombre: 'Primera Clase', clases: 1, vigencia: null, precio: 200, destacado: false, extras: [] },
  { id: 'clase-suelta', nombre: 'Clase Suelta', clases: 1, vigencia: null, precio: 250, destacado: false, extras: [] },
  { id: 'pack-4', nombre: '4 Clases', clases: 4, vigencia: 30, precio: 900, destacado: false, extras: [] },
  { id: 'pack-8', nombre: '8 Clases', clases: 8, vigencia: 30, precio: 1500, destacado: false, extras: ['+1 invitado'] },
  { id: 'pack-12', nombre: '12 Clases', clases: 12, vigencia: 30, precio: 1800, destacado: true, extras: ['+1 clase extra o invitado'] },
  { id: 'pack-16', nombre: '16 Clases', clases: 16, vigencia: 30, precio: 2050, destacado: false, extras: ['+2 invitados'] },
  { id: 'ilimitado', nombre: 'Ilimitado', clases: null, vigencia: 30, precio: 2400, destacado: false, extras: ['+2 invitados'] },
]

const paquetesIlimitado = [
  { id: 'ilimitado-3m', nombre: 'Ilimitado 3 meses', vigencia: 90, precio: 7200 },
  { id: 'ilimitado-6m', nombre: 'Ilimitado 6 meses', vigencia: 180, precio: 14400 },
  { id: 'ilimitado-12m', nombre: 'Ilimitado 12 meses', vigencia: 365, precio: 28800 },
]

const paquetesRocket = [
  { id: 'rocket-suelta', nombre: 'Clase Suelta Rocket', clases: 1, vigencia: null, precio: 300, extras: [] },
  { id: 'rocket-pack', nombre: 'Paquete Rocket', clases: 4, vigencia: 30, precio: 1000, extras: [] },
]

export default async function PaquetesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-4">Mayo 2026</p>
        <h1 className="text-4xl font-light text-stone-800 mb-4">Paquetes iiknala</h1>
        <p className="text-stone-500 max-w-lg mx-auto">
          Todos los paquetes incluyen clases presenciales y vía Zoom.
        </p>
      </div>

      {/* Clases sueltas destacadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {paquetesRegular.slice(0, 2).map(p => (
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

      {/* Paquetes regulares */}
      <h2 className="text-xl font-light text-stone-700 mb-6 uppercase tracking-widest text-sm">Paquetes regulares</h2>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-12">
        <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
          <span>Clases</span>
          <span>Vigencia</span>
          <span>Valor</span>
          <span></span>
        </div>
        {paquetesRegular.slice(2).map((p) => (
          <div
            key={p.id}
            className={`grid grid-cols-4 items-center px-6 py-4 border-b border-stone-100 last:border-0 ${p.destacado ? 'bg-[#eef2ec]' : ''}`}
          >
            <div>
              <p className="font-medium text-stone-800">
                {p.clases ?? 'Ilimitado'}
                {p.destacado && <span className="ml-2 text-xs bg-[#4a6741] text-white px-2 py-0.5 rounded-full">Popular</span>}
              </p>
              {p.extras.length > 0 && (
                <p className="text-xs text-[#4a6741] flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> {p.extras[0]}
                </p>
              )}
            </div>
            <p className="text-stone-500 text-sm">{p.vigencia} días</p>
            <p className="text-lg font-light text-stone-800">{formatPrice(p.precio)}</p>
            <div className="flex justify-end">
              <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
            </div>
          </div>
        ))}
      </div>

      {/* Ilimitado multi-mes */}
      <h2 className="text-xl font-light text-stone-700 mb-6 uppercase tracking-widest text-sm">Ilimitado multi-mes</h2>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-12">
        <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
          <span>Plan</span>
          <span>Vigencia</span>
          <span>Valor</span>
          <span></span>
        </div>
        {paquetesIlimitado.map(p => (
          <div key={p.id} className="grid grid-cols-4 items-center px-6 py-4 border-b border-stone-100 last:border-0">
            <p className="font-medium text-stone-800">{p.nombre}</p>
            <p className="text-stone-500 text-sm">{p.vigencia} días</p>
            <p className="text-lg font-light text-stone-800">{formatPrice(p.precio)}</p>
            <div className="flex justify-end">
              <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
            </div>
          </div>
        ))}
      </div>

      {/* Rocket */}
      <h2 className="text-xl font-light text-stone-700 mb-2 uppercase tracking-widest text-sm">Rocket</h2>
      <p className="text-xs text-stone-400 mb-6">Paquetes de 1 y 2 clases por semana requieren una aportación de $50 por la práctica suelta de rocket.</p>
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-12">
        <div className="grid grid-cols-4 bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide">
          <span>Tipo</span>
          <span>Vigencia</span>
          <span>Valor</span>
          <span></span>
        </div>
        {paquetesRocket.map(p => (
          <div key={p.id} className="grid grid-cols-4 items-center px-6 py-4 border-b border-stone-100 last:border-0">
            <p className="font-medium text-stone-800">{p.nombre}</p>
            <p className="text-stone-500 text-sm">{p.vigencia ? `${p.vigencia} días` : 'Sin vigencia'}</p>
            <p className="text-lg font-light text-stone-800">{formatPrice(p.precio)}</p>
            <div className="flex justify-end">
              <PaqueteButton paqueteId={p.id} precio={p.precio} nombre={p.nombre} isLoggedIn={!!user} small />
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-stone-400">
        * Todos los paquetes incluyen clases presenciales y vía Zoom · Precios en MXN
      </p>
    </div>
  )
}
