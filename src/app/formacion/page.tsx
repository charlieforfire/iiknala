import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle2, Star } from 'lucide-react'
import BuyButton from '@/components/formacion/BuyButton'

const modulos = [
  {
    num: '01',
    titulo: 'Fundamentos',
    fechas: '9, 10 y 11 Octubre',
    temas: ['Bienvenida', 'Surya Namaskar A y B', 'Qué es yoga (sendas, tipos y niveles)', 'Yamas y Niyamas', 'Bandhas', 'Dictado de Saludos al sol'],
  },
  {
    num: '02',
    titulo: 'Filosofía',
    fechas: '20, 21 y 22 Octubre',
    temas: ['Yoga Sutras Patanjali', 'Principios de Fisiología', 'Grupos de Asanas', 'Mitología', 'Chakras', 'Yoga Nidra'],
  },
  {
    num: '03',
    titulo: 'Anatomía',
    fechas: '5, 6 y 7 Diciembre',
    temas: ['Cuerpo Sutil Koshas', 'Herramientas de meditación', 'Secuencia Posturas de pie', 'Anatomía Funcional', 'Respiración y Posturas', 'Qué es Vinyasa'],
  },
  {
    num: '04',
    titulo: 'Pranayama',
    fechas: '15, 16 y 17 Enero',
    temas: ['Mudras y Mantras', 'Yin Yoga', 'Extensiones hacia atrás', 'Flexiones hacia al frente', 'Pranayama', 'Estrategias para secuenciar'],
  },
  {
    num: '05',
    titulo: 'Ayurveda',
    fechas: '5, 6 y 7 Febrero',
    temas: ['Practica mandala', 'Posturas de apertura de cadera', 'Alineación y ajustes', 'Estrategias docentes', 'Prácticas individuales', 'Ayurveda'],
  },
  {
    num: '06',
    titulo: 'Experiencia Docente',
    fechas: '26, 27 y 28 Febrero',
    temas: ['Balance en manos y piernas', 'Posturas de inversión', 'Drills', 'Progresiones seguras para distintos niveles', 'Uso de props en balance y fuerza'],
  },
  {
    num: '07',
    titulo: 'Secuenciación',
    fechas: '26, 27 y 28 Marzo',
    temas: ['Retiro de Graduación'],
    retiro: true,
  },
]

const guias = [
  {
    nombre: 'Beatriz Herrera',
    bio: 'Cuenta con más de 1700 horas de formación en distintos linajes de yoga y más de 10 años de experiencia. Su enfoque se basa en observar el cuerpo de cada persona para adaptar la práctica a sus necesidades.',
  },
  {
    nombre: 'Jackie de la Gala',
    bio: 'Maestra de yoga con certificaciones en Yoga Sakya-Chandra, Chakra Vinyasa, Yoga Restaurativo, entre otras. Sus clases son espacios diseñados para generar un cambio profundo.',
  },
  {
    nombre: 'Carolina Pretto',
    bio: 'Doctora en Naturopatía y especialista clínica en Ayurveda, formada en India. Fundadora y directora del Colegio Nacional de Ayurveda en México.',
  },
  {
    nombre: 'Ramya Lluvia',
    bio: 'Maestra en Yoga y Meditación, formada en India, con más de dos décadas de experiencia. Formadora de instructores y guía de experiencias espirituales en India.',
  },
]

const resenas = [
  { nombre: 'Rebeca Bracamonte', texto: 'Hermosas instalaciones e increíbles guías que te dan seguridad, ambiente que te hace sentir como en casa y comunidad muy linda.' },
  { nombre: 'Elen Estrada', texto: 'Ir a Iiknala es toda una experiencia increíble donde te conoces a ti mismo y sobretodo una comunidad muy bella, con maestros muy preparados y clases excelentes!!!' },
  { nombre: 'Angelina Del Río', texto: 'La mejor escuela de yoga de Mérida! Maestros preparados y atentos a todos en las clases, las instalaciones hermosas; la comunidad es linda y te recibe con mucho amor.' },
  { nombre: 'Hector Zapata', texto: 'Por mucho el mejor estudio de Yoga, todas las maestras y maestros son los mejores en preparación... Yoga viene de la libertad y el amor y aquí se practica!' },
  { nombre: 'Ingrid Carrera', texto: 'Si quieres avanzar en tu práctica de manera consciente y segura definitivamente el mejor lugar, para todas las personas y todos los estilos de práctica.' },
  { nombre: 'Manuel Aranda', texto: 'Ir a iiknala es una experiencia increíble donde puedes volver a conectar contigo mismo.' },
]

