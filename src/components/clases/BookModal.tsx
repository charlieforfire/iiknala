'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { X, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

type Step = 'login' | 'waiver' | 'book'

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
}

const WAIVER = `Reconozco que toda actividad física conlleva riesgos inherentes, incluyendo mi participación voluntaria en las clases de Yoga ofrecidas por iiknala yoga, las cuales pueden derivar en lesiones. Entiendo que estas prácticas involucran los sistemas cardiorrespiratorio y musculoesquelético a través de componentes aeróbicos, anaeróbicos, de fuerza, flexibilidad, agilidad y respiración, y que su naturaleza representa un riesgo potencial.

Declaro que cuento con autorización médica para participar en actividades de Yoga, o bien que he decidido hacerlo de manera voluntaria sin dicha autorización, asumiendo en su totalidad la responsabilidad de mi participación en cualquier clase, práctica o actividad relacionada con iiknala yoga.

Certifico que me encuentro en condiciones físicas adecuadas para participar en estas actividades, y que no padezco ninguna condición médica, discapacidad o enfermedad que pueda verse agravada o que represente un impedimento para mi práctica.

Por medio del presente documento, yo y mis representantes legales o herederos liberamos de cualquier responsabilidad a iiknala yoga, así como a sus representantes, instructores y colaboradores, por lesiones, accidentes, enfermedades o gastos médicos y legales, presentes o futuros, que pudieran derivarse de mi participación en sus clases o del uso de sus instalaciones y equipo.

Entiendo que iiknala yoga pone a mi disposición un espacio para resguardar mis pertenencias durante las clases; sin embargo, acepto que no se responsabiliza por pérdidas o daños a mis objetos personales mientras me encuentre en sus instalaciones.

He leído y acepto los términos y condiciones publicados en el sitio web de iiknala yoga.

Confirmo haber leído y comprendido en su totalidad este documento, y expreso mi acuerdo de manera voluntaria, liberando a iiknala yoga y a todo su equipo de cualquier responsabilidad legal o material, en los términos más amplios que la ley permita.`

const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fmtClass(date: string, time: string) {
  const d = new Date(date + 'T12:00:00')
  return `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]} · ${time.slice(0, 5)}`
}

export default function BookModal({
  classId, classTitle, classDate, classTime, instructor,
  isOpen, onClose, initialStep, initialHasPackage,
}: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>(initialStep)
  const [hasPackage, setHasPackage] = useState(initialHasPackage)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [waiverChecked, setWaiverChecked] = useState(false)
  const [waiverLoading, setWaiverLoading] = useState(false)

  const [bookLoading, setBookLoading] = useState<'package' | 'cash' | null>(null)
  const [bookError, setBookError] = useState('')

  if (!isOpen) return null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user) {
      setAuthError('Correo o contraseña incorrectos')
      setAuthLoading(false)
      return
    }
    const waiverAccepted = data.user.user_metadata?.waiver_accepted === true
    const { data: pkg } = await supabase
      .from('user_packages')
      .select('id')
      .eq('user_id', data.user.id)
      .eq('status', 'active')
      .limit(1)
      .single()
    setHasPackage(!!pkg)
    setAuthLoading(false)
    setStep(waiverAccepted ? 'book' : 'waiver')
  }

  async function handleAcceptWaiver() {
    setWaiverLoading(true)
    await supabase.auth.updateUser({ data: { waiver_accepted: true } })
    setWaiverLoading(false)
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">

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
          <form onSubmit={handleLogin} className="flex flex-col gap-4 px-6 py-6 overflow-y-auto">
            <p className="text-sm font-medium text-stone-700">Inicia sesión para reservar</p>

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
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
                >
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

        {/* Step: Waiver */}
        {step === 'waiver' && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100">
              <p className="text-sm font-semibold text-stone-800 uppercase tracking-wide">Liberación de responsabilidad</p>
            </div>
            <div className="overflow-y-auto px-6 py-4 flex-1 max-h-64">
              {WAIVER.split('\n\n').map((para, i) => (
                <p key={i} className="text-xs text-stone-600 leading-relaxed mb-3 last:mb-0">{para}</p>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex flex-col gap-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waiverChecked}
                  onChange={e => setWaiverChecked(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#4a6741] cursor-pointer"
                />
                <span className="text-sm text-stone-700">Acepto la exención de responsabilidad de iiknala yoga</span>
              </label>
              <button
                onClick={handleAcceptWaiver}
                disabled={!waiverChecked || waiverLoading}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white font-medium text-sm transition-colors"
              >
                {waiverLoading ? 'Guardando...' : 'Aceptar y continuar'}
              </button>
            </div>
          </div>
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
