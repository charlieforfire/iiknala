'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/nueva-contrasena`,
    })

    if (error) {
      setError('No pudimos enviar el correo. Verifica tu email e intenta de nuevo.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="iiknala" width={160} height={48} className="h-12 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-light text-stone-800">Recuperar contraseña</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-[#4a6741]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <p className="text-stone-700 font-medium mb-2">Revisa tu correo</p>
              <p className="text-sm text-stone-500 mb-6">
                Te enviamos un link para restablecer tu contraseña a <strong>{email}</strong>.
              </p>
              <Link href="/auth/login" className="text-[#4a6741] text-sm font-medium hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <p className="text-sm text-stone-500">
                Ingresa tu email y te enviaremos un link para crear una nueva contraseña.
              </p>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>

              <p className="text-center text-sm text-stone-500">
                <Link href="/auth/login" className="text-[#4a6741] font-medium hover:underline">
                  Volver al inicio de sesión
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
