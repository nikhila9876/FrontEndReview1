import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { DashboardNavbar } from './DashboardShell'
import { getCurrentProfile, updateCurrentProfile } from '../services/profileService'
import { getStudentProfile, updateStudentProfile } from '../services/studentService'
import { useAuth } from '../context/AuthContext'
import { extractApiData, extractApiError } from '../utils/apiUtils'

export default function ProfileEditor({ title }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    bio: '',
    phone: '',
    branch: '',
    college: '',
    githubUrl: '',
    linkedinUrl: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = user?.role === 'STUDENT' ? await getStudentProfile() : await getCurrentProfile()
        const profile = extractApiData(response.data) || {}
        setFormData({
          bio: profile.bio || '',
          phone: profile.phone || '',
          branch: profile.branch || '',
          college: profile.college || '',
          githubUrl: profile.githubUrl || '',
          linkedinUrl: profile.linkedinUrl || '',
        })
      } catch (apiError) {
        setError(extractApiError(apiError, 'Unable to load profile.'))
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user?.role])

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)
    try {
      if (user?.role === 'STUDENT') {
        await updateStudentProfile(formData)
      } else {
        await updateCurrentProfile(formData)
      }
      setSuccess('Profile updated successfully.')
    } catch (apiError) {
      setError(extractApiError(apiError, 'Profile update failed.'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardNavbar title={title} name={user?.name || 'User'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <p className="mt-1 text-xs font-medium text-primary">{user?.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Phone">
              <input
                value={formData.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <Field label="Branch">
              <input
                value={formData.branch}
                onChange={(event) => updateField('branch', event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <Field label="College">
              <input
                value={formData.college}
                onChange={(event) => updateField('college', event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <Field label="GitHub URL">
              <input
                value={formData.githubUrl}
                onChange={(event) => updateField('githubUrl', event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                value={formData.linkedinUrl}
                onChange={(event) => updateField('linkedinUrl', event.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(event) => updateField('bio', event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </Field>

          {isLoading ? <p className="text-sm text-muted-foreground">Loading profile...</p> : null}
          {error ? <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          {success ? <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{success}</p> : null}

          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-card-foreground">{label}</span>
      {children}
    </label>
  )
}
