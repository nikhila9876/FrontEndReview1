import { Outlet } from 'react-router-dom'
import { DashboardSidebar } from './DashboardShell'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar role="admin" />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
