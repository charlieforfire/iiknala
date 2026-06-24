import { NextRequest, NextResponse } from 'next/server'
import { adminToken } from '@/lib/admin-auth'
import { cookies } from 'next/headers'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`admin-auth:${ip}`, 5, 60_000)) {
    return rateLimitResponse()
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const username = typeof body.username === 'string' ? body.username.slice(0, 100) : ''
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : ''

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const store = await cookies()
  store.set('admin_token', adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const store = await cookies()
  store.delete('admin_token')
  return NextResponse.json({ ok: true })
}
