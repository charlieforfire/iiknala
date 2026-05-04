import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, MapPin, Star } from 'lucide-react'
import SeamlessVideo from '@/components/ui/SeamlessVideo'
import { getInstagramPosts } from '@/lib/instagram'

const classes = [
  {
    slug: 'on-scale-vinyasa',
    name: 'On Scale Vinyasa',
    desc: 'Vinyasa con enfoque técnico y progresión de postura. Lun y Jue 7:30 am.',
    img: '/clase-on-scale.jpg',
    levels: ['avanzado', 'multinivel'],
  },
  {
    slug: 'rocket',
    name: 'Rocket Yoga',
    desc: 'Secuencia acelerada inspirada en Ashtanga. Intensa y liberadora. Mar 7:30 am.',
    img: '/clase-rocket.jpg',
    levels: ['avanzado', 'multinivel'],
  },
  {
    slug: 'yoga-wheel',
    name: 'Yoga Wheel',
    desc: 'Práctica con rueda de yoga para apertura de caderas, espalda y equilibrio. Miér 7:30 am · Lun 5:30 pm.',
    img: '/clase-yoga-wheel.jpg',
    levels: ['avanzado', 'principiantes'],
  },
  {
    slug: 'hand-balance',
    name: 'Hand Balance',
    desc: 'Técnica de equilibrio en manos. Fuerza, control y disciplina. Vier 7:30 am.',
    img: '/clase-hand-balance.jpg',
    levels: ['avanzado', 'multinivel', 'principiantes'],
  },
  {
    slug: 'yoga-suave',
    name: 'Yoga Suave y Estiramiento',
    desc: 'Movimiento gentil y estiramiento profundo para todos los cuerpos. Mar y Jue 9:00 am.',
    img: '/clase-yoga-suave.jpg',
    levels: ['principiantes'],
  },
  {
    slug: 'vinyasa-flow',
    name: 'Vinyasa Flow',
    desc: 'Flujo dinámico conectando movimiento y respiración. Sáb 9:30 am.',
    img: '/clase-vinyasa.jpg',
    levels: ['multinivel', 'principiantes'],
  },
  {
    slug: 'dharma',
    name: 'Dharma Yoga',
    desc: 'Práctica meditativa y filosófica inspirada en la tradición clásica. Lun 7:00 pm.',
    img: '/clase-dharma.jpg',
    levels: ['multinivel'],
  },
  {
    slug: 'slow-flow',
    name: 'Slow Flow',
    desc: 'Vinyasa a ritmo lento para conectar con cada movimiento. Mar y Jue 7:00 pm.',
    img: '/clase-slow-flow.jpg',
    levels: ['multinivel', 'principiantes'],
  },
  {
    slug: 'intuitive',
    name: 'Intuitive Flow',
    desc: 'Movimiento libre guiado por la intuición del cuerpo. Miér 7:00 pm.',
    img: '/clase-intuitive.jpg',
    levels: ['multinivel'],
  },
]

const levelDot: Record<string, string> = {
  avanzado: 'bg-[#6b2b2b]',
  multinivel: 'bg-[#b07050]',
  principiantes: 'bg-white',
}
const levelLabel: Record<string, string> = {
  avanzado: 'Avanzado',
  multinivel: 'Multinivel',
  principiantes: 'Principiantes',
}

const localGallery = [
  { src: '/galeria-1.jpg', alt: 'iiknala' },
  { src: '/galeria-2.jpg', alt: 'iiknala' },
  { src: '/galeria-3.jpg', alt: 'iiknala' },
  { src: '/galeria-4.jpg', alt: 'iiknala' },
  { src: '/galeria-5.jpg', alt: 'iiknala' },
  { src: '/galeria-6.jpg', alt: 'iiknala' },
  { src: '/galeria-7.jpg', alt: 'iiknala' },
  { src: '/galeria-8.jpg', alt: 'iiknala' },
  { src: '/galeria-9.jpg', alt: 'iiknala' },
]

