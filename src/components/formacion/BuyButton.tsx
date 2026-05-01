'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  formationId: string
  stripePriceId: string
  hasPurchased: boolean
  isLoggedIn: boolean
}

export default function BuyButton({ formationId, hasPurchased, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'contado' | 'parcialidades' | null>(null)
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

  async function handleBuy(modalidad: 'contado' | 'parcialidades') {
    setLoading(modalidad)
    setError('')

    const isContado = modalidad === 'contado'
    const precio = isContado ? 3650000 : 600000 // centavos MXN
    const nombre = isContado
      ? 'iiknala YTT 200H — Pago de contado'
      : 'iiknala YTT 200H — Inscripción (primer pago)'

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formationId, type: 'formation', precio, nombre }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else throw new Error()
    } catch {
      setError('Algo salió mal. Inténtalo de nuevo.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Contado */}
      <button
        onClick={() => handleBuy('contado')}
        disabled={loading !== null}
        className="w-full py-4 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white font-medium transition-colors"
      >
        {loading === 'contado' ? 'Redirigiendo...' : 'Pago de contado — $36,500 MXN'}
      </button>

      {/* Parcialidades */}
      <button
        onClick={() => handleBuy('parcialidades')}
        disabled={loading !== null}
        className="w-full py-3.5 rounded-xl border-2 border-[#4a6741] hover:bg-[#4a6741]/5 disabled:opacity-60 text-[#4a6741] font-medium transition-colors"
      >
        {loading === 'parcialidades' ? 'Redirigiendo...' : 'Pago en parcialidades — 7 × $6,000 MXN'}
      </button>

      <p className="text-xs text-stone-400 text-center">
        Parcialidades: inscripción $6,000 + 6 mensualidades de $6,000
      </p>

      {error && <p className="text-red-600 text-xs text-center">{error}</p>}
    </div>
  )
}
