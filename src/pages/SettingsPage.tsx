import { useState } from 'react'
import { User, LogOut, Settings, Loader2, Check, Edit3 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const inputClass =
  'w-full rounded-xl border border-[#e5ddd5] bg-[#faf9f7] px-3.5 py-3 text-base text-[#1a1a1a] placeholder-[#8a7a6a] outline-none transition focus:border-[#d4a0a0] focus:bg-white focus:ring-2 focus:ring-[#d4a0a0]/20'

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.full_name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startEdit() {
    setName(profile?.full_name ?? '')
    setEmail(user?.email ?? '')
    setEditing(true)
    setSuccess(false)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Update name in profiles table
      if (name.trim() !== (profile?.full_name ?? '')) {
        const { error: profileErr } = await supabase
          .from('profiles')
          .update({ full_name: name.trim() } as never)
          .eq('id', user!.id)
        if (profileErr) throw profileErr
      }

      // Update email in auth
      if (email.trim() !== (user?.email ?? '')) {
        const { error: emailErr } = await supabase.auth.updateUser({
          email: email.trim(),
        })
        if (emailErr) throw emailErr
      }

      setSuccess(true)
      setEditing(false)
      // Reload to reflect changes
      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <div className="px-4 py-6 pb-24">
      <div className="mx-auto max-w-sm">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebe5]">
            <Settings className="h-5 w-5 text-[#8a7a6a]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">Ajustes</h1>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5ddd5] p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
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
            {!editing && (
              <button
                onClick={startEdit}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebe5] text-[#8a7a6a] active:scale-90 active:bg-[#e5ddd5] transition"
                aria-label="Editar perfil"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4 pt-2 border-t border-[#e5ddd5]">
              <div>
                <label className="block text-xs font-medium text-[#8a7a6a] uppercase tracking-wider mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#8a7a6a] uppercase tracking-wider mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              {error && (
                <p className="rounded-xl bg-[#e55555]/10 px-4 py-3 text-sm text-[#e55555]">
                  {error}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#6ab57a] px-3 py-3 text-base font-medium text-white transition active:scale-[0.97] disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Guardar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 rounded-xl border border-[#e5ddd5] bg-[#f0ebe5] px-3 py-3 text-base font-medium text-[#8a7a6a] transition active:scale-[0.97]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#e5ddd5] space-y-3">
              <div className="py-2">
                <span className="text-xs font-medium text-[#8a7a6a] uppercase tracking-wider">Nombre</span>
                <p className="text-sm text-[#1a1a1a] font-medium mt-0.5">{profile?.full_name || '—'}</p>
              </div>
              <div className="py-2">
                <span className="text-xs font-medium text-[#8a7a6a] uppercase tracking-wider">Correo electrónico</span>
                <p className="text-sm text-[#1a1a1a] font-medium mt-0.5">{user?.email || '—'}</p>
              </div>
            </div>
          )}

          {success && (
            <p className="mt-3 rounded-xl bg-[#6ab57a]/10 px-4 py-3 text-sm text-[#6ab57a] font-medium">
              Cambios guardados correctamente.
            </p>
          )}
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#e55555] py-3.5 text-base font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
