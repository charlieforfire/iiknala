'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const links = [
  { href: '/clases', label: 'Clases' },
  { href: '/paquetes', label: 'Paquetes' },
  { href: '/formacion', label: 'Formación' },
]

export default function Navbar({ user }: { user: { email?: string } | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-50/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="iiknala" width={160} height={48} className="h-10 w-auto object-contain" priority />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'text-sm font-medium tracking-wide transition-colors',
                pathname.startsWith(l.href)
                  ? 'text-[#4a6741]'
                  : 'text-stone-500 hover:text-stone-900'
              )}
            >
              {l.label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm font-medium text-stone-500 hover:text-stone-900 tracking-wide">
                Mi cuenta
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login" className="text-sm font-medium text-stone-500 hover:text-stone-900 tracking-wide">
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="text-sm bg-[#4a6741] hover:bg-[#3a5232] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-stone-700" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-stone-50 border-b border-stone-200 px-4 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-stone-700 font-medium tracking-wide">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-stone-700 font-medium">Mi cuenta</Link>
              <button onClick={handleLogout} className="text-left text-stone-500">Salir</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" onClick={() => setOpen(false)} className="text-stone-700 font-medium">Entrar</Link>
              <Link href="/auth/register" onClick={() => setOpen(false)} className="text-[#4a6741] font-semibold">Registrarse</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
