import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Debes iniciar sesión para canjear un código' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

  const { data: invite } = await adminDb
    .from('invite_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (!invite) return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 })
  if (invite.owner_user_id === user.id) return NextResponse.json({ error: 'No puedes canjear tu propio código' }, { status: 400 })
  if (invite.status === 'redeemed') return NextResponse.json({ error: 'Este código ya fue canjeado' }, { status: 400 })

  if (invite.expires_at) {
    const today = new Date().toISOString().split('T')[0]
    if (invite.expires_at < today) return NextResponse.json({ error: 'Este código ha expirado' }, { status: 400 })
  }

  // Verificar que el usuario no tenga ya un crédito de este código
  const { data: existing } = await adminDb
    .from('guest_class_credits')
    .select('id')
    .eq('invite_code_id', invite.id)
    .single()
  if (existing) return NextResponse.json({ error: 'Este código ya fue canjeado' }, { status: 400 })

  // Marcar el código como canjeado y crear el crédito en una transacción lógica
  await adminDb
    .from('invite_codes')
    .update({ status: 'redeemed', redeemed_by_user_id: user.id, redeemed_at: new Date().toISOString() })
    .eq('id', invite.id)

  await adminDb.from('guest_class_credits').insert({
    user_id: user.id,
    invite_code_id: invite.id,
    source_user_package_id: invite.user_package_id,
    expires_at: invite.expires_at,
  })

  return NextResponse.json({ ok: true })
}
