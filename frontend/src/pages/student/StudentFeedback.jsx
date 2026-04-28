import { useEffect, useState } from 'react'
import { Calendar, MessageSquare, User } from 'lucide-react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { getOwnFeedbacks } from '../../services/feedbackService'
import { useAuth } from '../../context/AuthContext'

export default function StudentFeedback() {
  const { user } = useAuth()
  const [feedbacks, setFeedbacks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFeedbacks = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await getOwnFeedbacks()
        setFeedbacks(response.data || [])
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Unable to load feedback.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeedbacks()
  }, [])

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Feedback" name={user?.name || 'Student'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Admin Feedback</h2>
          <p className="mt-1 text-sm text-muted-foreground">Review feedback shared by your admin</p>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading feedback...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-col gap-4">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-card-foreground">Feedback #{feedback.id}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {feedback.adminName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(feedback.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm leading-relaxed text-card-foreground">{feedback.message}</p>
              </div>
            </div>
          ))}

          {!isLoading && feedbacks.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
              No feedback received yet.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
