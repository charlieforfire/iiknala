import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Iiknala Yoga — Clases y Formación',
  description: 'Reserva tus clases de yoga online y presenciales, y descubre nuestra formación de profesores.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${dmSans.className} min-h-full flex flex-col bg-stone-50 text-stone-900`}>
        <Navbar user={user} />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
