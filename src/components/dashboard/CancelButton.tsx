'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  bookingId: string
  classDate: string
  classTime: string
}

export default function CancelButton({ bookingId, classDate, classTime }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const classDateTime = new Date(`${classDate}T${classTime}`)
  const isPast = classDateTime.getTime() < Date.now()

  if (isPast) return null

  async function handleCancel() {
    if (!confirm('¿Cancelar esta reserva? Tu crédito será devuelto a tu paquete.')) return

    setLoading(true)
    await fetch(`/api/reservas/${bookingId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="text-sm text-stone-400 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {loading ? 'Cancelando...' : 'Cancelar'}
    </button>
  )
}
