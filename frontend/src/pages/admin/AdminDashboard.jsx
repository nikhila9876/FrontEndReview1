import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, FolderKanban, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DashboardNavbar } from '../../components/DashboardShell'
import { getAllFeedbacks, getAllStudents } from '../../services/adminService'
import { getMilestonesByStudentId } from '../../services/milestoneService'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [milestoneCount, setMilestoneCount] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      setError('')
      try {
        const [studentsResponse, feedbacksResponse] = await Promise.all([getAllStudents(), getAllFeedbacks()])
        const allStudents = studentsResponse.data || []
        setStudents(allStudents)
        setFeedbacks(feedbacksResponse.data || [])

        const milestoneResponses = await Promise.all(
          allStudents.map((student) => getMilestonesByStudentId(student.id).catch(() => ({ data: [] }))),
        )
        const milestoneList = milestoneResponses.flatMap((response) => response.data || [])
        setMilestoneCount(milestoneList.length)
        setPendingCount(milestoneList.filter((milestone) => milestone.status !== 'COMPLETED').length)
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Unable to load admin dashboard.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const recentStudents = useMemo(() => students.slice(0, 5), [students])
  const recentFeedbacks = useMemo(() => feedbacks.slice(0, 5), [feedbacks])

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Admin Dashboard" name={user?.name || 'Admin'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Students" value={students.length} icon={<Users className="h-5 w-5" />} colorClass="bg-primary/10 text-primary" />
          <StatCard
            label="Total Milestones"
            value={milestoneCount}
            icon={<FolderKanban className="h-5 w-5" />}
            colorClass="bg-accent/10 text-accent"
          />
          <StatCard
            label="Pending Milestones"
            value={pendingCount}
            icon={<AlertCircle className="h-5 w-5" />}
            colorClass="bg-warning/10 text-warning"
          />
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading dashboard...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-card-foreground">Recent Students</h3>
            <Link to="/admin/students" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                </tr>
              </thead>
              <tbody>
                {recentStudents.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3.5 text-sm font-medium text-card-foreground">{student.name}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{student.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-card-foreground">Recent Feedbacks</h3>
            <Link to="/admin/feedback" className="text-sm font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentFeedbacks.map((feedback) => (
              <div key={feedback.id} className="px-5 py-4">
                <p className="text-sm font-medium text-card-foreground">{feedback.studentName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{feedback.message}</p>
              </div>
            ))}
            {!isLoading && recentFeedbacks.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">No feedback entries yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, colorClass }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClass}`}>{icon}</div>
      </div>
      <p className="mt-2 text-3xl font-bold text-card-foreground">{value}</p>
    </div>
  )
}
