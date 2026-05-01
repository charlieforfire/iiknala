'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, X, Check, Loader2 } from 'lucide-react'

interface ClassData {
  id: string
  title: string
  date: string
  time: string
  instructor: string
  capacity: number
  is_online: boolean
  description?: string
}

export default function EditClassForm({ cls }: { cls: ClassData }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: cls.title,
    date: cls.date,
    time: cls.time.slice(0, 5),
    instructor: cls.instructor,
    capacity: cls.capacity,
    is_online: cls.is_online,
  })

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/clases/${cls.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOpen(false)
      router.refresh()
    } catch (e: any) {
      setError(e.message ?? 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 mt-2 transition-colors"
      >
        <Pencil className="w-3 h-3" /> Editar clase
      </button>
    )
  }

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <label className="text-xs text-stone-400 block mb-1">Título</label>
          <input
            value={form.title}
            onChange={e => set('title', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-400 block mb-1">Fecha</label>
          <input
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-400 block mb-1">Hora</label>
          <input
            type="time"
            value={form.time}
            onChange={e => set('time', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-400 block mb-1">Instructor</label>
          <input
            value={form.instructor}
            onChange={e => set('instructor', e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-400 block mb-1">Cupo máximo</label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.capacity}
            onChange={e => set('capacity', Number(e.target.value))}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4a6741]"
          />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id={`online-${cls.id}`}
            checked={form.is_online}
            onChange={e => set('is_online', e.target.checked)}
            className="accent-[#4a6741]"
          />
          <label htmlFor={`online-${cls.id}`} className="text-sm text-stone-600">Clase online (Zoom)</label>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
          Guardar
        </button>
        <button
          onClick={() => { setOpen(false); setError('') }}
          className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-stone-700 px-3 py-2 transition-colors"
        >
          <X className="w-3 h-3" /> Cancelar
        </button>
      </div>
    </div>
  )
}
