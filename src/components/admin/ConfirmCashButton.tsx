'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote, ArrowLeftRight, X } from 'lucide-react'

export default function ConfirmCashButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function confirm(method: 'efectivo' | 'transferencia') {
    setLoading(true)
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed', method }),
    })
    router.refresh()
    setLoading(false)
  }

  async function cancel() {
    setLoading(true)
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => confirm('efectivo')}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        <Banknote className="w-3 h-3" /> Efectivo
      </button>
      <button
        onClick={() => confirm('transferencia')}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        <ArrowLeftRight className="w-3 h-3" /> Transferencia
      </button>
      <button
        onClick={cancel}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-600 px-3 py-1.5 rounded-lg transition-colors"
      >
        <X className="w-3 h-3" /> Cancelar
      </button>
    </div>
  )
}
