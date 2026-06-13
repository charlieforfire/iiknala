'use client'

import { useState, useRef } from 'react'
import { Search, Check, X } from 'lucide-react'

interface PkgOption {
  id: string
  nombre: string
  clases: number | null
  vigencia_dias: number | null
}

interface UserResult {
  id: string
  email: string
  full_name: string
}

export default function AsignarPaqueteForm({ packages }: { packages: PkgOption[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UserResult[]>([])
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null)
  const [selectedPkg, setSelectedPkg] = useState(packages[0]?.id ?? '')
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleQueryChange(val: string) {
    setQuery(val)
    setSelectedUser(null)
    setToast(null)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.length < 3) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/maestros/usuarios?email=${encodeURIComponent(val)}`)
        const data = await res.json()
        setResults(data.users ?? [])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  function selectUser(u: UserResult) {
    setSelectedUser(u)
    setQuery(u.email)
    setResults([])
  }

  async function handleAssign() {
    if (!selectedUser || !selectedPkg) return
    setLoading(true)
    setToast(null)
    try {
      const res = await fetch('/api/maestros/paquetes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: selectedUser.id, package_id: selectedPkg, payment_method: paymentMethod }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setToast({ type: 'ok', msg: `Paquete asignado a ${selectedUser.full_name}.` })
      setSelectedUser(null)
      setQuery('')
      setResults([])
      setPaymentMethod('efectivo')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al asignar paquete.'
      setToast({ type: 'err', msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 max-w-lg">

      {/* User search */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-stone-700 mb-2">Buscar alumno por email</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={query}
            onChange={e => handleQueryChange(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full border border-stone-300 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
          />
          {selectedUser && (
            <button
              onClick={() => { setSelectedUser(null); setQuery(''); setResults([]) }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {results.length > 0 && !selectedUser && (
          <div className="mt-1 border border-stone-200 rounded-xl overflow-hidden shadow-sm">
            {results.map(u => (
              <button
                key={u.id}
                onClick={() => selectUser(u)}
                className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-0"
              >
                <p className="text-sm font-medium text-stone-800">{u.full_name}</p>
                <p className="text-xs text-stone-500">{u.email}</p>
              </button>
            ))}
          </div>
        )}

        {searching && (
          <p className="text-xs text-stone-400 mt-2">Buscando...</p>
        )}

        {selectedUser && (
          <div className="mt-2 flex items-center gap-2 text-sm text-[#4a6741]">
            <Check className="w-4 h-4" />
            <span><strong>{selectedUser.full_name}</strong> — {selectedUser.email}</span>
          </div>
        )}
      </div>

      {/* Package selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">Paquete</label>
        <select
          value={selectedPkg}
          onChange={e => setSelectedPkg(e.target.value)}
          className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] bg-white"
        >
          {packages.map(p => (
            <option key={p.id} value={p.id}>
              {p.nombre}
              {p.clases ? ` · ${p.clases} clases` : ' · Ilimitado'}
              {p.vigencia_dias ? ` · ${p.vigencia_dias} días` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Payment method */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-2">Método de pago</label>
        <div className="flex gap-3">
          {(['efectivo', 'transferencia'] as const).map(method => (
            <button
              key={method}
              type="button"
              onClick={() => setPaymentMethod(method)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${
                paymentMethod === method
                  ? 'bg-[#4a6741] text-white border-[#4a6741]'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-[#4a6741]/50'
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 mb-4 ${toast.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {toast.type === 'ok' && <Check className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

      <button
        onClick={handleAssign}
        disabled={loading || !selectedUser || !selectedPkg}
        className="w-full bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-colors"
      >
        {loading ? 'Asignando...' : 'Asignar paquete'}
      </button>
    </div>
  )
}
