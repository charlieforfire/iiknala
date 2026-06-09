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
  const [customName, setCustomName] = useState('')
  const [classesTotal, setClassesTotal] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [search, setSearch] = useState('')

  const selectedPkg = packages.find(p => p.id === selectedPkgId)
  const isCustom = selectedPkgId === '__custom__'
  const finalName = isCustom ? customName : (selectedPkg?.nombre ?? '')
  const finalClasses = isCustom
    ? (classesTotal || null)
    : (selectedPkg ? (selectedPkg.clases !== null ? String(selectedPkg.clases) : '') : classesTotal)

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8)

  async function handleAssign() {
    if (!userId || !finalName) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/paquetes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        package_name: finalName,
        classes_total: finalClasses ? Number(finalClasses) : null,
        expires_at: expiresAt || null,
        payment_method: paymentMethod,
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return }
    setLoading(false)
    setSuccess(true)
    setUserId(''); setSelectedPkgId(''); setCustomName(''); setClassesTotal(''); setExpiresAt(''); setSearch(''); setPaymentMethod('efectivo')
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
            {/* Buscar usuario */}
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
                onChange={e => { setSelectedPkgId(e.target.value); setClassesTotal('') }}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
              >
                <option value="">Selecciona un paquete...</option>
                {packages.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}{p.clases ? ` (${p.clases} clases)` : p.clases === null ? ' (ilimitado)' : ''}
                  </option>
                ))}
                <option value="__custom__">Personalizado...</option>
              </select>
            </div>

            {isCustom && (
              <div className="col-span-2">
                <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Nombre del paquete</label>
                <input
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
                />
              </div>
            )}

            {(isCustom || (selectedPkg && selectedPkg.clases !== null)) && (
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Número de clases</label>
                <input
                  type="number"
                  min="1"
                  value={isCustom ? classesTotal : (selectedPkg?.clases ?? '')}
                  onChange={e => setClassesTotal(e.target.value)}
                  placeholder="Vacío = ilimitado"
                  readOnly={!isCustom && !!selectedPkg?.clases}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
                />
              </div>
            )}

            <div>
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

            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Fecha de vencimiento (opcional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          {success && <p className="text-[#4a6741] text-xs mt-3">Paquete asignado correctamente ✓</p>}

          <button
            onClick={handleAssign}
            disabled={loading || !userId || !finalName}
            className="mt-5 px-5 py-2.5 bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? 'Asignando...' : 'Asignar paquete'}
          </button>
        </div>
      )}
    </div>
  )
}
