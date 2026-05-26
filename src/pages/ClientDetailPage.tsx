import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft,
  Edit3,
  Trash2,
  Phone,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Palette,
  Plus,
  User,
  Droplets,
  Scissors,
  Clock,
} from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { useVisits } from '@/hooks/useVisits'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { clients, loading: clientsLoading, deleteClient } = useClients()
  const { visits, loading: visitsLoading, fetchVisits } = useVisits(id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const client = clients.find((c) => c.id === id)

  useEffect(() => {
    if (id) fetchVisits(id)
  }, [id, fetchVisits])

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteClient(id)
      navigate('/')
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const formatVisitDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "d 'de' MMMM, yyyy", { locale: es })
    } catch {
      return dateStr
    }
  }

  const formatPrice = (price: number | null) => {
    if (price == null) return null
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(price)
  }

  if (clientsLoading) return <LoadingSpinner />

  if (!client) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground text-sm">Clienta no encontrada.</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium text-primary underline"
        >
          Volver al inicio
        </button>
      </div>
    )
  }

  const initials =
    client.first_name.charAt(0).toUpperCase() +
    (client.last_name?.charAt(0).toUpperCase() ?? '')

  return (
    <div className="pb-24">
      {/* Top bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground active:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Clientas
        </button>

        <button
          onClick={() => navigate(`/clients/${id}/edit`)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted active:bg-accent text-foreground text-sm font-medium transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Editar
        </button>
      </div>

      {/* Profile card */}
      <div className="px-4 pt-6 pb-4">
        <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center font-bold text-lg text-primary-dark shrink-0">
              {initials || <User className="w-7 h-7" />}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground">
                {client.first_name} {client.last_name ?? ''}
              </h1>

              <div className="mt-2 space-y-1.5">
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    {client.phone}
                  </a>
                )}
                {client.email && (
                  <a
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-primary" />
                    {client.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          {client.notes && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{client.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Last visit + color summary — HERO SECTION */}
      {!visitsLoading && visits.length > 0 && (() => {
        const lastVisit = visits[0]
        const lastColor = visits.find((v) => v.color_formula)?.color_formula

        return (
          <div className="px-4 mb-4 space-y-3">
            {/* Last visit card */}
            <div className="bg-gradient-to-br from-primary/10 via-accent/30 to-secondary/40 rounded-2xl border border-primary/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-primary" />
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider">Última visita</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-foreground">
                    {lastVisit.service?.name ?? 'Servicio'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatVisitDate(lastVisit.visit_date)}
                  </p>
                </div>
                {lastVisit.price != null && (
                  <p className="text-2xl font-bold text-foreground">
                    {formatPrice(lastVisit.price)}
                  </p>
                )}
              </div>
              {lastVisit.notes && (
                <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-primary/10 leading-relaxed">
                  {lastVisit.notes}
                </p>
              )}
            </div>

            {/* Last color formula card */}
            {lastColor && (
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl border border-purple-200/40 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xs font-bold text-purple-500 uppercase tracking-wider">Última fórmula de color</h2>
                </div>

                {/* Color number + brand — BIG */}
                <div className="flex items-baseline gap-3 mb-4">
                  {lastColor.color_number && (
                    <span className="text-4xl font-black text-foreground tracking-tight">
                      {lastColor.color_number}
                    </span>
                  )}
                  {lastColor.brand && (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {lastColor.brand}
                    </span>
                  )}
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {lastColor.developer_volume && (
                    <div className="bg-white/60 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Droplets className="w-3.5 h-3.5 text-purple-400" />
                        <p className="text-[10px] font-semibold text-purple-400 uppercase">Oxidante</p>
                      </div>
                      <p className="text-base font-bold text-foreground">{lastColor.developer_volume}</p>
                    </div>
                  )}
                  {lastColor.mix_details && (
                    <div className="bg-white/60 rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Scissors className="w-3.5 h-3.5 text-purple-400" />
                        <p className="text-[10px] font-semibold text-purple-400 uppercase">Mezcla</p>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-snug">{lastColor.mix_details}</p>
                    </div>
                  )}
                </div>

                {lastColor.application_notes && (
                  <div className="mt-3 bg-white/60 rounded-xl px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-purple-400 uppercase mb-1">Notas de aplicación</p>
                    <p className="text-sm text-foreground leading-relaxed">{lastColor.application_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })()}

      {/* Visit history */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Historial de Visitas</h2>
          <button
            onClick={() => navigate(`/clients/${id}/visits/new`)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva visita
          </button>
        </div>

        {visitsLoading ? (
          <LoadingSpinner message="Cargando visitas…" />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Sin visitas aún"
            description="Registrá la primera visita de esta clienta."
            action={{
              label: 'Registrar visita',
              onClick: () => navigate(`/clients/${id}/visits/new`),
            }}
          />
        ) : (
          <ul className="space-y-3">
            {visits.map((visit) => (
              <li
                key={visit.id}
                className="bg-card rounded-2xl border border-border shadow-sm p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {formatVisitDate(visit.visit_date)}
                    </div>
                    {visit.service && (
                      <p className="text-sm text-muted-foreground mt-0.5 ml-5">
                        {visit.service.name}
                      </p>
                    )}
                  </div>

                  {visit.price != null && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-foreground shrink-0">
                      <DollarSign className="w-3.5 h-3.5 text-primary" />
                      {formatPrice(visit.price)}
                    </div>
                  )}
                </div>

                {visit.color_formula && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-sm font-bold text-purple-700 border border-purple-100">
                      <Palette className="w-3.5 h-3.5" />
                      {visit.color_formula.color_number || '—'}
                    </span>
                    {visit.color_formula.brand && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-pink-50 text-sm font-medium text-pink-700 border border-pink-100">
                        {visit.color_formula.brand}
                      </span>
                    )}
                    {visit.color_formula.developer_volume && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-accent text-sm font-medium text-accent-foreground border border-border">
                        <Droplets className="w-3 h-3" />
                        {visit.color_formula.developer_volume}
                      </span>
                    )}
                  </div>
                )}

                {visit.notes && (
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed border-t border-border pt-2">
                    {visit.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete section */}
      <div className="px-4 mt-8">
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-destructive/30 text-destructive hover:bg-destructive/5 text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar clienta
          </button>
        ) : (
          <div className="bg-card rounded-2xl border border-destructive/30 p-4 text-center space-y-3">
            <p className="text-sm font-semibold text-foreground">
              ¿Eliminar a {client.first_name}?
            </p>
            <p className="text-xs text-muted-foreground">
              Se borrará toda su información y el historial de visitas. Esta acción no se puede
              deshacer.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
