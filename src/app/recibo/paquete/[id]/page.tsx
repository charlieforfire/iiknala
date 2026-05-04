import { createClient as createAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import PrintButton from '@/components/ui/PrintButton'

const adminDb = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function fmtDate(str: string) {
  const d = new Date(str + 'T12:00:00')
  return `${d.getDate()} de ${meses[d.getMonth()]} ${d.getFullYear()}`
}

function paymentLabel(method: string) {
  if (!method) return 'Manual (admin)'
  if (method?.startsWith('cs_')) return 'Tarjeta de crédito/débito (Stripe)'
  if (method === 'transferencia') return 'Transferencia bancaria'
  if (method === 'efectivo') return 'Efectivo en estudio'
  return method
}

export default async function ReciboPaquetePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: pkg } = await adminDb
    .from('user_packages')
    .select('*')
    .eq('id', id)
    .single()

  if (!pkg || pkg.user_id !== user.id) redirect('/')

  const userName = user.user_metadata?.full_name ?? user.email ?? '—'
  const issuedAt = new Date(pkg.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-stone-50 print:bg-white">
      <div className="max-w-xl mx-auto px-6 py-12 print:py-6">

        <div className="flex justify-end mb-8 print:hidden">
          <PrintButton />
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden print:border-0 print:rounded-none">

          <div className="bg-[#4a6741] px-8 py-8 text-center">
            <Image src="/logo.png" alt="iiknala" width={120} height={36} className="h-9 w-auto mx-auto mb-4 object-contain brightness-0 invert" />
            <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Recibo de paquete</p>
            <p className="text-white text-lg font-light">#{id.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="px-8 py-8">

            <div className="flex items-center justify-center mb-8">
              <span className="bg-emerald-50 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full border border-emerald-200">
                ✓ Paquete activo
              </span>
            </div>

            <div className="mb-6 pb-6 border-b border-stone-100">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">Alumno</p>
              <p className="font-medium text-stone-800">{userName}</p>
              <p className="text-sm text-stone-500">{user.email}</p>
            </div>

            <div className="mb-6 pb-6 border-b border-stone-100">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-3">Paquete</p>
              <p className="text-lg font-medium text-stone-800 mb-3">{pkg.package_name}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-stone-400 text-xs mb-0.5">Clases incluidas</p>
                  <p className="text-stone-700">{pkg.classes_total ?? 'Ilimitadas'}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-xs mb-0.5">Vigencia hasta</p>
                  <p className="text-stone-700">{pkg.expires_at ? fmtDate(pkg.expires_at) : 'Sin límite'}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-stone-100">
              <p className="text-xs text-stone-400 uppercase tracking-wide mb-3">Pago</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-stone-400 text-xs mb-0.5">Método</p>
                  <p className="text-stone-700">{paymentLabel(pkg.stripe_session_id)}</p>
                </div>
                <div>
                  <p className="text-stone-400 text-xs mb-0.5">Fecha de emisión</p>
                  <p className="text-stone-700">{issuedAt}</p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-stone-400 leading-relaxed">
              iiknala yoga · Mérida, Yucatán, México<br />
              iiknalayoga.com · @iiknala
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
