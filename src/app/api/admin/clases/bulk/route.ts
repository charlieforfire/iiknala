import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { isAdminAuthed } from '@/lib/admin-auth'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED = ['title', 'time', 'instructor', 'capacity', 'is_online', 'description']

export async function POST(req: NextRequest) {
  if (!await isAdminAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const body = await req.json()
  const { update, sourceDate } = body as { update: Record<string, unknown>; sourceDate: string }

  if (!sourceDate || typeof sourceDate !== 'string') {
    return NextResponse.json({ error: 'sourceDate requerido' }, { status: 400 })
  }

  // Build the safe update payload (never touch 'date' or 'enrolled')
  const safeUpdate: Record<string, unknown> = {}
  for (const key of ALLOWED) {
    if (key in update) safeUpdate[key] = update[key]
  }

  if (Object.keys(safeUpdate).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  // Derive weekday (0=Sun … 6=Sat) and month boundaries from sourceDate
  const d = new Date(sourceDate + 'T00:00:00Z')
  const weekday = d.getUTCDay()
  const year = d.getUTCFullYear()
  const month = d.getUTCMonth() + 1
  const pad = (n: number) => String(n).padStart(2, '0')
  const firstDay = `${year}-${pad(month)}-01`
  const lastDay = `${year}-${pad(month)}-${new Date(Date.UTC(year, month, 0)).getUTCDate()}`

  // Fetch all classes in this month — Supabase JS can't filter by DOW directly
  const { data: classes, error: fetchError } = await adminDb
    .from('yoga_classes')
    .select('id, date')
    .gte('date', firstDay)
    .lte('date', lastDay)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  // Filter client-side to matching weekday
  const ids = (classes ?? [])
    .filter(c => new Date(c.date + 'T00:00:00Z').getUTCDay() === weekday)
    .map(c => c.id)

  if (ids.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 })
  }

  const { error: updateError } = await adminDb
    .from('yoga_classes')
    .update(safeUpdate)
    .in('id', ids)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ ok: true, updated: ids.length })
}
