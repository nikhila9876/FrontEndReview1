import { useEffect, useState } from 'react'
import { Calendar, MessageSquare, Send } from 'lucide-react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { getAllFeedbacks, getAllStudents, giveFeedbackToStudent } from '../../services/adminService'
import { getProjectsByStudent } from '../../services/projectService'
import { useAuth } from '../../context/AuthContext'

export default function AdminFeedback() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [studentsResponse, feedbacksResponse] = await Promise.all([getAllStudents(), getAllFeedbacks()])
        const allStudents = studentsResponse.data || []
        setStudents(allStudents)
        setFeedbacks(feedbacksResponse.data || [])
        if (allStudents.length > 0) {
          setSelectedStudentId(String(allStudents[0].id))
        }
      } catch (apiError) {
        const messageFromApi = apiError?.response?.data?.message || 'Unable to load feedback data.'
        setError(messageFromApi)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  useEffect(() => {
    const loadProjectsForStudent = async () => {
      if (!selectedStudentId) {
        setProjects([])
        setSelectedProjectId('')
        return
      }

      try {
        const projectsResponse = await getProjectsByStudent(selectedStudentId)
        const studentProjects = projectsResponse.data || []
        setProjects(studentProjects)
        setSelectedProjectId(studentProjects.length > 0 ? String(studentProjects[0].id) : '')
      } catch {
        setProjects([])
        setSelectedProjectId('')
      }
    }

    loadProjectsForStudent()
  }, [selectedStudentId])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedStudentId) {
      setError('Please select a student.')
      return
    }
    if (!message.trim()) {
      setError('Feedback message is required.')
      return
    }
    if (!selectedProjectId) {
      setError('Please select a project.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      await giveFeedbackToStudent(selectedStudentId, {
        projectId: Number(selectedProjectId),
        message: message.trim(),
      })
      const feedbackResponse = await getAllFeedbacks()
      setFeedbacks(feedbackResponse.data || [])
      setMessage('')
      setSuccess('Feedback submitted successfully.')
    } catch (apiError) {
      const messageFromApi = apiError?.response?.data?.message || 'Unable to submit feedback.'
      setError(messageFromApi)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Feedback" name={user?.name || 'Admin'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-card-foreground">Give Feedback</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Submit feedback for a student</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-card-foreground">Student</label>
              <select
                value={selectedStudentId}
                onChange={(event) => setSelectedStudentId(event.target.value)}
                className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-card-foreground">Select Project</label>
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                disabled={!selectedStudentId || projects.length === 0}
              >
                {projects.length === 0 ? (
                  <option value="">No projects found for this student</option>
                ) : null}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title || project.name || `Project #${project.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-card-foreground">Feedback Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Write your feedback for the student..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading feedbacks...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        {success ? <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

        <div>
          <h3 className="mb-4 text-lg font-semibold text-foreground">All Feedbacks</h3>
          <div className="flex flex-col gap-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-card-foreground">{feedback.studentName}</h4>
                      <p className="text-xs text-muted-foreground">
                        Project: {feedback.projectName || 'N/A'}
                      </p>
                      <p className="text-xs text-muted-foreground">By {feedback.adminName}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="rounded-lg bg-secondary/50 p-4">
                  <p className="text-sm leading-relaxed text-card-foreground">{feedback.message}</p>
                </div>
              </div>
            ))}
            {!isLoading && feedbacks.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
                No feedback has been submitted yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
