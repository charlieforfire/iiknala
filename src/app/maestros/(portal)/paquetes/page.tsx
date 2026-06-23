import { redirect } from 'next/navigation'
import { isTeacherAuthed } from '@/lib/teacher-auth'
import { createClient as createAdmin } from '@supabase/supabase-js'
import AsignarPaqueteForm from '@/components/maestros/AsignarPaqueteForm'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function PaquetesMaestrosPage() {
  if (!await isTeacherAuthed()) redirect('/maestros/login')

  const { data: catalogPackages } = await adminDb
    .from('packages')
    .select('id, nombre, clases, vigencia_dias')
    .eq('activo', true)
    .eq('admin_only', false)
    .order('sort_order')

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-light text-stone-800 mb-2">Asignar paquete</h1>
      <p className="text-sm text-stone-500 mb-8">Busca al alumno por email y asígnale un paquete pagado en efectivo o transferencia.</p>
      <AsignarPaqueteForm packages={catalogPackages ?? []} />
    </div>
  )
}
