'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function PagoExitosoPage() {
  const router = useRouter()

  useEffect(() => {
    // Give Supabase a moment to restore the session from cookies,
    // then navigate to dashboard as a client-side push (preserves auth state).
    const t = setTimeout(() => router.push('/dashboard'), 1500)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-[#f5f4f0]">
      <Image src="/logo.png" alt="iiknala" width={120} height={36} className="h-10 w-auto object-contain" />
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-[#eef2ec] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#4a6741]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-light text-stone-800">¡Pago exitoso!</p>
        <p className="text-sm text-stone-500">Redirigiendo a tu cuenta…</p>
      </div>
    </div>
  )
}
