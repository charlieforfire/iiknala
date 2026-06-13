'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function TeacherHeader() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/maestros/auth', { method: 'DELETE' })
    router.push('/maestros/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-stone-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/maestros">
            <Image src="/logo.png" alt="iiknala" width={100} height={30} className="h-8 w-auto object-contain" />
          </Link>
          <span className="text-stone-300">|</span>
          <span className="text-sm text-stone-500 font-medium">Portal Maestros</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </button>
      </div>
    </header>
  )
}
