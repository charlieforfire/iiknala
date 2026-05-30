'use client'

import { useState } from 'react'

export default function ApplyCodeForm({ defaultCode }: { defaultCode?: string }) {
  const [code, setCode] = useState(defaultCode ?? '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setResult(null)

    const res = await fetch('/api/codes/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    const data = await res.json()
    setResult({ ok: res.ok, message: data.message ?? data.error })
    setLoading(false)

    if (res.ok) setTimeout(() => window.location.reload(), 1200)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: ANA-7K2X"
          className="flex-1 border border-stone-300 rounded-xl px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#4a6741]"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
        >
          {loading ? '...' : 'Aplicar'}
        </button>
      </div>
      {result && (
        <p className={`text-sm px-3 py-2 rounded-lg ${result.ok ? 'bg-[#eef2ec] text-[#4a6741]' : 'bg-red-50 text-red-600'}`}>
          {result.message}
        </p>
      )}
    </form>
  )
}
