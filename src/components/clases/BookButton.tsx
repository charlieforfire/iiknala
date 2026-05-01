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

export default function BookButton({ classId, isBooked, isFull, isLoggedIn, hasPackage }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'package' | 'cash' | null>(null)
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

  async function handleBook(type: 'package' | 'cash') {
    if (type === 'package' && !hasPackage) {
      router.push('/paquetes')
      return
    }
    setLoading(type)
    setError('')
    try {
      const endpoint = type === 'cash' ? '/api/reservas/cash' : '/api/reservas'
      const res = await fetch(endpoint, {
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
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {hasPackage ? (
        <button
          onClick={() => handleBook('package')}
          disabled={loading !== null}
          className="w-full py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white font-medium text-sm transition-colors"
        >
          {loading === 'package' ? 'Reservando...' : 'Reservar con paquete'}
        </button>
      ) : (
        <Link
          href="/paquetes"
          className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-sm transition-colors text-center block"
        >
          Comprar paquete para reservar
        </Link>
      )}
      <button
        onClick={() => handleBook('cash')}
        disabled={loading !== null}
        className="w-full py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 disabled:opacity-60 text-stone-600 font-medium text-sm transition-colors"
      >
        {loading === 'cash' ? 'Reservando...' : 'Reservar y pagar en estudio'}
      </button>
      {error && <p className="text-red-500 text-xs text-center">{error}</p>}
    </div>
  )
}
