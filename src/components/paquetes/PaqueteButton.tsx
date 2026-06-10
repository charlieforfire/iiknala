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

const CLABE_PAQUETES = {
  clabe: '014910605893216980',
  banco: 'Santander',
  beneficiario: 'Beatriz Eugenia Herrera Cáceres',
  whatsapp: '9992174422',
  whatsappDisplay: '999 217 4422',
}

function TransferenciaModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function copyClabe() {
    navigator.clipboard.writeText(CLABE_PAQUETES.clabe)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <p className="font-semibold text-stone-800 text-lg">Datos para transferencia</p>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-2xl leading-none">×</button>
        </div>

        <div className="flex flex-col gap-4 mb-6">
          <div className="bg-stone-50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-0.5">CLABE</p>
                <p className="font-mono font-semibold text-stone-800 tracking-wider">{CLABE_PAQUETES.clabe}</p>
              </div>
              <button
                onClick={copyClabe}
                className="text-xs bg-[#4a6741] hover:bg-[#3a5232] text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ml-3"
              >
                {copied ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="border-t border-stone-200 pt-3 flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Banco</span>
                <span className="font-medium text-stone-700">{CLABE_PAQUETES.banco}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Beneficiario</span>
                <span className="font-medium text-stone-700 text-right ml-4">{CLABE_PAQUETES.beneficiario}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#4a6741]/8 border border-[#4a6741]/20 rounded-xl p-4">
            <p className="text-sm text-stone-600 leading-relaxed">
              Envía tu comprobante al{' '}
              <a
                href={`https://wa.me/52${CLABE_PAQUETES.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#4a6741] underline"
              >
                {CLABE_PAQUETES.whatsappDisplay}
              </a>
              {' '}con tu nombre y el paquete que compraste.
            </p>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center italic">
          El compromiso contigo mismo es el inicio del camino.
        </p>
      </div>
    </div>
  )
}

export default function PaqueteButton({ paqueteId, precio, nombre, isLoggedIn, small }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

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
    <>
      {showModal && <TransferenciaModal onClose={() => setShowModal(false)} />}

      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={handleBuy}
          disabled={loading}
          className={`${base} bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white`}
        >
          {loading ? '...' : 'Comprar'}
        </button>
        <button
          onClick={() => setShowModal(true)}
          className={`${base} border border-stone-300 hover:border-[#4a6741] hover:text-[#4a6741] text-stone-500 bg-white transition-colors`}
        >
          Quiero pagar por transferencia
        </button>
      </div>
    </>
  )
}
