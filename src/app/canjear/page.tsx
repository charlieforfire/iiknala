'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gift } from 'lucide-react'
import Image from 'next/image'

export default function CanjearPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/invite/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al canjear el código')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/clases'), 2500)
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="iiknala" width={120} height={40} className="h-10 w-auto mx-auto mb-6 object-contain" />
          <div className="flex items-center justify-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-[#4a6741]" />
            <h1 className="text-xl font-medium text-stone-800">Canjear código de invitado</h1>
          </div>
          <p className="text-stone-400 text-sm">Ingresa el código que te compartió un amigo</p>
        </div>

        {success ? (
          <div className="bg-[#eef2ec] border border-[#4a6741]/20 rounded-2xl p-8 text-center">
            <p className="text-2xl mb-2">🎁</p>
            <p className="font-medium text-stone-800">¡Código canjeado!</p>
            <p className="text-sm text-stone-500 mt-1">Tienes una clase disponible. Redirigiendo a clases...</p>
          </div>
        ) : (
          <form onSubmit={handleRedeem} className="bg-white rounded-2xl border border-stone-200 p-8 flex flex-col gap-4">
            <div>
              <label className="text-xs text-stone-500 font-medium block mb-1.5 uppercase tracking-wide">Código</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                required
                maxLength={8}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-center font-mono text-xl tracking-widest font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#4a6741]/30 focus:border-[#4a6741]"
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length < 8}
              className="w-full bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Canjeando...' : 'Canjear código'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
