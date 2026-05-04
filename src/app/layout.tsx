import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: {
    default: 'iiknala Yoga — Clases y Formación en Mérida, Yucatán',
    template: '%s | iiknala Yoga',
  },
  description: 'La mejor escuela de yoga en Mérida, Yucatán. Clases presenciales y online de Vinyasa, Rocket y Dharma. Formación de profesores YTT 200H certificada por Yoga Alliance.',
  keywords: ['yoga Mérida', 'clases de yoga Yucatán', 'escuela de yoga Mérida', 'yoga Vinyasa Mérida', 'formación profesores yoga México', 'YTT 200H México', 'estudio yoga Mérida', 'yoga online México', 'iiknala yoga'],
  metadataBase: new URL('https://www.iiknalayoga.com'),
  alternates: { canonical: 'https://www.iiknalayoga.com' },
  icons: {
    icon: [{ url: '/icon.png', sizes: '512x512', type: 'image/png' }],
    apple: [{ url: '/apple-icon.png', sizes: '512x512', type: 'image/png' }],
    shortcut: '/icon.png',
  },
  openGraph: {
    title: 'iiknala Yoga — La mejor escuela de yoga en Mérida, Yucatán',
    description: 'Clases de Vinyasa, Rocket y Dharma presenciales y online. Formación de profesores YTT 200H certificada por Yoga Alliance.',
    url: 'https://www.iiknalayoga.com',
    siteName: 'iiknala Yoga',
    locale: 'es_MX',
    type: 'website',
    images: [{ url: '/icon.png', width: 512, height: 512, alt: 'iiknala Yoga' }],
  },
  twitter: {
    card: 'summary',
    title: 'iiknala Yoga — Mérida, Yucatán',
    description: 'La mejor escuela de yoga en Mérida. Clases presenciales y online.',
    images: ['/icon.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
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
