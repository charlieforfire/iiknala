'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  classId: string
  price: number
  isBooked: boolean
  isFull: boolean
  isLoggedIn: boolean
  hasPackage: boolean
}

export default function BookButton({ classId, price, isBooked, isFull, isLoggedIn, hasPackage }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isBooked) {
    return (
      <div className="w-full text-center py-3 rounded-xl bg-[#eef2ec] text-[#4a6741] font-medium text-sm border border-[#4a6741]/20">
        Lugar reservado ✓
      </div>
    )
  }

  if (isFull) {
    return (
      <div className="w-full text-center py-3 rounded-xl bg-stone-100 text-stone-400 font-medium text-sm">
        Clase completa
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push('/auth/login')}
        className="w-full py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] text-white font-medium text-sm transition-colors"
      >
        Entrar para reservar
      </button>
    )
  }

  if (!hasPackage) {
    return (
      <Link
        href="/paquetes"
        className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-sm transition-colors text-center block"
      >
        Comprar paquete para reservar
      </Link>
    )
  }

  async function handleBook() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
    } catch (e: any) {
      setError(e.message ?? 'Error al reservar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleBook}
        disabled={loading}
        className="w-full py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white font-medium text-sm transition-colors"
      >
        {loading ? 'Reservando...' : 'Reservar lugar'}
      </button>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
    </div>
  )
}
