'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'confirm' | 'loading'>('idle')

  async function handleDelete() {
    setStep('loading')
    const res = await fetch(`/api/admin/usuarios/${userId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/usuarios')
      router.refresh()
    } else {
      setStep('confirm')
      alert('Error al eliminar usuario')
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        Eliminar usuario
      </button>
    )
  }

  if (step === 'loading') {
    return <p className="text-xs text-stone-400">Eliminando...</p>
  }

  return (
    <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <p className="text-sm text-red-700 flex-1">¿Eliminar <strong>{userName}</strong> y todos sus datos?</p>
      <button
        onClick={() => setStep('idle')}
        className="text-xs text-stone-400 hover:text-stone-600 px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
      >
        Cancelar
      </button>
      <button
        onClick={handleDelete}
        className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors"
      >
        Sí, eliminar
      </button>
    </div>
  )
}
