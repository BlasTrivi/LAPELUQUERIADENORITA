import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  FileText,
  Palette,
  Droplets,
} from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useServices } from '@/hooks/useServices'
import { useVisits } from '@/hooks/useVisits'
import LoadingSpinner from '@/components/LoadingSpinner'

interface ColorFormulaForm {
  brand: string
  color_number: string
  developer_volume: string
  mix_details: string
  application_notes: string
}

const EMPTY_FORMULA: ColorFormulaForm = {
  brand: '',
  color_number: '',
  developer_volume: '',
  mix_details: '',
  application_notes: '',
}

const TODAY = format(new Date(), 'yyyy-MM-dd')

export default function NewVisitPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { clients, loading: clientsLoading } = useClients()
  const { services, loading: servicesLoading } = useServices()
  const { addVisit } = useVisits(clientId)

  const [serviceId, setServiceId] = useState('')
  const [visitDate, setVisitDate] = useState(TODAY)
  const [price, setPrice] = useState('')
  const [notes, setNotes] = useState('')
  const [showFormula, setShowFormula] = useState(false)
  const [formula, setFormula] = useState<ColorFormulaForm>(EMPTY_FORMULA)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = clients.find((c) => c.id === clientId)

  // Auto-fill price when service is selected
  useEffect(() => {
    if (!serviceId) return
    const service = services.find((s) => s.id === serviceId)
    if (service?.default_price != null) {
      setPrice(String(service.default_price))
    }
  }, [serviceId, services])

  const handleFormulaChange = (field: keyof ColorFormulaForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormula((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const hasAnyFormulaValue = Object.values(formula).some((v) => v.trim())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return
    if (!serviceId) {
      setError('Seleccioná un servicio.')
      return
    }
    if (!visitDate) {
      setError('La fecha es requerida.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      await addVisit({
        client_id: clientId,
        service_id: serviceId,
        visit_date: visitDate,
        price: price ? parseFloat(price) : undefined,
        notes: notes.trim() || undefined,
        colorFormula: showFormula && hasAnyFormulaValue
          ? {
              brand: formula.brand.trim() || undefined,
              color_number: formula.color_number.trim() || undefined,
              developer_volume: formula.developer_volume || undefined,
              mix_details: formula.mix_details.trim() || undefined,
              application_notes: formula.application_notes.trim() || undefined,
            }
          : undefined,
      })
      navigate(`/clients/${clientId}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error. Intentá de nuevo.'
      setError(message)
      setSaving(false)
    }
  }

  if (clientsLoading || servicesLoading) return <LoadingSpinner />

  const clientName = client
    ? `${client.first_name}${client.last_name ? ` ${client.last_name}` : ''}`
    : 'Clienta'

  const formattedDate = (() => {
    try {
      return format(new Date(visitDate + 'T12:00:00'), "d 'de' MMMM, yyyy", { locale: es })
    } catch {
      return visitDate
    }
  })()

  return (
    <div className="pb-24">
      {/* Top bar */}
      <div className="px-4 py-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/clients/${clientId}`)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground active:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {clientName}
        </button>
        <h1 className="flex-1 text-base font-semibold text-foreground text-center pr-16">
          Nueva visita
        </h1>
      </div>

      {/* Client badge */}
      <div className="px-4 pt-5 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent rounded-xl">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary-dark">
            {client?.first_name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-foreground">{clientName}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5 max-w-lg mx-auto pb-16">
        {/* Error banner */}
        {error && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Servicio <span className="text-destructive">*</span>
          </label>
          <select
            value={serviceId}
            onChange={(e) => { setServiceId(e.target.value); setError(null) }}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow appearance-none"
          >
            <option value="">Seleccioná un servicio…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.default_price != null ? ` — $${s.default_price}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Fecha</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
          {visitDate && (
            <p className="text-xs text-muted-foreground mt-1 ml-1">{formattedDate}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Precio</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Notas</label>
          <div className="relative">
            <FileText className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observaciones de la visita…"
              rows={3}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow resize-none"
            />
          </div>
        </div>

        {/* Color formula collapsible */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <button
            type="button"
            onClick={() => setShowFormula((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Fórmula de Color</span>
              {hasAnyFormulaValue && showFormula && (
                <span className="text-xs px-2 py-0.5 bg-accent text-primary-dark rounded-full font-medium">
                  Con datos
                </span>
              )}
            </div>
            <span className="text-muted-foreground text-lg leading-none">
              {showFormula ? '−' : '+'}
            </span>
          </button>

          {showFormula && (
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              {/* Brand */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Marca
                </label>
                <input
                  type="text"
                  value={formula.brand}
                  onChange={handleFormulaChange('brand')}
                  placeholder="Ej: Wella, Koleston, L'Oréal…"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>

              {/* Color number */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Número de color
                </label>
                <input
                  type="text"
                  value={formula.color_number}
                  onChange={handleFormulaChange('color_number')}
                  placeholder="Ej: 7.1, 6/0, 5N…"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                />
              </div>

              {/* Developer volume */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3 h-3" />
                    Volumen de oxidante
                  </span>
                </label>
                <select
                  value={formula.developer_volume}
                  onChange={handleFormulaChange('developer_volume')}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow appearance-none"
                >
                  <option value="">Sin especificar</option>
                  <option value="10vol">10 vol</option>
                  <option value="20vol">20 vol</option>
                  <option value="30vol">30 vol</option>
                  <option value="40vol">40 vol</option>
                </select>
              </div>

              {/* Mix details */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Detalles de mezcla
                </label>
                <textarea
                  value={formula.mix_details}
                  onChange={handleFormulaChange('mix_details')}
                  placeholder="Proporciones, tiempo de exposición…"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow resize-none"
                />
              </div>

              {/* Application notes */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Notas de aplicación
                </label>
                <textarea
                  value={formula.application_notes}
                  onChange={handleFormulaChange('application_notes')}
                  placeholder="Técnica usada, zonas, observaciones…"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(`/clients/${clientId}`)}
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
            {saving ? 'Guardando…' : 'Guardar visita'}
          </button>
        </div>
      </form>
    </div>
  )
}