export default async function FormacionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let hasPurchased = false
  if (user) {
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .limit(1)
    hasPurchased = (data?.length ?? 0) > 0
  }

  return (
    <div className="bg-stone-50">

      {/* Hero */}
      <div className="relative h-[70vh] min-h-[500px] flex items-end">
        <Image
          src="/hero.jpg"
          alt="YTT iiknala"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 px-6 pb-16 max-w-4xl mx-auto w-full">
          <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-3">YTT 2026 · 2027</p>
          <h1 className="text-5xl md:text-6xl font-light text-white mb-3 leading-tight">iiknala</h1>
          <p className="text-white/90 text-xl font-light">Vinyasa Progresivo · 200 Horas</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 rounded-full px-4 py-1.5">
            <span className="text-white text-xs">Certificación Yoga Alliance</span>
          </div>
        </div>
      </div>

      {/* Objetivo */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-4">Objetivo</p>
        <p className="text-stone-600 text-lg leading-relaxed">
          El objetivo del Training en iiknala es profundizar en la formación de los alumnos, poniendo especial atención en su proceso personal dentro del yoga. Seguiremos enfocándonos en la <strong className="text-stone-800 font-medium">sadhana</strong> (práctica integral) como eje central del aprendizaje, así como en el desarrollo del autoconocimiento: reconocer quiénes somos, cómo habitamos nuestra práctica y de qué manera el yoga se integra de forma consciente en nuestra vida y propósito.
        </p>
        <div className="mt-10 border-t border-stone-200 pt-10">
          <p className="text-2xl md:text-3xl font-light text-stone-700 italic leading-relaxed">
            "Yoga es un estado del ser. Es la unión contigo mismo, con lo sagrado, con el universo."
          </p>
        </div>
      </section>

      {/* Imagen */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative h-80 rounded-2xl overflow-hidden">
          <Image src="/iiknala_YTT_2025-2026-31.jpg" alt="Formación YTT" fill className="object-cover object-center" />
        </div>
      </div>

      {/* Temario */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Contenido</p>
        <h2 className="text-3xl font-light text-stone-800 mb-4">Temario</h2>
        <p className="text-stone-500 mb-10 max-w-2xl">
          Durante el entrenamiento se enseñarán a profundidad los fundamentos teóricos y prácticos del yoga desde una visión integral, que el alumno podrá comprender, integrar y aplicar al finalizar su formación.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Filosofía del yoga', 'Yoga Sutras', 'Anatomía aplicada al yoga', 'Secuenciación', 'Pranayama', 'Ayurveda', 'Yin Yoga', 'Experiencia docente'].map(tema => (
            <div key={tema} className="bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 font-medium">
              {tema}
            </div>
          ))}
        </div>
        <div className="mt-10 bg-white border border-stone-200 rounded-2xl p-8">
          <p className="text-sm font-semibold text-stone-700 mb-5">En detalle:</p>
          <ol className="flex flex-col gap-3">
            {[
              'Principios de la filosofía del yoga',
              'Introducción y estudio básico Yoga Sutras',
              'Anatomía funcional aplicada a la práctica',
              'Secuenciación y estructura de la clase',
              'Técnica y fundamentos de Pranayama',
              'Bases del Ayurveda aplicadas al yoga',
              'Fundamentos del Yin Yoga',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-stone-600 text-sm">
                <span className="text-[#4a6741] font-semibold w-5 flex-shrink-0">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Perfil de Egreso */}
      <section className="bg-[#4a6741]/5 py-20">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-2xl overflow-hidden">
            <Image src="/iiknala_YTT_2025-2026-21.jpg" alt="Perfil de egreso" fill className="object-cover object-center" />
          </div>
          <div>
            <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Al finalizar</p>
            <h2 className="text-3xl font-light text-stone-800 mb-8">Perfil de egreso</h2>
            <ul className="flex flex-col gap-4">
              {[
                'Crear y guiar clases completas de Vinyasa Yoga.',
                'Comprender y aplicar la relación entre respiración, movimiento y secuenciación.',
                'Diseñar prácticas progresivas, adaptables a distintos niveles y perfiles de practicantes.',
                'Sostener una enseñanza clara, segura y consciente.',
                'Compartir el yoga en su entorno o comunidad desde una práctica coherente, auténtica y en constante evolución.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#4a6741] flex-shrink-0 mt-0.5" />
                  <span className="text-stone-600 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Guías */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Equipo</p>
        <h2 className="text-3xl font-light text-stone-800 mb-12">Conoce a tus guías</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {guias.map(g => (
            <div key={g.nombre} className="bg-white border border-stone-200 rounded-2xl p-7">
              <h3 className="text-lg font-semibold text-stone-800 mb-2">{g.nombre}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{g.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pre-requisitos */}
      <section className="bg-stone-100 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Aplicación</p>
          <h2 className="text-3xl font-light text-stone-800 mb-10">Pre-requisitos</h2>
          <div className="flex flex-col gap-5">
            {[
              'Ser mayor de 18 años.',
              'Contar con experiencia previa en la práctica de yoga. (No es indispensable haber enseñado previamente.)',
              'Enviar CV o semblanza personal, donde se refleje tu formación, experiencia y contexto actual.',
              'Completar el formulario de aplicación proporcionado por iiknala.',
              'Presentar tres ensayos breves (mínimo 100 palabras cada uno): ¿Qué significa el yoga para ti? · ¿Qué personas o experiencias han influido en tu camino? · Describe tu contexto personal y profesional actual.',
              'Realizar el pago de inscripción una vez recibida la confirmación oficial de aceptación.',
            ].map((req, i) => (
              <div key={i} className="flex items-start gap-4 bg-white rounded-xl px-6 py-4 border border-stone-200">
                <span className="text-2xl font-light text-[#4a6741] w-8 flex-shrink-0">{i + 1}</span>
                <p className="text-stone-600 text-sm leading-relaxed pt-1">{req}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calendario */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">YTT 2026 · 2027</p>
        <h2 className="text-3xl font-light text-stone-800 mb-4">Calendario</h2>
        <div className="grid md:grid-cols-2 gap-10 mb-8">
          <div className="flex flex-col gap-2">
            {[
              ['Octubre', '9, 10, 11'],
              ['Octubre', '20, 21, 22'],
              ['Diciembre', '5, 6, 7'],
              ['Enero', '16, 17, 18'],
              ['Febrero', '6, 7, 8'],
              ['Febrero / Marzo', '27, 28 feb · 1 marzo'],
              ['Marzo', '27, 28, 29'],
            ].map(([mes, dias]) => (
              <div key={`${mes}-${dias}`} className="flex items-center justify-between border-b border-stone-200 py-3">
                <span className="text-stone-700 font-medium">{mes}</span>
                <span className="text-stone-500 text-sm">{dias}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#4a6741]/5 rounded-2xl p-8 flex flex-col gap-4 justify-center">
            <p className="text-sm font-semibold text-stone-700 mb-2">Horarios</p>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Viernes</p>
              <p className="text-stone-700">6:00 p.m. a 9:00 p.m.</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Sábado</p>
              <p className="text-stone-700">8:30 a.m. a 6:00 p.m.</p>
              <p className="text-xs text-stone-400">(con una hora y media para la comida)</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Domingo</p>
              <p className="text-stone-700">8:30 a.m. a 1:00 p.m.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programa por módulo */}
      <section className="bg-stone-800 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#a8c4a2] text-xs font-medium uppercase tracking-widest mb-2">Estructura</p>
          <h2 className="text-3xl font-light text-white mb-4">Programa por módulo</h2>
          <p className="text-stone-400 mb-12 max-w-2xl">
            En iiknala, aprender a enseñar y profundizar en la práctica personal ocurren de manera simultánea. A través de un enfoque de Vinyasa progresivo, el estudiante adquiere criterios para estructurar clases seguras, fluidas y adaptables.
          </p>
          <div className="flex flex-col gap-4">
            {modulos.map(m => (
              <div key={m.num} className={`rounded-xl border ${m.retiro ? 'border-[#4a6741] bg-[#4a6741]/20' : 'border-stone-700 bg-stone-700/50'} p-6`}>
                <div className="flex items-start gap-6">
                  <span className="text-4xl font-light text-stone-500 w-12 flex-shrink-0">{m.num}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-white font-medium">{m.titulo}</h3>
                      <span className="text-xs text-stone-400 bg-stone-800 px-3 py-1 rounded-full">{m.fechas}</span>
                    </div>
                    {m.retiro ? (
                      <p className="text-[#a8c4a2] text-lg font-light">Retiro de Graduación</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {m.temas.map(t => (
                          <span key={t} className="text-xs text-stone-300 bg-stone-800/60 px-2.5 py-1 rounded-lg">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-stone-500 text-xs mt-6">
            * Gastos de hospedaje del retiro de graduación no incluidos. Sujeto a disponibilidad y a la tarifa del momento.
          </p>
        </div>
      </section>

      {/* Imagen YTT */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="relative h-96 rounded-2xl overflow-hidden">
          <Image src="/iiknala_YTT_2025-2026-38.jpg" alt="YTT iiknala" fill className="object-cover object-center" />
        </div>
      </div>

      {/* Reseñas */}
      <section className="bg-[#4a6741]/5 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Comunidad</p>
          <h2 className="text-3xl font-light text-stone-800 mb-12">Lo que dice nuestra comunidad</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resenas.map(r => (
              <div key={r.nombre} className="bg-white border border-stone-200 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">"{r.texto}"</p>
                <p className="text-stone-800 font-medium text-sm">{r.nombre}</p>
                <p className="text-stone-400 text-xs">Google Maps</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inversión */}
      <section className="max-w-5xl mx-auto px-6 py-20" id="inversion">
        <p className="text-[#4a6741] text-xs font-medium uppercase tracking-widest mb-2">Inversión</p>
        <h2 className="text-3xl font-light text-stone-800 mb-12">Precios y modalidades</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Mensualidades */}
          <div className="bg-white border border-stone-200 rounded-2xl p-8 md:col-span-2">
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-3">Pago en mensualidades</p>
            <p className="text-5xl font-light text-stone-800 mb-1">$42,000</p>
            <p className="text-stone-400 text-sm mb-6">MXN · Total</p>
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex justify-between text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-600">Inscripción</span>
                <span className="font-medium text-stone-800">$6,000 MXN</span>
              </div>
              <div className="flex justify-between text-sm border-b border-stone-100 pb-3">
                <span className="text-stone-600">7 mensualidades de</span>
                <span className="font-medium text-stone-800">$6,000 MXN</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-600">Diploma Yoga Alliance</span>
                <span className="font-medium text-stone-800">$3,000 MXN</span>
              </div>
            </div>
            <p className="text-xs text-stone-400">* Las mensualidades se pagan a lo largo de los 7 meses de formación.</p>
            <p className="text-xs text-stone-400 mt-1">* Cupos limitados, las inscripciones se atenderán en orden de llegada.</p>
          </div>

          {/* Descuentos */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#4a6741] text-white rounded-2xl p-7">
              <p className="text-xs text-white/70 uppercase tracking-wide mb-2">Pago de contado</p>
              <p className="text-3xl font-light mb-1">$36,500</p>
              <p className="text-white/70 text-sm mb-4">MXN · Efectivo o transferencia</p>
              <p className="text-xs text-white/60">Deberá realizarse antes del primer módulo.</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-7">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Módulo individual</p>
              <p className="text-3xl font-light text-stone-800 mb-1">$6,000</p>
              <p className="text-stone-400 text-sm">MXN · 3 días</p>
            </div>
          </div>
        </div>

        {/* Métodos de pago + CTA */}
        <div className="mt-10 bg-white border border-stone-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <p className="font-medium text-stone-800 mb-3">Métodos de pago</p>
            <ul className="text-stone-500 text-sm flex flex-col gap-2">
              <li>· <strong className="text-stone-700">Transferencia</strong> — te enviamos los datos después de tu aceptación</li>
              <li>· <strong className="text-stone-700">Efectivo</strong> — en iiknala Yoga, Mérida, Yucatán</li>
              <li>· <strong className="text-stone-700">Tarjeta en línea</strong> — inscripción vía Stripe (pago seguro)</li>
            </ul>
          </div>
          <div className="flex flex-col items-center gap-3 min-w-[200px]">
            <p className="text-xs text-stone-400 text-center">Inscripción · $6,000 MXN</p>
            <BuyButton
              formationId="formacion-200h"
              stripePriceId={process.env.STRIPE_FORMATION_PRICE_ID ?? 'price_formation'}
              hasPurchased={hasPurchased}
              isLoggedIn={!!user}
            />
            <p className="text-xs text-stone-400 text-center">Solo después de recibir tu confirmación de aceptación</p>
          </div>
        </div>

        <p className="text-center text-stone-400 text-xs mt-6">* Descuentos no acumulables. Costos de hospedaje para el retiro final no incluídos.</p>
      </section>

    </div>
  )
}
