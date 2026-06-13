import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export function teacherToken() {
  const u = process.env.TEACHER_USERNAME ?? ''
  const p = process.env.TEACHER_PASSWORD ?? ''
  return createHash('sha256').update(`${u}:${p}`).digest('hex')
}

export async function isTeacherAuthed(): Promise<boolean> {
  const store = await cookies()
  return store.get('teacher_token')?.value === teacherToken()
}
