'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  paqueteId: string
  precio: number
  nombre: string
  isLoggedIn: boolean
  small?: boolean
}

export default function PaqueteButton({ paqueteId, precio, nombre, isLoggedIn, small }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const base = small
    ? 'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors mt-1'
    : 'w-full py-4 rounded-xl font-medium transition-colors'

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push('/auth/login')}
        className={`${base} bg-[#4a6741] hover:bg-[#3a5232] text-white`}
      >
        Comprar
      </button>
    )
  }

  async function handleBuy() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'paquete', paqueteId, precio, nombre }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Error al procesar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className={`${base} bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white`}
    >
      {loading ? '...' : 'Comprar'}
    </button>
  )
}
