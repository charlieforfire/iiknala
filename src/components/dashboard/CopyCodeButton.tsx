'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 text-sm bg-[#4a6741] hover:bg-[#3a5232] text-white px-4 py-2 rounded-xl transition-colors"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}
