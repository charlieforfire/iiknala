import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isTeacherAuthed } from '@/lib/teacher-auth'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  if (!await isTeacherAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const email = req.nextUrl.searchParams.get('email')?.trim().toLowerCase()
  if (!email || email.length < 3) {
    return NextResponse.json({ users: [] })
  }

  const { data: { users }, error } = await adminDb.auth.admin.listUsers({ perPage: 100 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const matches = (users ?? [])
    .filter(u => u.email?.toLowerCase().includes(email))
    .slice(0, 8)
    .map(u => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name ?? u.email?.split('@')[0],
    }))

  return NextResponse.json({ users: matches })
}
