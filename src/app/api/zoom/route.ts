import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createZoomMeeting } from '@/lib/zoom'
import { isAdminAuthed } from '@/lib/admin-auth'

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  if (!await isAdminAuthed()) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { classId } = await req.json()
  if (!classId) return NextResponse.json({ error: 'classId requerido' }, { status: 400 })

  const { data: cls } = await admin
    .from('yoga_classes')
    .select('title, date, time, duration_minutes')
    .eq('id', classId)
    .single()

  if (!cls) return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })

  const startTime = `${cls.date}T${cls.time}`

  const { joinUrl, meetingId } = await createZoomMeeting({
    topic: `iiknala · ${cls.title}`,
    startTime,
    duration: cls.duration_minutes ?? 60,
  })

  await admin
    .from('yoga_classes')
    .update({ zoom_link: joinUrl, is_online: true })
    .eq('id', classId)

  return NextResponse.json({ joinUrl, meetingId })
}
