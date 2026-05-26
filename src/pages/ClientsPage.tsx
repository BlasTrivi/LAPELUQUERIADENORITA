import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users, Phone } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import EmptyState from '@/components/EmptyState'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function ClientsPage() {
  const navigate = useNavigate()
  const { clients, loading } = useClients()
  const [query, setQuery] = useState('')

  const filtered = clients.filter((c) => {
    const q = query.toLowerCase()
    const fullName = `${c.first_name} ${c.last_name ?? ''}`.toLowerCase()
    const phone = (c.phone ?? '').toLowerCase()
    return fullName.includes(q) || phone.includes(q)
  })

  const getInitials = (firstName: string, lastName?: string | null) => {
    const first = firstName.charAt(0).toUpperCase()
    const last = lastName?.charAt(0).toUpperCase() ?? ''
    return last ? `${first}${last}` : first
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-rose-200 text-rose-700',
      'bg-pink-200 text-pink-700',
      'bg-purple-200 text-purple-700',
      'bg-indigo-200 text-indigo-700',
      'bg-amber-200 text-amber-700',
      'bg-emerald-200 text-emerald-700',
      'bg-sky-200 text-sky-700',
      'bg-orange-200 text-orange-700',
    ]
    const idx = name.charCodeAt(0) % colors.length
    return colors[idx]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-28">
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={query ? 'Sin resultados' : 'Todavía no hay clientas'}
            description={
              query
                ? `No encontramos a nadie con "${query}".`
                : 'Agregá tu primera clienta con el botón de abajo.'
            }
            action={
              !query
                ? { label: 'Agregar clienta', onClick: () => navigate('/clients/new') }
                : undefined
            }
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((client) => (
              <li key={client.id}>
                <button
                  onClick={() => navigate(`/clients/${client.id}`)}
                  className="w-full flex items-center gap-4 p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 active:scale-[0.98] transition-all text-left"
                >
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${getAvatarColor(client.first_name)}`}
                  >
                    {getInitials(client.first_name, client.last_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {client.first_name} {client.last_name ?? ''}
                    </p>
                    {client.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </p>
                    )}
                  </div>

                  {/* Chevron hint */}
                  <div className="w-2 h-2 rounded-full bg-muted shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAB — above bottom nav */}
      <button
        onClick={() => navigate('/clients/new')}
        className="fixed bottom-20 right-4 w-14 h-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 z-50"
        aria-label="Agregar clienta"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
