'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronUp } from 'lucide-react'

interface User { id: string; name: string; email: string }

const PREDEFINED = [
  { label: 'Primera clase', classes: 1 },
  { label: 'Clase suelta', classes: 1 },
  { label: 'Pack 4 clases', classes: 4 },
  { label: 'Pack 8 clases', classes: 8 },
  { label: 'Pack 12 clases', classes: 12 },
  { label: 'Pack 16 clases', classes: 16 },
  { label: 'Ilimitado mensual', classes: null },
  { label: 'Ilimitado 3 meses', classes: null },
  { label: 'Ilimitado 6 meses', classes: null },
  { label: 'Ilimitado 12 meses', classes: null },
  { label: 'Rocket suelta', classes: 1 },
  { label: 'Rocket pack 4', classes: 4 },
]

export default function AssignPackageForm({ users }: { users: User[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [userId, setUserId] = useState('')
  const [packageName, setPackageName] = useState('')
  const [customName, setCustomName] = useState('')
  const [classesTotal, setClassesTotal] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [search, setSearch] = useState('')

  const selected = PREDEFINED.find(p => p.label === packageName)
  const finalClasses = selected ? (selected.classes === null ? '' : String(selected.classes)) : classesTotal
  const finalName = packageName === '__custom__' ? customName : packageName

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
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error'); setLoading(false); return }
    setLoading(false)
    setSuccess(true)
    setUserId(''); setPackageName(''); setCustomName(''); setClassesTotal(''); setExpiresAt(''); setSearch('')
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
              {userId && (
                <p className="text-xs text-[#4a6741] mt-1">✓ Usuario seleccionado</p>
              )}
            </div>

            {/* Paquete predefinido */}
            <div className="col-span-2">
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Paquete</label>
              <select
                value={packageName}
                onChange={e => setPackageName(e.target.value)}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
              >
                <option value="">Selecciona un paquete...</option>
                {PREDEFINED.map(p => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
                <option value="__custom__">Personalizado...</option>
              </select>
            </div>

            {packageName === '__custom__' && (
              <div className="col-span-2">
                <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Nombre del paquete</label>
                <input value={customName} onChange={e => setCustomName(e.target.value)} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]" />
              </div>
            )}

            {/* Clases totales (solo si no está predefinido) */}
            {(packageName === '__custom__' || (selected && selected.classes !== null)) && (
              <div>
                <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Número de clases</label>
                <input
                  type="number"
                  min="1"
                  value={packageName === '__custom__' ? classesTotal : finalClasses}
                  onChange={e => setClassesTotal(e.target.value)}
                  placeholder="Vacío = ilimitado"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
                  readOnly={!!(selected && selected.classes !== null)}
                />
              </div>
            )}

            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Fecha de vencimiento (opcional)</label>
              <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]" />
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
