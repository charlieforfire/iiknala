import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'iiknala yoga',
}

export default function MantenimientoPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/hero-principal.jpg"
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
        <p className="text-stone-900 font-medium tracking-[0.3em] uppercase text-xs mb-10">
          iiknala yoga
        </p>
        <p className="text-stone-800 text-2xl md:text-3xl font-light leading-relaxed mb-6">
          Estamos trabajando para<br />mejorar tu experiencia
        </p>
        <p className="text-stone-700 text-lg font-light tracking-widest">
          Hari om
        </p>
      </div>
    </div>
  )
}
