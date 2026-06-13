import { NextRequest, NextResponse } from 'next/server'
import { teacherToken } from '@/lib/teacher-auth'

export async function POST(req: NextRequest) {
  const { username, password } = await req.json()

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
