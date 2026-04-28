import { useEffect, useMemo, useState } from 'react'
import { Building2, CheckCircle2, Clock, FolderKanban, Mail, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardNavbar } from '../../components/DashboardShell'
import { useAuth } from '../../context/AuthContext'
import { getStudentDashboard } from '../../services/studentService'
import { extractApiData, extractApiError } from '../../utils/apiUtils'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await getStudentDashboard()
        setDashboardData(extractApiData(response.data))
      } catch (apiError) {
        setError(extractApiError(apiError, 'Unable to load student dashboard data.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const profile = dashboardData?.profile || null
  const projects = dashboardData?.recentProjects || []

  const stats = useMemo(
    () => ({
      totalProjects: dashboardData?.totalProjects || 0,
      completedMilestones: dashboardData?.completedMilestones || 0,
      inProgressMilestones: (dashboardData?.totalMilestones || 0) - (dashboardData?.completedMilestones || 0),
      feedbackCount: dashboardData?.totalFeedbacks || 0,
    }),
    [dashboardData],
  )
  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Dashboard" name={user?.name || 'Student'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground">
              {user?.name?.split(' ').map((part) => part[0]).join('') || 'ST'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-card-foreground">{user?.name}</h2>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </span>
                {profile?.branch ? (
                  <span className="flex items-center gap-1.5">
                    <FolderKanban className="h-4 w-4" />
                    {profile.branch}
                  </span>
                ) : null}
                {profile?.college ? (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {profile.college}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Projects" value={stats.totalProjects} icon={<FolderKanban className="h-5 w-5" />} color="primary" />
          <StatCard label="Milestones Done" value={stats.completedMilestones} icon={<CheckCircle2 className="h-5 w-5" />} color="success" />
          <StatCard label="In Progress" value={stats.inProgressMilestones} icon={<Clock className="h-5 w-5" />} color="warning" />
          <StatCard label="Feedbacks" value={stats.feedbackCount} icon={<MessageSquare className="h-5 w-5" />} color="accent" />
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading dashboard...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Projects</h3>
            <Link to="/student/projects" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {!isLoading && projects.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
                No projects added yet. Start with Upload Project.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    accent: 'bg-accent/10 text-accent',
  }
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
    </div>
  )
}

function ProjectCard({ project }) {
  const normalizedStatus = project.status || 'PLANNED'
  const status = normalizedStatus
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

  const statusColor =
    status === 'Completed' ? 'bg-success/10 text-success' : status === 'In Progress' ? 'bg-warning/10 text-warning' : 'bg-accent/10 text-accent'

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <h4 className="text-base font-semibold text-card-foreground">{project.title}</h4>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>{status}</span>
      </div>
      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
      <div className="mt-auto">
        <div className="mb-1.5 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-card-foreground">{project.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
        </div>
      </div>
    </div>
  )
}
