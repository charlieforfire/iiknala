'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  formationId: string
  stripePriceId: string
  hasPurchased: boolean
  isLoggedIn: boolean
}

const CLABE_DATA = {
  clabe: '722180100038720545',
  banco: 'Albo',
  beneficiario: 'Beatriz Eugenia Herrera Cáceres',
  whatsapp: '999 217 4422',
}

function TransferenciaModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function copyClabe() {
    navigator.clipboard.writeText(CLABE_DATA.clabe)
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
                <p className="font-mono font-semibold text-stone-800 tracking-wider">{CLABE_DATA.clabe}</p>
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
                <span className="font-medium text-stone-700">{CLABE_DATA.banco}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Beneficiario</span>
                <span className="font-medium text-stone-700 text-right ml-4">{CLABE_DATA.beneficiario}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#4a6741]/8 border border-[#4a6741]/20 rounded-xl p-4">
            <p className="text-sm text-stone-600 leading-relaxed">
              Envía tu comprobante al{' '}
              <a
                href={`https://wa.me/52${CLABE_DATA.whatsapp.replace(/\s/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#4a6741] underline"
              >
                {CLABE_DATA.whatsapp}
              </a>
              {' '}con tu nombre y el concepto <strong className="text-stone-700">Formación YTT</strong>.
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

export default function BuyButton({ formationId, hasPurchased, isLoggedIn }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<'parcialidades' | null>(null)
  const [showModal, setShowModal] = useState(false)
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

  async function handleParcialidades() {
    setLoading('parcialidades')
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formationId,
          type: 'formation',
          precio: 573600,
          nombre: 'iiknala YTT 200H — Pago en parcialidades (1 de 7)',
        }),
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
    <>
      {showModal && <TransferenciaModal onClose={() => setShowModal(false)} />}

      <div className="flex flex-col gap-3">
        {/* Contado — abre modal de transferencia */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-4 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] text-white font-medium transition-colors"
        >
          Pago de contado — $36,018 MXN
        </button>

        {/* Parcialidades — Stripe */}
        <button
          onClick={handleParcialidades}
          disabled={loading !== null}
          className="w-full py-3.5 rounded-xl border-2 border-[#4a6741] hover:bg-[#4a6741]/5 disabled:opacity-60 text-[#4a6741] font-medium transition-colors"
        >
          {loading === 'parcialidades' ? 'Redirigiendo...' : 'Pago en parcialidades — 7 × $5,736 MXN'}
        </button>

        {error && <p className="text-red-600 text-xs text-center">{error}</p>}
      </div>
    </>
  )
}
