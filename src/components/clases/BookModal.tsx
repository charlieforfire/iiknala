'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { X, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

type Step = 'login' | 'book'

interface Props {
  classId: string
  classTitle: string
  classDate: string
  classTime: string
  instructor: string
  isOpen: boolean
  onClose: () => void
  initialStep: Step
  initialHasPackage: boolean
  initialHasGuestCredit: boolean
}

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fmtClass(date: string, time: string) {
  const d = new Date(date + 'T12:00:00')
  return `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${time.slice(0, 5)}`
}

export default function BookModal({
  classId, classTitle, classDate, classTime, instructor,
  isOpen, onClose, initialStep, initialHasPackage, initialHasGuestCredit,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(initialStep)
  const [hasPackage, setHasPackage] = useState(initialHasPackage)
  const [hasGuestCredit, setHasGuestCredit] = useState(initialHasGuestCredit)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [bookLoading, setBookLoading] = useState<'package' | 'cash' | null>(null)
  const [bookError, setBookError] = useState('')

  if (!isOpen) return null

  async function handleLogin(e: { preventDefault: () => void }) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setAuthError('Correo o contraseña incorrectos')
      setAuthLoading(false)
      return
    }
    const today = new Date().toISOString().split('T')[0]
    const [{ data: pkg }, { data: credit }] = await Promise.all([
      supabase.from('user_packages').select('id, classes_total, classes_used').eq('user_id', data.user.id)
        .eq('status', 'active').or(`expires_at.is.null,expires_at.gte.${today}`).limit(1).single(),
      supabase.from('guest_class_credits').select('id').eq('user_id', data.user.id)
        .eq('status', 'available').or(`expires_at.is.null,expires_at.gte.${today}`).limit(1).single(),
    ])
    setHasPackage(!!pkg && (pkg.classes_total === null || pkg.classes_used < pkg.classes_total))
    setHasGuestCredit(!!credit)
    setAuthLoading(false)
    setStep('book')
  }

  async function handleBook(type: 'package' | 'cash') {
    setBookLoading(type)
    setBookError('')
    try {
      const endpoint = type === 'cash' ? '/api/reservas/cash' : '/api/reservas'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.refresh()
      onClose()
    } catch (e: any) {
      setBookError(e.message ?? 'Error al reservar')
    } finally {
      setBookLoading(null)
    }
  }

  const dateLabel = fmtClass(classDate, classTime)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <Image src="/logo.png" alt="iiknala" width={80} height={64} className="object-contain" />
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Class info */}
        <div className="px-6 py-4 border-b border-stone-100">
          <p className="font-medium text-stone-800">{classTitle}</p>
          <p className="text-sm text-stone-400 mt-0.5">{dateLabel} · {instructor}</p>
        </div>

        {/* Step: Login */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4 px-6 py-6">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-stone-500 uppercase tracking-wide">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4a6741] transition-colors"
                placeholder="tu@correo.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-stone-500 uppercase tracking-wide">Contraseña</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#4a6741] transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {authError && <p className="text-red-500 text-xs">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white font-medium text-sm transition-colors"
            >
              {authLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
            <p className="text-center text-sm text-stone-400">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/register" className="text-[#4a6741] font-medium hover:underline">
                Crear cuenta
              </Link>
            </p>
          </form>
        )}

        {/* Step: Book */}
        {step === 'book' && (
          <div className="px-6 py-6 flex flex-col gap-3">
            {hasPackage ? (
              <button
                onClick={() => handleBook('package')}
                disabled={bookLoading !== null}
                className="w-full py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white font-medium text-sm transition-colors"
              >
                {bookLoading === 'package' ? 'Reservando...' : 'Reservar con paquete'}
              </button>
            ) : hasGuestCredit ? (
              <button
                onClick={() => handleBook('package')}
                disabled={bookLoading !== null}
                className="w-full py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-60 text-white font-medium text-sm transition-colors"
              >
                {bookLoading === 'package' ? 'Reservando...' : 'Reservar con clase de invitado 🎁'}
              </button>
            ) : (
              <Link
                href="/paquetes"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-medium text-sm transition-colors text-center block"
              >
                Comprar paquete para reservar
              </Link>
            )}
            <button
              onClick={() => handleBook('cash')}
              disabled={bookLoading !== null}
              className="w-full py-2.5 rounded-xl border border-stone-300 hover:border-stone-400 disabled:opacity-60 text-stone-600 font-medium text-sm transition-colors"
            >
              {bookLoading === 'cash' ? 'Reservando...' : 'Reservar y pagar en estudio'}
            </button>
            {bookError && <p className="text-red-500 text-xs text-center">{bookError}</p>}
          </div>
        )}

      </div>
    </div>
  )
}
