'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Leaf className="w-8 h-8 text-[#4a6741]" />
          </div>
          <h2 className="text-2xl font-light text-stone-800 mb-3">¡Revisa tu email!</h2>
          <p className="text-stone-500">
            Te hemos enviado un enlace de confirmación a <strong>{email}</strong>. Haz clic en él para activar tu cuenta.
          </p>
          <Link href="/auth/login" className="inline-block mt-6 text-[#4a6741] font-medium hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-[#4a6741] font-semibold text-xl mb-2">
            <Leaf className="w-6 h-6" /> Iiknala Yoga
          </div>
          <h1 className="text-2xl font-light text-stone-800">Crea tu cuenta</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-[#4a6741] font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
