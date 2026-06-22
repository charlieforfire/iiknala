'use client'

import { useState } from 'react'

const CLABE_DATA = {
  clabe: '722180100038720545',
  banco: 'Albo',
  beneficiario: 'Beatriz Eugenia Herrera Cáceres',
  whatsapp: '9992174422',
  whatsappDisplay: '999 217 4422',
}

function TransferenciaModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  function copyClabe() {
    navigator.clipboard.writeText(CLABE_DATA.clabe)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
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
                href={`https://wa.me/52${CLABE_DATA.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#4a6741] underline"
              >
                {CLABE_DATA.whatsappDisplay}
              </a>
              {' '}con tu nombre y el concepto <strong className="text-stone-700">Formación YTT — Early Bird</strong>.
            </p>
          </div>
        </div>
        <p className="text-xs text-stone-400 text-center italic">El compromiso contigo mismo es el inicio del camino.</p>
      </div>
    </div>
  )
}

export default function EarlyBirdPromo() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      {showModal && <TransferenciaModal onClose={() => setShowModal(false)} />}

      <div className="mt-10 border-2 border-amber-400 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-amber-400 px-6 py-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-stone-900 tracking-tight uppercase">Early Bird</span>
            <span className="text-xs font-semibold bg-stone-900 text-amber-400 px-2.5 py-1 rounded-full uppercase tracking-wide">Flash Sale</span>
          </div>
          <span className="text-xs font-semibold text-stone-800">Del 20 jun al 25 jul 2026</span>
        </div>

        {/* Precios */}
        <div className="bg-white px-6 py-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {/* Contado */}
            <div className="border border-stone-200 rounded-xl p-5">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">De contado</p>
              <p className="text-stone-400 line-through text-sm mb-0.5">$35,000 MXN</p>
              <p className="text-3xl font-light text-stone-800 mb-3">$33,000 <span className="text-base text-stone-400">MXN</span></p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Paga el 50% ($16,500) ahora y liquida el resto antes del 1° de octubre de 2026.
              </p>
            </div>
            {/* Modular */}
            <div className="border border-stone-200 rounded-xl p-5">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Modular · 7 pagos</p>
              <p className="text-stone-400 line-through text-sm mb-0.5">$39,000 MXN</p>
              <p className="text-3xl font-light text-stone-800 mb-1">$37,000 <span className="text-base text-stone-400">MXN</span></p>
              <p className="text-xs text-[#4a6741] font-medium mb-3">7 × $5,286 MXN</p>
              <p className="text-xs text-stone-500 leading-relaxed">
                Paga 2 mensualidades ahora ($10,571) y continúa con los 5 pagos restantes conforme avanza la formación.
              </p>
            </div>
          </div>

          {/* Incluye */}
          <div className="bg-stone-50 rounded-xl px-5 py-4 mb-5">
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">¿Qué incluye?</p>
            <ul className="flex flex-col gap-1.5">
              {[
                'Paquete de 4 clases al mes',
                'Manual completo de trabajo',
                'Asesoría y retroalimentación personalizada de las secuencias que vayas creando',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-stone-600">
                  <span className="text-[#4a6741] mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors"
            >
              ¿Pagas por transferencia o efectivo?
            </button>
            <p className="text-xs text-stone-400">* Precio Early Bird solo válido en efectivo o transferencia bancaria.</p>
          </div>
        </div>
      </div>
    </>
  )
}
