import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { type, classId, formationId, paqueteId, precio, nombre } = body
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (type === 'class') {
    const { data: cls } = await supabase
      .from('yoga_classes')
      .select('title, price')
      .eq('id', classId)
      .single()

    if (!cls) return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(cls.price * 100),
          product_data: { name: cls.title },
        },
        quantity: 1,
      }],
      metadata: { type: 'class', classId, userId: user.id },
      success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/clases`,
    })

    return NextResponse.json({ url: session.url })
  }

  if (type === 'paquete') {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(precio * 100),
          product_data: { name: `iiknala — ${nombre}` },
        },
        quantity: 1,
      }],
      metadata: { type: 'paquete', paqueteId, userId: user.id },
      success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/paquetes`,
    })

    return NextResponse.json({ url: session.url })
  }

  if (type === 'formation') {
    const unitAmount = Math.round((precio ?? 3650000))
    const productName = nombre ?? 'iiknala — Formación de Profesores 200H'
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        price_data: {
          currency: 'mxn',
          unit_amount: unitAmount,
          product_data: { name: productName },
        },
        quantity: 1,
      }],
      metadata: { type: 'formation', formationId, userId: user.id },
      success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/formacion`,
    })

    return NextResponse.json({ url: session.url })
  }

  return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
}
