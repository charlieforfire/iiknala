import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { str, oneOf, validationError, ValidationError } from '@/lib/validate'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Formation installment price (cents). Only Stripe-payable formation option.
const FORMATION_INSTALLMENT_CENTS = 573600

const ALLOWED_TYPES = ['class', 'paquete', 'formation'] as const

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo de petición inválido' }, { status: 400 })
  }

  try {
    const b = body as Record<string, unknown>
    const type = oneOf(b.type, ALLOWED_TYPES, { required: true, label: 'type' })!

    if (type === 'class') {
      const classId = str(b.classId, { required: true, label: 'classId', maxLen: 100 })!

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
      const paqueteId = str(b.paqueteId, { required: true, label: 'paqueteId', maxLen: 100 })!

      // Always fetch price from DB — never trust user-supplied precio
      const { data: pkg } = await adminDb
        .from('packages')
        .select('nombre, precio')
        .eq('id', paqueteId)
        .eq('activo', true)
        .single()

      if (!pkg) return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 })

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        line_items: [{
          price_data: {
            currency: 'mxn',
            unit_amount: Math.round(pkg.precio * 100),
            product_data: { name: `iiknala — ${pkg.nombre}` },
          },
          quantity: 1,
        }],
        metadata: { type: 'paquete', paqueteId, userId: user.id, nombre: pkg.nombre },
        success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/paquetes`,
      })

      return NextResponse.json({ url: session.url })
    }

    if (type === 'formation') {
      const formationId = str(b.formationId, { required: true, label: 'formationId', maxLen: 100 })!

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        line_items: [{
          price_data: {
            currency: 'mxn',
            unit_amount: FORMATION_INSTALLMENT_CENTS,
            product_data: { name: 'iiknala YTT 200H — Pago en parcialidades (1 de 7)' },
          },
          quantity: 1,
        }],
        metadata: { type: 'formation', formationId, userId: user.id },
        success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/formacion`,
      })

      return NextResponse.json({ url: session.url })
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return validationError(err) as NextResponse
  }

  return NextResponse.json({ error: 'Tipo no válido' }, { status: 400 })
}
