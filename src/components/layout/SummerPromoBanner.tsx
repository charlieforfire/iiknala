import Link from 'next/link'

export default function SummerPromoBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-[#4a6741] text-white text-xs sm:text-sm py-2.5 text-center px-4">
      🌞 <em>Summer Promo · Aprovecha las vacaciones para entrenar más · Válido 1 jun – 31 ago 2026</em>
      <Link href="/paquetes#summer-promo" className="ml-2 underline font-semibold whitespace-nowrap">
        Ver paquetes →
      </Link>
    </div>
  )
}
