import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, User, Phone, Mail, FileText } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import LoadingSpinner from '@/components/LoadingSpinner'

interface FormValues {
  first_name: string
  last_name: string
  phone: string
  email: string
  notes: string
}

const EMPTY: FormValues = {
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  notes: '',
}

export default function ClientFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { clients, loading, addClient, updateClient } = useClients()

  const [form, setForm] = useState<FormValues>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Pre-fill when editing
  useEffect(() => {
    if (isEditing && !loading && !initialized) {
      const client = clients.find((c) => c.id === id)
      if (client) {
        setForm({
          first_name: client.first_name ?? '',
          last_name: client.last_name ?? '',
          phone: client.phone ?? '',
          email: client.email ?? '',
          notes: client.notes ?? '',
        })
        setInitialized(true)
      }
    }
    if (!isEditing) setInitialized(true)
  }, [isEditing, loading, clients, id, initialized])

  const handleChange = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.first_name.trim()) {
      setError('El nombre es requerido.')
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      notes: form.notes.trim() || null,
    }

    try {
      if (isEditing && id) {
        await updateClient(id, payload)
        navigate(`/clients/${id}`)
      } else {
        const newClient = await addClient(payload)
        navigate(`/clients/${newClient.id}`)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo.'
      setError(message)
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (isEditing && id) {
      navigate(`/clients/${id}`)
    } else {
      navigate('/')
    }
  }

  if (isEditing && loading && !initialized) return <LoadingSpinner />

  return (
    <div className="pb-24">
      {/* Top bar */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground active:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Cancelar
        </button>
        <h1 className="flex-1 text-base font-semibold text-foreground text-center pr-10">
          {isEditing ? 'Editar clienta' : 'Nueva clienta'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5 max-w-lg mx-auto">
        {/* Error banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* First name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Nombre <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.first_name}
              onChange={handleChange('first_name')}
              placeholder="Ej: María"
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
        </div>

        {/* Last name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Apellido</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={form.last_name}
              onChange={handleChange('last_name')}
              placeholder="Ej: González"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Teléfono</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="Ej: 11 1234-5678"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              placeholder="Ej: maria@email.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Notas</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <textarea
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Alergias, preferencias, datos importantes…"
              rows={4}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex-1 py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear clienta'}
          </button>
        </div>
      </form>
    </div>
  )
}
