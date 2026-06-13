'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function MaestrosLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/maestros/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      setError('Usuario o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push('/maestros')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="iiknala" width={160} height={48} className="h-12 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-light text-stone-800">Portal Maestros</h1>
          <p className="text-sm text-stone-500 mt-1">Acceso exclusivo para instructores</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Usuario</label>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                placeholder="usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
