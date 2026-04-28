import { useEffect, useState } from 'react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { getProjects } from '../../services/projectService'
import { useAuth } from '../../context/AuthContext'
import { approveProject } from '../../services/adminService'
import { extractApiError } from '../../utils/apiUtils'

function formatStatus(status) {
  if (!status) return 'Planned'
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function AdminProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getProjects()
      setProjects(response.data || [])
    } catch (apiError) {
      setError(extractApiError(apiError, 'Unable to load projects right now.'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenProject = (fileUrl) => {
    setError('')
    if (!fileUrl) {
      setError('No file uploaded for this project')
      return
    }
    const targetUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://')
      ? fileUrl
      : `${backendOrigin}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

  const handleApproveProject = async (projectId) => {
    setError('')
    setActionLoadingId(projectId)
    try {
      await approveProject(projectId)
      await loadProjects()
    } catch (apiError) {
      setError(extractApiError(apiError, 'Unable to approve project.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Projects" name={user?.name || 'Admin'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Project Review</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review and manage all student projects</p>
          </div>
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{projects.length} Projects</span>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading projects...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Project</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Progress</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">File</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const statusLabel = formatStatus(project.status)
                  const statusColor =
                    statusLabel === 'Completed' || statusLabel === 'Approved'
                      ? 'bg-success/10 text-success'
                      : statusLabel === 'In Progress'
                        ? 'bg-warning/10 text-warning'
                        : 'bg-accent/10 text-accent'

                  return (
                    <tr key={project.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 text-sm font-medium text-card-foreground">{project.ownerName}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{project.title}</span>
                          {project.deleted ? <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">Deleted</span> : null}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${project.progress}%` }} />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleOpenProject(project.fileUrl)}
                          className="rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
                        >
                          Open
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleApproveProject(project.id)}
                          disabled={actionLoadingId === project.id || project.status === 'APPROVED' || project.deleted}
                          className="rounded-md border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success transition hover:bg-success/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {project.status === 'APPROVED' ? 'Approved' : actionLoadingId === project.id ? 'Approving...' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {!isLoading && !error && projects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-center text-sm text-muted-foreground">
                      No projects available yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
