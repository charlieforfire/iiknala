'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const WAIVER = `Reconozco que toda actividad física conlleva riesgos inherentes, incluyendo mi participación voluntaria en las clases de Yoga ofrecidas por iiknala yoga, las cuales pueden derivar en lesiones. Entiendo que estas prácticas involucran los sistemas cardiorrespiratorio y musculoesquelético a través de componentes aeróbicos, anaeróbicos, de fuerza, flexibilidad, agilidad y respiración, y que su naturaleza representa un riesgo potencial.

Declaro que cuento con autorización médica para participar en actividades de Yoga, o bien que he decidido hacerlo de manera voluntaria sin dicha autorización, asumiendo en su totalidad la responsabilidad de mi participación en cualquier clase, práctica o actividad relacionada con iiknala yoga.

Certifico que me encuentro en condiciones físicas adecuadas para participar en estas actividades, y que no padezco ninguna condición médica, discapacidad o enfermedad que pueda verse agravada o que represente un impedimento para mi práctica.

Por medio del presente documento, yo y mis representantes legales o herederos liberamos de cualquier responsabilidad a iiknala yoga, así como a sus representantes, instructores y colaboradores, por lesiones, accidentes, enfermedades o gastos médicos y legales, presentes o futuros, que pudieran derivarse de mi participación en sus clases o del uso de sus instalaciones y equipo.

Entiendo que iiknala yoga pone a mi disposición un espacio para resguardar mis pertenencias durante las clases; sin embargo, acepto que no se responsabiliza por pérdidas o daños a mis objetos personales mientras me encuentre en sus instalaciones.

He leído y acepto los términos y condiciones publicados en el sitio web de iiknala yoga.

Confirmo haber leído y comprendido en su totalidad este documento, y expreso mi acuerdo de manera voluntaria, liberando a iiknala yoga y a todo su equipo de cualquier responsabilidad legal o material, en los términos más amplios que la ley permita.`

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [waiverAccepted, setWaiverAccepted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!waiverAccepted) return
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
      options: {
        data: {
          full_name: fullName,
          birthday: birthday || null,
          gender: gender || null,
          phone: phone || null,
          waiver_accepted: true,
        },
      },
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
          <Image src="/logo.png" alt="iiknala" width={160} height={48} className="h-12 w-auto mx-auto mb-6 object-contain" />
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="iiknala" width={160} height={48} className="h-12 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-light text-stone-800">Crea tu cuenta</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nombre completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                placeholder="Tu nombre completo"
              />
            </div>

            {/* Email */}
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

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-stone-300 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
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

            {/* Fecha de nacimiento */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Fecha de nacimiento</label>
              <input
                type="date"
                required
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
              />
            </div>

            {/* Género */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Género</label>
              <select
                required
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
              >
                <option value="">Selecciona...</option>
                <option value="mujer">Mujer</option>
                <option value="hombre">Hombre</option>
                <option value="no-binario">No binario</option>
                <option value="prefiero-no-decir">Prefiero no decir</option>
              </select>
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Número de teléfono</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full border border-stone-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#4a6741] focus:border-transparent"
                placeholder="Ej: 9999123456"
              />
            </div>

            {/* Waiver */}
            <div>
              <p className="text-xs font-semibold text-stone-700 uppercase tracking-wide mb-2">Liberación de responsabilidad</p>
              <div className="border border-stone-200 rounded-xl h-48 overflow-y-auto px-4 py-3 bg-stone-50">
                {WAIVER.split('\n\n').map((para, i) => (
                  <p key={i} className="text-xs text-stone-500 leading-relaxed mb-2.5 last:mb-0">{para}</p>
                ))}
              </div>
              <label className="flex items-start gap-3 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waiverAccepted}
                  onChange={e => setWaiverAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#4a6741] cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-stone-600">Acepto la exención de responsabilidad de iiknala yoga</span>
              </label>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

            <button
              type="submit"
              disabled={loading || !waiverAccepted}
              className="w-full bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-40 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
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
