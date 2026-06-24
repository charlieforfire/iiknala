import { NextRequest, NextResponse } from 'next/server'
import { teacherToken } from '@/lib/teacher-auth'
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(`teacher-auth:${ip}`, 5, 60_000)) {
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

  const expectedU = process.env.TEACHER_USERNAME
  const expectedP = process.env.TEACHER_PASSWORD

  if (!expectedU || !expectedP || username !== expectedU || password !== expectedP) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('teacher_token', teacherToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete('teacher_token')
  return res
}
