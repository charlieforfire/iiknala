import { redirect } from 'next/navigation'
import { isTeacherAuthed } from '@/lib/teacher-auth'
import TeacherHeader from '@/components/maestros/TeacherHeader'

export default async function MaestrosLayout({ children }: { children: React.ReactNode }) {
  if (!await isTeacherAuthed()) redirect('/maestros/login')

  return (
    <div className="min-h-screen bg-stone-50">
      <TeacherHeader />
      <main>{children}</main>
    </div>
  )
}
