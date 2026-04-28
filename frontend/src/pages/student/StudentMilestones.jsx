import { useEffect, useState } from 'react'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { getMilestonesByStudentId } from '../../services/milestoneService'
import { useAuth } from '../../context/AuthContext'

function statusStyles(status) {
  if (status === 'COMPLETED') {
    return {
      badge: 'bg-success/10 text-success',
      icon: <CheckCircle2 className="h-4 w-4" />,
      iconWrap: 'bg-success text-success-foreground',
    }
  }
  if (status === 'IN_PROGRESS') {
    return {
      badge: 'bg-warning/10 text-warning',
      icon: <Clock className="h-4 w-4" />,
      iconWrap: 'bg-warning text-warning-foreground',
    }
  }
  return {
    badge: 'bg-muted text-muted-foreground',
    icon: <Circle className="h-4 w-4" />,
    iconWrap: 'bg-muted text-muted-foreground',
  }
}

function statusLabel(status) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function StudentMilestones() {
  const { user } = useAuth()
  const [milestones, setMilestones] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.id) return

    const loadMilestones = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await getMilestonesByStudentId(user.id)
        setMilestones(response.data || [])
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Unable to load milestones.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    // Mandatory flow: fetch milestones using /api/milestones/student/{id}
    loadMilestones()
  }, [user?.id])

  const completedCount = milestones.filter((milestone) => milestone.status === 'COMPLETED').length
  const completionPct = milestones.length === 0 ? 0 : Math.round((completedCount / milestones.length) * 100)

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Milestones" name={user?.name || 'Student'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Project Milestones</h2>
          <p className="mt-1 text-sm text-muted-foreground">Track milestones dynamically from backend APIs</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Completion Progress</p>
            <span className="text-sm font-semibold text-card-foreground">{completionPct}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading milestones...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-col gap-4">
          {milestones.map((milestone) => {
            const style = statusStyles(milestone.status)
            return (
              <div key={milestone.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-base font-semibold text-card-foreground">{milestone.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>{statusLabel(milestone.status)}</span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{milestone.description}</p>
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${style.iconWrap}`}>{style.icon}</div>
              </div>
            )
          })}

          {!isLoading && milestones.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No milestones assigned yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
