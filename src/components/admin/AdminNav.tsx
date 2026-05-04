import Link from 'next/link'

type ActiveTab = 'dashboard' | 'clases' | 'paquetes' | 'usuarios' | 'financiero'

const links: { href: string; label: string; key: ActiveTab }[] = [
  { href: '/admin', label: 'Dashboard', key: 'dashboard' },
  { href: '/admin/clases', label: 'Clases', key: 'clases' },
  { href: '/admin/paquetes', label: 'Paquetes', key: 'paquetes' },
  { href: '/admin/usuarios', label: 'Usuarios', key: 'usuarios' },
  { href: '/admin/financiero', label: 'Financiero', key: 'financiero' },
]

export default function AdminNav({ active }: { active: ActiveTab }) {
  return (
    <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-10 w-fit flex-wrap">
      {links.map(l => (
        <Link
          key={l.href}
          href={l.href}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            active === l.key ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  )
}
