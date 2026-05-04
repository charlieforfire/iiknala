import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'iiknala Yoga — Clases y Formación',
  description: 'Reserva tus clases de yoga online y presenciales en Mérida, Yucatán. Descubre nuestra formación de profesores YTT 200H.',
  metadataBase: new URL('https://www.iiknalayoga.com'),
  icons: {
    icon: [{ url: '/icon.png', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', sizes: '512x512', type: 'image/png' }],
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'iiknala Yoga',
    description: 'Clases de yoga presenciales y online en Mérida, Yucatán. Formación de profesores YTT 200H.',
    url: 'https://www.iiknalayoga.com',
    siteName: 'iiknala Yoga',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'iiknala Yoga' }],
  },
  twitter: {
    card: 'summary',
    title: 'iiknala Yoga',
    description: 'Clases de yoga presenciales y online en Mérida, Yucatán.',
    images: ['/icon.png'],
  },
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
