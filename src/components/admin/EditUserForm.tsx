'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  initialBirthday?: string
  initialNotes?: string
}

export default function EditUserForm({ userId, initialBirthday, initialNotes }: Props) {
  const router = useRouter()
  const [birthday, setBirthday] = useState(initialBirthday ?? '')
  const [notes, setNotes] = useState(initialNotes ?? '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    await fetch(`/api/admin/usuarios/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthday, notes }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8">
      <h2 className="text-base font-semibold text-stone-700 mb-5">Información adicional</h2>
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">Fecha de cumpleaños</label>
          <input
            type="date"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#4a6741] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">
            Notas — lesiones, preferencias, restricciones
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Ej: lesión de rodilla derecha, prefiere posiciones modificadas..."
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4a6741] transition-colors resize-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="self-start px-5 py-2 bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {saved ? 'Guardado ✓' : loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
