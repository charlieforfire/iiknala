import Link from 'next/link'

const links = [
  { href: '/admin', label: 'Clases' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/financiero', label: 'Financiero' },
]

export default function AdminNav({ active }: { active: 'clases' | 'usuarios' | 'financiero' }) {
  return (
    <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-10 w-fit">
      {links.map(l => {
        const key = l.href.split('/').pop() || 'clases'
        const isActive = key === active || (active === 'clases' && l.href === '/admin')
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}
