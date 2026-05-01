'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

export default function ConfirmCashButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle(status: 'confirmed' | 'cancelled') {
    setLoading(true)
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handle('confirmed')}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        <Check className="w-3 h-3" /> Pagó
      </button>
      <button
        onClick={() => handle('cancelled')}
        disabled={loading}
        className="inline-flex items-center gap-1 text-xs bg-stone-100 hover:bg-stone-200 disabled:opacity-50 text-stone-600 px-3 py-1.5 rounded-lg transition-colors"
      >
        <X className="w-3 h-3" /> Cancelar
      </button>
    </div>
  )
}
