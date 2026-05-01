'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  formationId: string
  stripePriceId: string
  hasPurchased: boolean
  isLoggedIn: boolean
}

export default function BuyButton({ formationId, stripePriceId, hasPurchased, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (hasPurchased) {
    return (
      <div className="w-full text-center py-3 rounded-xl bg-[#eef2ec] text-[#4a6741] font-medium border border-emerald-200">
        Ya estás inscrita en esta formación
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push('/auth/login')}
        className="w-full py-4 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] text-white font-medium transition-colors"
      >
        Inicia sesión para inscribirte
      </button>
    )
  }

  async function handleBuy() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formationId, stripePriceId, type: 'formation' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error()
    } catch {
      setError('Algo salió mal. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-4 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white font-medium transition-colors"
      >
        {loading ? 'Redirigiendo...' : 'Inscribirme ahora'}
      </button>
      {error && <p className="text-red-600 text-xs text-center">{error}</p>}
    </div>
  )
}
