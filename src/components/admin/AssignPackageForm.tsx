'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronUp } from 'lucide-react'

interface User { id: string; name: string; email: string }
interface PackageOption { id: string; nombre: string; clases: number | null; vigencia_dias: number | null }

export default function AssignPackageForm({
  users,
  packages,
}: {
  users: User[]
  packages: PackageOption[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [userId, setUserId] = useState('')
  const [selectedPkgId, setSelectedPkgId] = useState('')
  const [customNombre, setCustomNombre] = useState('')
  const [customClases, setCustomClases] = useState('')
  const [customVigenciaDias, setCustomVigenciaDias] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [search, setSearch] = useState('')

  const selectedPkg = packages.find(p => p.id === selectedPkgId)
  const isCustom = selectedPkgId === '__custom__'
  const canSubmit = !!userId && (isCustom ? !!customNombre : !!selectedPkgId)

  const filteredUsers = users
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 8)

  function reset() {
    setUserId('')
    setSelectedPkgId('')
    setCustomNombre('')
    setCustomClases('')
    setCustomVigenciaDias('')
    setSearch('')
    setPaymentMethod('efectivo')
  }

  async function handleAssign() {
    if (!canSubmit) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/paquetes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        package_id: selectedPkgId,
        custom_nombre: customNombre || undefined,
        custom_clases: customClases ? Number(customClases) : undefined,
        custom_vigencia_dias: customVigenciaDias ? Number(customVigenciaDias) : undefined,
        payment_method: paymentMethod,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return }

    setLoading(false)
    setSuccess(true)
    reset()
    setTimeout(() => setSuccess(false), 2500)
    router.refresh()
  }

  return (
    <div className="mb-8">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {open ? 'Cancelar' : 'Asignar paquete manualmente'}
      </button>

      {open && (
        <div className="mt-4 bg-white border border-stone-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-stone-700 mb-5">Asignar paquete</h3>
          <div className="grid grid-cols-2 gap-4">

            {/* Usuario */}
            <div className="col-span-2">
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Usuario</label>
              <input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setUserId('') }}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741] mb-2"
              />
              {search && !userId && (
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  {filteredUsers.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-stone-400">Sin resultados</p>
                  ) : filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => { setUserId(u.id); setSearch(u.name || u.email) }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 border-b border-stone-100 last:border-0 transition-colors"
                    >
                      <span className="font-medium text-stone-800">{u.name}</span>
                      <span className="text-stone-400 text-xs ml-2">{u.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {userId && <p className="text-xs text-[#4a6741] mt-1">✓ Usuario seleccionado</p>}
            </div>

            {/* Paquete */}
            <div className="col-span-2">
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Paquete</label>
              <select
                value={selectedPkgId}
                onChange={e => { setSelectedPkgId(e.target.value); setCustomNombre(''); setCustomClases(''); setCustomVigenciaDias('') }}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
              >
                <option value="">Selecciona un paquete...</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                    {p.clases != null ? ` · ${p.clases} clases` : ' · ilimitado'}
                    {p.vigencia_dias ? ` · ${p.vigencia_dias} días` : ''}
                  </option>
                ))}
                <option value="__custom__">Personalizado...</option>
              </select>
            </div>

            {/* Preview vigencia para paquetes del catálogo */}
            {selectedPkg && (
              <div className="col-span-2 bg-stone-50 rounded-xl px-4 py-3 text-xs text-stone-500 flex gap-6">
                <span>Clases: <strong className="text-stone-700">{selectedPkg.clases ?? 'Ilimitado'}</strong></span>
                <span>
                  Vence:{' '}
                  <strong className="text-stone-700">
                    {selectedPkg.vigencia_dias
                      ? `en ${selectedPkg.vigencia_dias} días (automático)`
                      : 'Sin vencimiento'}
                  </strong>
                </span>
              </div>
            )}

            {/* Campos extra para paquete personalizado */}
            {isCustom && (
              <>
                <div className="col-span-2">
                  <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Nombre del paquete</label>
                  <input
                    value={customNombre}
                    onChange={e => setCustomNombre(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Número de clases</label>
                  <input
                    type="number" min="1"
                    value={customClases}
                    onChange={e => setCustomClases(e.target.value)}
                    placeholder="Vacío = ilimitado"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Vigencia (días)</label>
                  <input
                    type="number" min="1"
                    value={customVigenciaDias}
                    onChange={e => setCustomVigenciaDias(e.target.value)}
                    placeholder="Vacío = sin vencimiento"
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
                  />
                </div>
              </>
            )}

            {/* Método de pago */}
            <div className={isCustom ? '' : 'col-span-2'}>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as 'efectivo' | 'transferencia')}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          {success && <p className="text-[#4a6741] text-xs mt-3">Paquete asignado correctamente ✓</p>}

          <button
            onClick={handleAssign}
            disabled={loading || !canSubmit}
            className="mt-5 px-5 py-2.5 bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? 'Asignando...' : 'Asignar paquete'}
          </button>
        </div>
      )}
    </div>
  )
}
