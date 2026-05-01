import { cookies } from 'next/headers'
import { createHash } from 'crypto'

export function adminToken() {
  const u = process.env.ADMIN_USERNAME ?? ''
  const p = process.env.ADMIN_PASSWORD ?? ''
  return createHash('sha256').update(`${u}:${p}`).digest('hex')
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies()
  return store.get('admin_token')?.value === adminToken()
}
