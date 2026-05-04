'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronUp } from 'lucide-react'

export default function CreateClassForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [instructor, setInstructor] = useState('')
  const [capacity, setCapacity] = useState('15')
  const [level, setLevel] = useState('multinivel')
  const [description, setDescription] = useState('')
  const [isOnline, setIsOnline] = useState(false)

  async function handleCreate() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/clases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, time, instructor, capacity, level, description, is_online: isOnline }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error al crear clase')
      setLoading(false)
      return
    }
    setLoading(false)
    setOpen(false)
    setTitle(''); setDate(''); setTime(''); setInstructor(''); setCapacity('15')
    setLevel('multinivel'); setDescription(''); setIsOnline(false)
    router.refresh()
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
      >
        {open ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {open ? 'Cancelar' : 'Nueva clase'}
      </button>

      {open && (
        <div className="mt-4 bg-white border border-stone-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-stone-700 mb-5">Nueva clase</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Nombre de la clase</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: Dharma Multinivel" className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]" />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]" />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Hora</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]" />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Instructor</label>
              <input value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="Nombre del instructor" className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]" />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Cupo</label>
              <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]" />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Nivel</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]">
                <option value="multinivel">Multinivel</option>
                <option value="principiantes">Principiantes</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div className="flex items-center gap-2 self-end pb-2">
              <input type="checkbox" id="online" checked={isOnline} onChange={e => setIsOnline(e.target.checked)} className="accent-[#4a6741] w-4 h-4" />
              <label htmlFor="online" className="text-sm text-stone-600">Clase en línea</label>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Descripción (opcional)</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741] resize-none" />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={loading || !title || !date || !time || !instructor}
            className="mt-4 px-5 py-2.5 bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? 'Creando...' : 'Crear clase'}
          </button>
        </div>
      )}
    </div>
  )
}
