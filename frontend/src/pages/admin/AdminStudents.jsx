import { useEffect, useState } from 'react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { getAllStudents } from '../../services/adminService'
import { useAuth } from '../../context/AuthContext'

export default function AdminStudents() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await getAllStudents()
        setStudents(response.data || [])
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Unable to load students.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudents()
  }, [])

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Students" name={user?.name || 'Admin'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">All Students</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage and monitor student progress</p>
          </div>
          <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{students.length} Students</span>
        </div>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading students...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Student</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {student.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span className="text-sm font-medium text-card-foreground">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{student.email}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{student.role}</span>
                    </td>
                  </tr>
                ))}
                {!isLoading && !error && students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-sm text-muted-foreground">
                      No students found.
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
