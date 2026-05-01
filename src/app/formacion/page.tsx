import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/utils'
import { CheckCircle2, Clock, Users, Award } from 'lucide-react'
import BuyButton from '@/components/formacion/BuyButton'

const formation = {
  id: 'formacion-200h',
  title: 'Formación de Profesores de Yoga 200H',
  subtitle: 'Certificación internacional · Yoga Alliance',
  description: `Nuestro programa de formación de 200 horas está diseñado para transformarte en una profesora de yoga segura,
  consciente y con una práctica personal profunda. Aprenderás anatomía, filosofía, técnicas de enseñanza, pranayama, meditación y mucho más.`,
  price: 1800,
  duration_weeks: 12,
  level: 'Todos los niveles',
  stripe_price_id: process.env.STRIPE_FORMATION_PRICE_ID ?? 'price_formation',
  includes: [
    'Acceso a todas las sesiones presenciales y online',
    'Material didáctico completo en PDF',
    'Grabaciones de todas las sesiones',
    'Mentoría personalizada durante el programa',
    'Certificado reconocido por Yoga Alliance',
    'Acceso de por vida a la comunidad privada',
    'Sesiones de práctica adicionales',
    '2 retiros de fin de semana incluidos',
  ],
  schedule: [
    'Sábados 9:00 - 18:00h',
    'Domingos 9:00 - 14:00h (quincenal)',
    'Clases online semanales en directo',
  ],
}

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
    <div className="max-w-5xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block bg-emerald-100 text-[#4a6741] text-sm font-medium px-4 py-1.5 rounded-full mb-4">
          {formation.subtitle}
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-stone-800 mb-6 leading-tight">
          {formation.title}
        </h1>
        <p className="text-lg text-stone-500 max-w-2xl mx-auto leading-relaxed">
          {formation.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-16">
        {[
          { icon: Clock, label: 'Duración', value: `${formation.duration_weeks} semanas` },
          { icon: Users, label: 'Nivel', value: formation.level },
          { icon: Award, label: 'Horas', value: '200 horas' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-stone-200 p-6 text-center">
            <Icon className="w-6 h-6 text-[#4a6741] mx-auto mb-3" />
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">{label}</p>
            <p className="font-semibold text-stone-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Includes */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-light text-stone-800 mb-6">¿Qué incluye?</h2>
          <ul className="flex flex-col gap-4">
            {formation.includes.map(item => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#4a6741] flex-shrink-0 mt-0.5" />
                <span className="text-stone-600">{item}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-2xl font-light text-stone-800 mt-12 mb-6">Horario</h2>
          <ul className="flex flex-col gap-3">
            {formation.schedule.map(item => (
              <li key={item} className="flex items-center gap-3 text-stone-600">
                <div className="w-2 h-2 rounded-full bg-[#eef2ec]0 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Purchase card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 sticky top-24">
            <p className="text-4xl font-light text-stone-800 mb-1">{formatPrice(formation.price)}</p>
            <p className="text-stone-400 text-sm mb-6">Pago único · IVA incluido</p>

            <BuyButton
              formationId={formation.id}
              stripePriceId={formation.stripe_price_id}
              hasPurchased={hasPurchased}
              isLoggedIn={!!user}
            />

            <p className="text-xs text-stone-400 text-center mt-4">
              Pago seguro con Stripe. Política de reembolso de 14 días.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
