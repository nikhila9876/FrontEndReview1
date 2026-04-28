import { useEffect, useMemo, useState } from 'react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { addMilestoneToStudent, deleteMilestone, getAllStudents, updateMilestone } from '../../services/adminService'
import { getMilestonesByStudentId } from '../../services/milestoneService'
import { useAuth } from '../../context/AuthContext'

const defaultForm = {
  title: '',
  description: '',
  status: 'PENDING',
}

function formatStatus(status) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function AdminMilestones() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [milestones, setMilestones] = useState([])
  const [formData, setFormData] = useState(defaultForm)
  const [editingMilestoneId, setEditingMilestoneId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedStudent = useMemo(
    () => students.find((student) => String(student.id) === String(selectedStudentId)),
    [students, selectedStudentId],
  )

  useEffect(() => {
    const loadStudents = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await getAllStudents()
        const allStudents = response.data || []
        setStudents(allStudents)
        if (allStudents.length > 0) {
          setSelectedStudentId(String(allStudents[0].id))
        }
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Unable to load students.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudents()
  }, [])

  useEffect(() => {
    if (!selectedStudentId) {
      setMilestones([])
      return
    }

    const loadMilestones = async () => {
      setError('')
      try {
        const response = await getMilestonesByStudentId(selectedStudentId)
        setMilestones(response.data || [])
      } catch (apiError) {
        const message = apiError?.response?.data?.message || 'Unable to load milestones.'
        setError(message)
      }
    }

    loadMilestones()
  }, [selectedStudentId])

  const resetForm = () => {
    setFormData(defaultForm)
    setEditingMilestoneId(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedStudentId) {
      setError('Select a student first.')
      return
    }

    setIsSaving(true)
    setError('')
    setSuccess('')
    try {
      if (editingMilestoneId) {
        await updateMilestone(editingMilestoneId, formData)
        setSuccess('Milestone updated successfully.')
      } else {
        await addMilestoneToStudent(selectedStudentId, formData)
        setSuccess('Milestone added successfully.')
      }

      const response = await getMilestonesByStudentId(selectedStudentId)
      setMilestones(response.data || [])
      resetForm()
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Unable to save milestone.'
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (milestone) => {
    setEditingMilestoneId(milestone.id)
    setFormData({
      title: milestone.title,
      description: milestone.description,
      status: milestone.status,
    })
  }

  const handleDelete = async (milestoneId) => {
    setError('')
    setSuccess('')
    try {
      await deleteMilestone(milestoneId)
      setMilestones((prev) => prev.filter((milestone) => milestone.id !== milestoneId))
      setSuccess('Milestone deleted successfully.')
      if (editingMilestoneId === milestoneId) {
        resetForm()
      }
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Unable to delete milestone.'
      setError(message)
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Milestones" name={user?.name || 'Admin'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Milestone Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">Add, edit, and delete student milestones</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-card-foreground">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(event) => setSelectedStudentId(event.target.value)}
            className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground">
            {editingMilestoneId ? 'Edit Milestone' : 'Add Milestone'}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-card-foreground">Title</label>
              <input
                required
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-card-foreground">Status</label>
              <select
                value={formData.status}
                onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value }))}
                className="h-11 rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label className="text-sm font-medium text-card-foreground">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
              className="rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : editingMilestoneId ? 'Update Milestone' : 'Add Milestone'}
            </button>
            {editingMilestoneId ? (
              <button
                type="button"
                onClick={resetForm}
                className="h-10 rounded-lg border border-border px-4 text-sm font-semibold text-card-foreground"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>

        {isLoading ? <p className="text-sm text-muted-foreground">Loading data...</p> : null}
        {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
        {success ? <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-base font-semibold text-card-foreground">
              {selectedStudent ? `${selectedStudent.name}'s Milestones` : 'Milestones'}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {milestones.map((milestone) => (
                  <tr key={milestone.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4 text-sm font-medium text-card-foreground">{milestone.title}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{formatStatus(milestone.status)}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{milestone.description}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(milestone)}
                          className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(milestone.id)}
                          className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && milestones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-sm text-muted-foreground">
                      No milestones found for this student.
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
