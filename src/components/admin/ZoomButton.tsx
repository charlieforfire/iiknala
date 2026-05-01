'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Video, Copy, Check, RefreshCw } from 'lucide-react'

interface Props {
  classId: string
  currentZoomLink?: string | null
}

export default function ZoomButton({ classId, currentZoomLink }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState(currentZoomLink ?? '')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setLink(data.joinUrl)
      router.refresh()
    } catch (e: any) {
      setError(e.message ?? 'Error al crear reunión')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (link) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 flex-1 min-w-0">
          <Video className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline truncate"
          >
            {link}
          </a>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
          title="Copiar link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
        </button>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors disabled:opacity-50"
          title="Generar nueva reunión"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    )
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleCreate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
      >
        <Video className="w-3.5 h-3.5" />
        {loading ? 'Creando reunión...' : 'Crear reunión Zoom'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
