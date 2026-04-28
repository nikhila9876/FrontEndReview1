import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Upload,
  Target,
  Briefcase,
  MessageSquare,
  LogOut,
  Users,
  ClipboardList,
  GraduationCap,
  Menu,
  X,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const studentLinks = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/projects', label: 'My Projects', icon: FolderKanban },
  { href: '/student/upload', label: 'Upload Project', icon: Upload },
  { href: '/student/milestones', label: 'Milestones', icon: Target },
  { href: '/student/profile', label: 'Profile', icon: UserRound },
  { href: '/student/portfolio', label: 'Portfolio', icon: Briefcase },
  { href: '/student/feedback', label: 'Feedback', icon: MessageSquare },
]

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/milestones', label: 'Milestones', icon: Target },
  { href: '/admin/feedback', label: 'Feedback', icon: ClipboardList },
  { href: '/admin/profile', label: 'Profile', icon: UserRound },
]

export function DashboardSidebar({ role }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()
  const links = role === 'student' ? studentLinks : adminLinks
  const name = user?.name || (role === 'student' ? 'Student User' : 'Admin User')
  const roleLabel = role === 'student' ? 'Student' : 'Administrator'

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">FSAD Portal</p>
          <p className="text-xs text-sidebar-foreground/60">{roleLabel}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <link.icon className="h-[18px] w-[18px] shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="mb-3 flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-bold text-sidebar-primary">
            {name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{name}</p>
            <p className="text-xs text-sidebar-foreground/50">{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow-lg lg:hidden"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">{sidebarContent}</div>
      </aside>
    </>
  )
}

export function DashboardNavbar({ title, name }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-8">
        <h1 className="pl-12 font-heading text-lg font-bold text-card-foreground lg:pl-0">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-card-foreground">{name}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {name.split(' ').map((n) => n[0]).join('')}
          </div>
        </div>
      </div>
    </header>
  )
}
