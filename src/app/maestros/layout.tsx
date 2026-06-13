import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import TeacherHeader from '@/components/maestros/TeacherHeader'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function MaestrosLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/maestros/login')

  const { data: teacher } = await adminDb
    .from('teachers')
    .select('id, full_name')
    .eq('id', user.id)
    .single()

  if (!teacher) redirect('/maestros/login')

  return (
    <div className="min-h-screen bg-stone-50">
      <TeacherHeader teacherName={teacher.full_name} />
      <main>{children}</main>
    </div>
  )
}
