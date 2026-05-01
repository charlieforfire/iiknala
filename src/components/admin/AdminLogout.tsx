'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function AdminLogout() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Salir
    </button>
  )
}
