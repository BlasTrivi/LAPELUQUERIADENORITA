import { useState } from 'react'
import { Scissors, Plus, Edit3, Trash2, DollarSign, Check, X } from 'lucide-react'
import { useServices } from '@/hooks/useServices'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import type { Service } from '@/types'

const inputClass =
  'w-full rounded-xl border border-[#e5ddd5] bg-[#faf9f7] px-3.5 py-3 text-base text-[#1a1a1a] placeholder-[#8a7a6a] outline-none transition focus:border-[#d4a0a0] focus:bg-white focus:ring-2 focus:ring-[#d4a0a0]/20'

// ---------------------------------------------------------------------------
// Add Service Form
// ---------------------------------------------------------------------------

function AddServiceForm({ onAdd }: { onAdd: (name: string, price?: number) => Promise<void> }) {
  const [form, setForm] = useState({ name: '', price: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = form.name.trim()
    if (!trimmed) return
    setError(null)
    setLoading(true)
    try {
      const price = form.price !== '' ? parseFloat(form.price) : undefined
      await onAdd(trimmed, price)
      setForm({ name: '', price: '' })
    } catch {
      setError('No se pudo agregar el servicio.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-[#e5ddd5] p-4 mb-4"
    >
      <p className="text-xs font-semibold text-[#8a7a6a] uppercase tracking-wider mb-3">
        Nuevo servicio
      </p>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Nombre del servicio"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          required
        />
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8a7a6a]">$</span>
          <input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            className={`${inputClass} pl-8`}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !form.name.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#d4a0a0] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#c48888] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Agregar
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-[#e55555]">{error}</p>
      )}
    </form>
  )
}

// ---------------------------------------------------------------------------
// Service Card
// ---------------------------------------------------------------------------

function ServiceCard({
  service,
  onUpdate,
  onDelete,
}: {
  service: Service
  onUpdate: (id: string, updates: Partial<Service>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(service.name)
  const [editPrice, setEditPrice] = useState(
    service.default_price != null ? String(service.default_price) : ''
  )
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function startEdit() {
    setEditName(service.name)
    setEditPrice(service.default_price != null ? String(service.default_price) : '')
    setEditing(true)
  }

  async function saveEdit() {
    const trimmed = editName.trim()
    if (!trimmed) return
    setSaving(true)
    try {
      const price = editPrice !== '' ? parseFloat(editPrice) : null
      await onUpdate(service.id, { name: trimmed, default_price: price ?? undefined })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function confirmAndDelete() {
    setDeleting(true)
    try {
      await onDelete(service.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const formattedPrice =
    service.default_price != null
      ? `$${Number(service.default_price).toLocaleString('es-AR')}`
      : null

  // ---- Edit mode ----
  if (editing) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#d4a0a0] p-4">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className={inputClass}
            autoFocus
          />
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8a7a6a]">$</span>
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="Precio"
              className={`${inputClass} pl-8`}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={saving || !editName.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#6ab57a] px-3 py-3 text-base font-medium text-white transition active:scale-[0.97] disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              Guardar
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#e5ddd5] bg-[#f0ebe5] px-3 py-3 text-base font-medium text-[#8a7a6a] transition active:scale-[0.97]"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ---- Delete confirmation ----
  if (confirmDelete) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#e55555]/30 p-4">
        <p className="text-sm text-[#1a1a1a] mb-3">
          ¿Eliminar <span className="font-semibold">{service.name}</span>?
        </p>
        <div className="flex gap-2">
          <button
            onClick={confirmAndDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#e55555] px-3 py-3 text-base font-medium text-white transition active:scale-[0.97] disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 rounded-xl border border-[#e5ddd5] bg-[#f0ebe5] px-3 py-3 text-base font-medium text-[#8a7a6a] transition active:scale-[0.97]"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  // ---- Normal view — buttons always visible ----
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e5ddd5] p-4 flex items-center gap-3 transition-all active:scale-[0.98]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5e6d3]">
        <Scissors className="h-5 w-5 text-[#d4a0a0]" strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{service.name}</p>
        {formattedPrice ? (
          <p className="text-sm text-[#d4a0a0] font-bold mt-0.5">{formattedPrice}</p>
        ) : (
          <p className="text-xs text-[#8a7a6a]/60 mt-0.5 italic">Sin precio</p>
        )}
      </div>
      <button
        onClick={startEdit}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebe5] text-[#8a7a6a] transition active:scale-90 active:bg-[#e5ddd5]"
        aria-label="Editar"
      >
        <Edit3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => setConfirmDelete(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#e55555] transition active:scale-90 active:bg-red-100"
        aria-label="Eliminar"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ServicesPage() {
  const { services, loading, addService, updateService, deleteService } = useServices()

  return (
    <div className="px-4 py-4 pb-24">
      {/* Add form */}
      <AddServiceForm onAdd={addService} />

      {/* List */}
      {loading ? (
        <LoadingSpinner message="Cargando servicios..." />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Sin servicios"
          description="Todavía no agregaste ningún servicio. Usá el formulario de arriba para crear el primero."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onUpdate={updateService}
              onDelete={deleteService}
            />
          ))}
        </div>
      )}
    </div>
  )
}