const reviews = [
  {
    name: 'Valeria M.',
    rating: 5,
    text: 'Una experiencia transformadora. El espacio es precioso y los maestros tienen una energía increíble. Llevo 6 meses practicando aquí y no puedo imaginar mi semana sin iiknala.',
  },
  {
    name: 'Sofía R.',
    rating: 5,
    text: 'La formación 200H cambió mi vida. Aprendí muchísimo sobre anatomía, filosofía del yoga y cómo enseñar con autenticidad. Totalmente recomendada.',
  },
  {
    name: 'Andrea G.',
    rating: 5,
    text: 'Las clases de Vinyasa son exactamente lo que buscaba: retadoras pero accesibles. La shala es un espacio hermoso y siempre me voy sintiéndome renovada.',
  },
]

export default async function HomePage() {
  const instagramPosts = await getInstagramPosts(9)
  const gallery = instagramPosts
    ? instagramPosts.map(p => ({ src: p.media_url, alt: 'iiknala', href: p.permalink, isExternal: true }))
    : localGallery.map(p => ({ ...p, href: 'https://www.instagram.com/iiknala/', isExternal: false }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: 'iiknala Yoga',
    alternateName: 'iiknala',
    description: 'La mejor escuela de yoga en Mérida, Yucatán. Clases presenciales y online de Vinyasa, Rocket y Dharma. Formación de profesores YTT 200H certificada por Yoga Alliance.',
    url: 'https://www.iiknalayoga.com',
    logo: 'https://www.iiknalayoga.com/icon.png',
    image: 'https://www.iiknalayoga.com/icon.png',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Mérida',
      addressRegion: 'Yucatán',
      addressCountry: 'MX',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 21.0230019,
      longitude: -89.601443,
    },
    sameAs: [
      'https://www.instagram.com/iiknala/',
      'https://www.facebook.com/iiknala/',
    ],
    hasMap: 'https://maps.app.goo.gl/HvFvUke1rqKYMRQs6',
    priceRange: '$$',
    currenciesAccepted: 'MXN',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    areaServed: 'Mérida, Yucatán, México',
    knowsAbout: ['Vinyasa Yoga', 'Rocket Yoga', 'Dharma Yoga', 'Yoga Teacher Training', 'YTT 200H'],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="flex flex-col">

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-900 text-white">
        {/* Video desktop */}
        <video
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          src="/hero-video-web.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Video mobile */}
        <SeamlessVideo
          src="/hero-video-mobile.mp4"
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <p className="text-[#c5d4c0] font-medium tracking-[0.3em] uppercase text-xs mb-8">
            Yoga · Wellness · Drills®
          </p>
          <h1 className="text-2xl md:text-3xl font-light mb-3 tracking-wide text-white/90">
            Bienvenido a iiknala yoga
          </h1>
          <p className="text-4xl md:text-6xl font-light mb-6 leading-tight">
            Un lugar de paz,<br />un espacio de energía
          </p>
          <p className="text-base md:text-lg text-stone-300 font-light mb-3 max-w-xl mx-auto leading-relaxed">
            Explora nuestras clases, precios y ubicación
          </p>
          <p className="text-sm md:text-base text-stone-400 font-light mb-12 max-w-xl mx-auto leading-relaxed">
            Comienza tu viaje y vuélvete parte de nuestra vibrante comunidad en Mérida, Yucatán
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/clases"
              className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-8 py-4 rounded-xl font-medium transition-colors text-base"
            >
              Ver clases <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/paquetes"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-medium transition-colors text-base"
            >
              Ver precios
            </Link>
          </div>
        </div>
        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-px h-10 bg-white/30 animate-pulse" />
        </div>
      </section>

      {/* Banner Formación */}
      <section className="relative overflow-hidden min-h-[480px] flex items-center">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "url('/galeria-4.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-stone-900/65" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-white w-full">
          <div className="max-w-xl">
            <p className="text-[#a3b899] text-xs font-medium uppercase tracking-[0.25em] mb-5">
              Yoga Teacher Training · Oct – Mar
            </p>
            <h2 className="text-4xl md:text-5xl font-light mb-5 leading-tight">
              Formación 200H<br />Vinyasa y Anatomía
            </h2>
            <p className="text-stone-300 leading-relaxed mb-8 text-sm md:text-base">
              7 fines de semana intensivos para convertirte en profesora de yoga con certificación internacional. Wellness through awareness.
            </p>
            <Link
              href="/formacion"
              className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-7 py-3.5 rounded-xl font-medium transition-colors"
            >
              Saber más <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Clases */}
      <section className="py-24 max-w-6xl mx-auto px-4 w-full">
        <div className="text-center mb-14">
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-[0.25em] mb-3">Lo que ofrecemos</p>
          <h2 className="text-4xl font-light text-stone-800">Nuestras clases</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map((cls) => (
            <Link
              key={cls.slug}
              href="/clases"
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] flex items-end bg-stone-800"
            >
              <div className="absolute inset-0">
                <Image
                  src={cls.img}
                  alt={cls.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 p-5 text-white w-full">
                <h3 className="text-lg font-semibold mb-1">{cls.name}</h3>
                <p className="text-sm text-stone-300 leading-snug opacity-0 group-hover:opacity-100 transition-opacity duration-300 mb-3">{cls.desc}</p>
                <div className="flex items-center gap-2">
                  {cls.levels.map(l => (
                    <span key={l} className="flex items-center gap-1.5 text-xs text-stone-300">
                      <span className={`w-2 h-2 rounded-full border border-white/30 ${levelDot[l]}`} />
                      {levelLabel[l]}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/clases"
            className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-7 py-3.5 rounded-xl font-medium transition-colors"
          >
            Ver todos los horarios <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Galería */}
      <section className="py-24 bg-stone-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#4a6741] text-xs font-medium uppercase tracking-[0.25em] mb-3">Nuestros momentos</p>
            <h2 className="text-4xl font-light text-stone-800">Galería</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {gallery.map(({ src, alt, href }) => (
              <a key={src} href={href} target="_blank" rel="noopener noreferrer" className="relative aspect-square overflow-hidden rounded-lg block group">
                <Image src={src} alt={alt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized={src.startsWith('http')} />
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://www.instagram.com/iiknala/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-stone-300 hover:border-[#4a6741] text-stone-600 hover:text-[#4a6741] px-6 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              Ver más en @iiknala
            </a>
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section className="py-24 bg-[#eef2ec]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#4a6741] text-xs font-medium uppercase tracking-[0.25em] mb-3">Lo que dicen</p>
            <h2 className="text-4xl font-light text-stone-800">Reseñas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {reviews.map((r) => (
              <div key={r.name} className="bg-white rounded-2xl p-7 shadow-sm flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed flex-1">"{r.text}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-[#4a6741] flex items-center justify-center text-white text-xs font-medium">
                    {r.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">{r.name}</p>
                    <p className="text-xs text-stone-400">Google</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <a
              href="https://maps.app.goo.gl/HvFvUke1rqKYMRQs6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 px-6 py-3 rounded-xl font-medium transition-colors text-sm shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              Ver todas las reseñas en Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="py-24 max-w-6xl mx-auto px-4 w-full">
        <div className="text-center mb-12">
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-[0.25em] mb-3">Encuéntranos</p>
          <h2 className="text-4xl font-light text-stone-800">Dónde practicamos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#eef2ec] rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#4a6741]" />
              </div>
              <div>
                <p className="font-medium text-stone-800 mb-1">Dirección</p>
                <p className="text-stone-500 text-sm leading-relaxed">Mérida, Yucatán, México</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#eef2ec] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a6741" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-800 mb-1">Instagram</p>
                <a href="https://www.instagram.com/iiknala/" target="_blank" rel="noopener noreferrer" className="text-[#4a6741] text-sm hover:underline">@iiknala</a>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#eef2ec] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#4a6741">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-stone-800 mb-1">Facebook</p>
                <a href="https://www.facebook.com/iiknala/?locale=es_LA" target="_blank" rel="noopener noreferrer" className="text-[#4a6741] text-sm hover:underline">iiknala</a>
              </div>
            </div>
            <a
              href="https://maps.app.goo.gl/HvFvUke1rqKYMRQs6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#4a6741] hover:bg-[#3a5232] text-white px-5 py-3 rounded-xl font-medium transition-colors text-sm"
            >
              <MapPin className="w-4 h-4" />
              Cómo llegar
            </a>
          </div>
          <div className="md:col-span-2 rounded-2xl overflow-hidden shadow-sm border border-stone-200 h-80">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d931.2!2d-89.601443!3d21.0230019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f56778afac01d41%3A0x790c28143ded4f29!2siiknala!5e0!3m2!1ses!2smx!4v1714500000000!5m2!1ses!2smx"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

    </div>
    </>
  )
}
