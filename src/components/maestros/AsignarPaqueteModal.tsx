'use client'

import { useState } from 'react'
import { Package, X, Check } from 'lucide-react'

interface PkgOption {
  id: string
  nombre: string
  clases: number | null
  vigencia_dias: number | null
}

interface Props {
  userId: string
  userName: string
  packages: PkgOption[]
}

export default function AsignarPaqueteModal({ userId, userName, packages }: Props) {
  const [open, setOpen] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState(packages[0]?.id ?? '')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)

  function close() {
    setOpen(false)
    setToast(null)
  }

  async function handleAssign() {
    if (!selectedPkg) return
    setLoading(true)
    setToast(null)

    try {
      const res = await fetch('/api/maestros/paquetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, package_id: selectedPkg }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ type: 'ok', msg: 'Paquete asignado exitosamente.' })
      setTimeout(() => close(), 2000)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al asignar paquete.'
      setToast({ type: 'err', msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm border border-[#4a6741]/30 text-[#4a6741] hover:bg-[#4a6741] hover:text-white px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
      >
        <Package className="w-4 h-4" />
        Asignar paquete
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-stone-800">Asignar paquete</h3>
              <button onClick={close} className="text-stone-400 hover:text-stone-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-stone-500 mb-5">
              Alumno: <strong className="text-stone-700">{userName}</strong>
            </p>

            {packages.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-4">No hay paquetes activos en el catálogo.</p>
            ) : (
              <>
                <label className="block text-sm font-medium text-stone-700 mb-2">Paquete</label>
                <select
                  value={selectedPkg}
                  onChange={e => setSelectedPkg(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-[#4a6741] bg-white"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                      {p.clases ? ` · ${p.clases} clases` : ' · Ilimitado'}
                      {p.vigencia_dias ? ` · ${p.vigencia_dias} días` : ''}
                    </option>
                  ))}
                </select>
              </>
            )}

            {toast && (
              <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4 ${toast.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {toast.type === 'ok' && <Check className="w-4 h-4 flex-shrink-0" />}
                {toast.msg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAssign}
                disabled={loading || !selectedPkg || packages.length === 0}
                className="flex-1 bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white py-3 rounded-xl text-sm font-medium transition-colors"
              >
                {loading ? 'Asignando...' : 'Confirmar'}
              </button>
              <button
                onClick={close}
                className="px-5 py-3 border border-stone-200 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
