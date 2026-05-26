import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Users, Scissors, CalendarDays, Settings, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { path: '/', icon: Users, label: 'Clientes' },
  { path: '/services', icon: Scissors, label: 'Servicios' },
  { path: '/visits', icon: CalendarDays, label: 'Visitas' },
  { path: '/settings', icon: Settings, label: 'Config' },
]

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()

  return (
    <div className="flex flex-col min-h-svh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Scissors className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-tight">La Peluquería</h1>
            <p className="text-xs text-muted-foreground leading-tight">de Norita</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <span className="text-xs text-muted-foreground hidden sm:block">
              {profile.full_name}
            </span>
          )}
          <button
            onClick={signOut}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path)
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
