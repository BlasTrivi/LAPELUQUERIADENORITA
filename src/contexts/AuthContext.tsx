import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

// ---------------------------------------------------------------------------
// Default services seeded on sign-up
// ---------------------------------------------------------------------------

const DEFAULT_SERVICES = [
  'Corte',
  'Color',
  'Mechas',
  'Alisado',
  'Brushing',
  'Tratamiento capilar',
  'Peinado',
]

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch profile row for the given user id
  async function fetchProfile(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error.message)
      setProfile(null)
      return
    }

    setProfile(data as Profile)
  }

  // Listen to auth state changes (login, logout, token refresh, etc.)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  async function signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(
    email: string,
    password: string,
    fullName: string,
  ): Promise<void> {
    // 1. Create the auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (signUpError) throw signUpError

    const userId = data.user?.id
    if (!userId) throw new Error('No se pudo obtener el ID del usuario.')

    // 2. Insert profile row
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      role: 'admin',
    } as never)
    if (profileError) throw profileError

    // 3. Seed default services for this user
    const services = DEFAULT_SERVICES.map((name) => ({
      name,
      user_id: userId,
    }))

    const { error: servicesError } = await supabase
      .from('services')
      .insert(services as never)
    if (servicesError) {
      // Non-fatal: log but don't block auth
      console.error('Error seeding default services:', servicesError.message)
    }
  }

  async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  // ---------------------------------------------------------------------------
  // Value
  // ---------------------------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
