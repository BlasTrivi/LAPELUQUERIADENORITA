import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, DollarSign, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface VisitRow {
  id: string
  visit_date: string
  price: number | null
  client_id: string
  service: { name: string } | null
  client: { first_name: string; last_name: string } | null
}

// ---------------------------------------------------------------------------
// Visit Card
// ---------------------------------------------------------------------------

function VisitCard({ visit, onClick }: { visit: VisitRow; onClick: () => void }) {
  const clientName = visit.client
    ? `${visit.client.first_name} ${visit.client.last_name}`
    : 'Cliente desconocido'

  const serviceName = visit.service?.name ?? 'Servicio desconocido'

  const formattedDate = (() => {
    try {
      // visit_date may be "YYYY-MM-DD" or ISO string
      const date = new Date(
        visit.visit_date.includes('T') ? visit.visit_date : `${visit.visit_date}T12:00:00`
      )
      return format(date, "d MMM yyyy", { locale: es })
    } catch {
      return visit.visit_date
    }
  })()

  const formattedPrice = visit.price != null ? `$${visit.price.toFixed(2)}` : null

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm border border-[#e5ddd5] p-4 flex items-start gap-3 transition-all hover:shadow-md hover:border-[#d4a0a0]/40 active:scale-[0.99]"
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f5e6d3]">
        <User className="h-5 w-5 text-[#d4a0a0]" strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{clientName}</p>
        <p className="text-xs text-[#8a7a6a] mt-0.5 truncate">{serviceName}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-[#8a7a6a]">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {formattedDate}
          </span>
          {formattedPrice && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-[#6ab57a]">
              <DollarSign className="h-3 w-3 shrink-0" />
              {visit.price?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function VisitsPage() {
  const navigate = useNavigate()
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVisits() {
      setLoading(true)
      const { data } = await supabase
        .from('visits')
        .select('*, service:services(name), client:clients(first_name, last_name)')
        .order('visit_date', { ascending: false })
        .limit(50)
      setVisits((data as VisitRow[]) ?? [])
      setLoading(false)
    }
    fetchVisits()
  }, [])

  return (
    <div className="min-h-screen bg-[#faf9f7] px-4 py-6 pb-24">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Visitas recientes</h1>
          <p className="mt-1 text-sm text-[#8a7a6a]">
            Últimas 50 visitas de todos los clientes
          </p>
        </div>

        {/* List */}
        {loading ? (
          <LoadingSpinner message="Cargando visitas..." />
        ) : visits.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Sin visitas"
            description="Todavía no hay visitas registradas. Cuando agregues una visita a un cliente, aparecerá acá."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {visits.map((visit) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                onClick={() => navigate(`/clients/${visit.client_id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
