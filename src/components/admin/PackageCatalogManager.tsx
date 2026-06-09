'use client'

import { useState } from 'react'
import { Pencil, Trash2, Plus, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export interface CatalogPackage {
  id: string
  nombre: string
  precio: number
  vigencia_dias: number | null
  clases: number | null
  activo: boolean
  destacado: boolean
  tipo: string
  extras: string[]
  is_shareable: boolean
  nota: string | null
  sort_order: number
}

type FormValues = Omit<CatalogPackage, 'id'>

const TIPO_LABELS: Record<string, string> = {
  regular: 'Regular',
  'ilimitado-multimes': 'Multi-mes',
  rocket: 'Rocket',
  summer: 'Verano',
}

const TIPOS = ['regular', 'ilimitado-multimes', 'rocket', 'summer']

function emptyForm(): FormValues {
  return {
    nombre: '',
    precio: 0,
    vigencia_dias: null,
    clases: null,
    activo: true,
    destacado: false,
    tipo: 'regular',
    extras: [],
    is_shareable: false,
    nota: null,
    sort_order: 0,
  }
}

function PackageForm({
  values,
  onChange,
  showId,
  idValue,
  onIdChange,
}: {
  values: FormValues
  onChange: (v: FormValues) => void
  showId?: boolean
  idValue?: string
  onIdChange?: (v: string) => void
}) {
  const set = (k: keyof FormValues, v: unknown) => onChange({ ...values, [k]: v })

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {showId && (
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">
              ID <span className="normal-case text-stone-400 text-[10px]">slug, ej: pack-20</span>
            </label>
            <input
              value={idValue ?? ''}
              onChange={e => onIdChange?.(e.target.value)}
              placeholder="pack-20"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#4a6741]"
            />
          </div>
        )}
        <div className={showId ? 'col-span-2 sm:col-span-1' : 'col-span-2 sm:col-span-2'}>
          <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Nombre</label>
          <input
            value={values.nombre}
            onChange={e => set('nombre', e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Precio (MXN)</label>
          <input
            type="number" min="0"
            value={values.precio || ''}
            onChange={e => set('precio', Number(e.target.value))}
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Vigencia (días)</label>
          <input
            type="number" min="1"
            value={values.vigencia_dias ?? ''}
            onChange={e => set('vigencia_dias', e.target.value ? Number(e.target.value) : null)}
            placeholder="vacío = sin venc."
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Clases</label>
          <input
            type="number" min="1"
            value={values.clases ?? ''}
            onChange={e => set('clases', e.target.value ? Number(e.target.value) : null)}
            placeholder="vacío = ilimitado"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <div>
          <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Tipo</label>
          <select
            value={values.tipo}
            onChange={e => set('tipo', e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
          >
            {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer pb-0.5">
          <input type="checkbox" checked={values.activo} onChange={e => set('activo', e.target.checked)} />
          <span className="text-sm text-stone-700">Activo</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer pb-0.5">
          <input type="checkbox" checked={values.destacado} onChange={e => set('destacado', e.target.checked)} />
          <span className="text-sm text-stone-700">Popular</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer pb-0.5">
          <input type="checkbox" checked={values.is_shareable} onChange={e => set('is_shareable', e.target.checked)} />
          <span className="text-sm text-stone-700">Compartible</span>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Extras <span className="normal-case text-stone-400 text-[10px]">separados por coma</span></label>
          <input
            value={values.extras.join(', ')}
            onChange={e => set('extras', e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : [])}
            placeholder="+1 invitado, +1 clase extra"
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
          />
        </div>
        <div>
          <label className="text-xs text-stone-500 uppercase tracking-wide block mb-1">Nota (opcional)</label>
          <input
            value={values.nota ?? ''}
            onChange={e => set('nota', e.target.value || null)}
            placeholder="Texto informativo..."
            className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#4a6741]"
          />
        </div>
      </div>
    </div>
  )
}

const COLS = 'grid-cols-[2fr_1fr_1fr_1fr_90px_90px]'

export default function PackageCatalogManager({ initialPackages }: { initialPackages: CatalogPackage[] }) {
  const [packages, setPackages] = useState(initialPackages)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormValues>(emptyForm())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [newId, setNewId] = useState('')
  const [newForm, setNewForm] = useState<FormValues>(emptyForm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function startEdit(pkg: CatalogPackage) {
    const { id, ...rest } = pkg
    setEditingId(id)
    setEditForm(rest)
    setDeletingId(null)
    setError('')
  }

  async function saveEdit() {
    if (!editingId) return
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/catalogo/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error al guardar'); setLoading(false); return }
    setPackages(ps => ps.map(p => p.id === editingId ? { id: editingId, ...editForm } : p))
    setEditingId(null)
    setLoading(false)
  }

  async function confirmDelete(id: string) {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/catalogo/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error al eliminar'); setLoading(false); return }
    setPackages(ps => ps.filter(p => p.id !== id))
    setDeletingId(null)
    setLoading(false)
  }

  async function createPackage() {
    if (!newId.trim() || !newForm.nombre || !newForm.precio) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/catalogo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId.trim(), ...newForm }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Error al crear'); setLoading(false); return }
    setPackages(ps => [...ps, data.package])
    setNewOpen(false)
    setNewId('')
    setNewForm(emptyForm())
    setLoading(false)
  }

  const groups = TIPOS
    .map(tipo => ({
      tipo,
      label: TIPO_LABELS[tipo],
      items: packages.filter(p => p.tipo === tipo).sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter(g => g.items.length > 0)

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-stone-700">Catálogo de paquetes</h2>
        <button
          onClick={() => { setNewOpen(v => !v); setError('') }}
          className="inline-flex items-center gap-2 text-sm font-medium text-white bg-[#4a6741] hover:bg-[#3a5232] px-4 py-2 rounded-xl transition-colors"
        >
          {newOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {newOpen ? 'Cancelar' : 'Nuevo paquete'}
        </button>
      </div>

      {newOpen && (
        <div className="bg-white border border-[#4a6741]/20 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-stone-700 mb-4">Nuevo paquete</h3>
          <PackageForm
            values={newForm}
            onChange={setNewForm}
            showId
            idValue={newId}
            onIdChange={setNewId}
          />
          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          <button
            onClick={createPackage}
            disabled={loading || !newId.trim() || !newForm.nombre || !newForm.precio}
            className="mt-4 px-5 py-2 bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {loading ? 'Guardando...' : 'Crear paquete'}
          </button>
        </div>
      )}

      {error && !newOpen && <p className="text-red-500 text-xs mb-4">{error}</p>}

      {groups.map(({ tipo, label, items }) => (
        <div key={tipo} className="mb-8">
          <h3 className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">{label}</h3>
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className={`grid ${COLS} bg-stone-50 border-b border-stone-200 px-6 py-3 text-xs font-medium text-stone-500 uppercase tracking-wide`}>
              <span>Nombre</span>
              <span>Precio</span>
              <span>Vigencia</span>
              <span>Clases</span>
              <span>Estado</span>
              <span></span>
            </div>

            {items.map(pkg => {
              if (editingId === pkg.id) {
                return (
                  <div key={pkg.id} className="px-6 py-4 border-b border-stone-100 last:border-0 bg-stone-50/80">
                    <PackageForm values={editForm} onChange={setEditForm} />
                    {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={saveEdit}
                        disabled={loading}
                        className="px-4 py-1.5 bg-[#4a6741] hover:bg-[#3a5232] disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {loading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setError('') }}
                        className="px-4 py-1.5 text-stone-600 text-xs rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )
              }

              if (deletingId === pkg.id) {
                return (
                  <div key={pkg.id} className="px-6 py-4 border-b border-stone-100 last:border-0 bg-red-50 flex items-center justify-between gap-4">
                    <p className="text-sm text-red-700">
                      ¿Eliminar <strong>{pkg.nombre}</strong>? Esta acción no se puede deshacer.
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => confirmDelete(pkg.id)}
                        disabled={loading}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        {loading ? '...' : 'Eliminar'}
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1.5 text-stone-600 text-xs rounded-lg hover:bg-stone-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={pkg.id} className={`grid ${COLS} items-center px-6 py-3 border-b border-stone-100 last:border-0`}>
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {pkg.nombre}
                      {pkg.destacado && (
                        <span className="ml-2 text-xs bg-[#4a6741] text-white px-2 py-0.5 rounded-full">Popular</span>
                      )}
                    </p>
                    <p className="text-xs text-stone-400 font-mono">{pkg.id}</p>
                  </div>
                  <p className="text-sm text-stone-700">{formatPrice(pkg.precio)}</p>
                  <p className="text-sm text-stone-500">{pkg.vigencia_dias ? `${pkg.vigencia_dias} días` : 'Sin venc.'}</p>
                  <p className="text-sm text-stone-500">{pkg.clases ?? 'Ilimitado'}</p>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full w-fit ${pkg.activo ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                    {pkg.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <div className="flex gap-1 justify-end">
                    <button
                      onClick={() => startEdit(pkg)}
                      title="Editar"
                      className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { setDeletingId(pkg.id); setEditingId(null); setError('') }}
                      title="Eliminar"
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </section>
  )
}
