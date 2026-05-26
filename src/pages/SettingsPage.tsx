import { useState } from 'react'
import { User, LogOut, Scissors, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// Row helper
// ---------------------------------------------------------------------------

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-[#e5ddd5] last:border-0">
      <span className="text-xs font-medium text-[#8a7a6a] uppercase tracking-wider">{label}</span>
      <span className="text-sm text-[#1a1a1a] font-medium">{value || '—'}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] px-4 py-6 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebe5]">
            <Settings className="h-5 w-5 text-[#8a7a6a]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Ajustes</h1>
            <p className="text-sm text-[#8a7a6a]">Tu perfil y opciones de la app</p>
          </div>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5ddd5] p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d4a0a0]">
              <User className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a]">
                {profile?.full_name || 'Sin nombre'}
              </p>
              <p className="text-xs text-[#8a7a6a]">{user?.email || '—'}</p>
            </div>
          </div>

          <div className="divide-y divide-[#e5ddd5]">
            <InfoRow label="Nombre" value={profile?.full_name || ''} />
            <InfoRow label="Correo electrónico" value={user?.email || ''} />
            <InfoRow label="Rol" value={profile?.role === 'admin' ? 'Administradora' : profile?.role || '—'} />
          </div>
        </div>

        {/* App info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5ddd5] p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5e6d3]">
              <Scissors className="h-5 w-5 text-[#d4a0a0]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-[#1a1a1a]">La Peluquería de Norita</p>
              <p className="text-xs text-[#8a7a6a]">v1.0 · Sistema de gestión</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#e55555] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#cc4444] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {signingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}
