'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
    >
      Descargar / Imprimir PDF
    </button>
  )
}
