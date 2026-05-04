'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteClassButton({ classId }: { classId: string }) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    await fetch(`/api/admin/clases/${classId}`, { method: 'DELETE' })
    router.refresh()
  }

  if (confirm) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-xs text-red-600">¿Eliminar con todas sus reservas?</span>
        <button onClick={handleDelete} disabled={loading} className="text-xs bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg transition-colors disabled:opacity-60">
          {loading ? '...' : 'Sí, eliminar'}
        </button>
        <button onClick={() => setConfirm(false)} className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1">
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" /> Eliminar
    </button>
  )
}
