import { useEffect, useState } from 'react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { deleteProject, getProjectsByStudent, updateProject } from '../../services/projectService'
import { useAuth } from '../../context/AuthContext'
import { extractApiError } from '../../utils/apiUtils'

function formatStatus(status) {
  if (!status) return 'Planned'
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function StudentProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    technology: '',
    progress: 0,
    status: 'IN_PROGRESS',
  })
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'
  const backendOrigin = apiBaseUrl.replace(/\/api\/?$/, '')

  const loadProjects = async () => {
    if (!user?.id) return
    setIsLoading(true)
    setError('')
    try {
      const response = await getProjectsByStudent(user.id)
      setProjects(response.data || [])
    } catch (apiError) {
      setError(extractApiError(apiError, 'Unable to load projects right now.'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      loadProjects()
    }
  }, [user?.id])

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

  const handleStartEdit = (project) => {
    setError('')
    setEditingProjectId(project.id)
    setEditForm({
      title: project.title || '',
      description: project.description || '',
      technology: project.technology || '',
      progress: project.progress || 0,
      status: project.status || 'IN_PROGRESS',
    })
  }

  const handleCancelEdit = () => {
    setEditingProjectId(null)
  }

  const handleSaveEdit = async (projectId) => {
    setError('')
    setActionLoadingId(projectId)
    try {
      await updateProject(projectId, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        technology: editForm.technology.trim(),
        progress: Number(editForm.progress),
        status: editForm.status,
      })
      setEditingProjectId(null)
      await loadProjects()
    } catch (apiError) {
      setError(extractApiError(apiError, 'Unable to update project.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDeleteProject = async (projectId) => {
    setError('')
    setActionLoadingId(projectId)
    try {
      await deleteProject(projectId)
      await loadProjects()
    } catch (apiError) {
      setError(extractApiError(apiError, 'Unable to delete project.'))
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="My Projects" name={user?.name || 'Student'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">All Projects</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage and track your project progress</p>
          </div>
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{projects.length} Projects</span>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading projects...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        {!isLoading && !error && projects.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            No projects found. Add one from the Upload Project page.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {projects.map((project) => {
            const statusLabel = formatStatus(project.status)
            const statusColor =
              statusLabel === 'Completed' || statusLabel === 'Approved'
                ? 'bg-success/10 text-success'
                : statusLabel === 'In Progress'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-accent/10 text-accent'

            return (
              <div key={project.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-semibold text-card-foreground">{project.title}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor}`}>{statusLabel}</span>
                </div>
                <p className="mb-2 text-sm text-muted-foreground">{project.description}</p>
                {project.technology ? <p className="mb-3 text-xs text-muted-foreground">Tech: {project.technology}</p> : null}
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-card-foreground">{project.progress}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenProject(project.fileUrl)}
                    className="h-9 rounded-lg border border-primary/30 bg-primary/5 px-3 text-sm font-medium text-primary transition hover:bg-primary/10"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(project)}
                    className="h-9 rounded-lg border border-accent/30 bg-accent/10 px-3 text-sm font-medium text-accent transition hover:bg-accent/20"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={actionLoadingId === project.id}
                    className="h-9 rounded-lg border border-destructive/30 bg-destructive/10 px-3 text-sm font-medium text-destructive transition hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoadingId === project.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

                {editingProjectId === project.id ? (
                  <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-background/60 p-3">
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                      className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <input
                      type="text"
                      value={editForm.technology}
                      onChange={(event) => setEditForm((prev) => ({ ...prev, technology: event.target.value }))}
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={editForm.progress}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, progress: event.target.value }))}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <select
                        value={editForm.status}
                        onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="PLANNED">Planned</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="ON_HOLD">On Hold</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(project.id)}
                        disabled={actionLoadingId === project.id}
                        className="h-9 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoadingId === project.id ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="h-9 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
