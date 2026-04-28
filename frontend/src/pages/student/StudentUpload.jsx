import { useState } from 'react'
import { DashboardNavbar } from '../../components/DashboardShell'
import { Upload, FileText, CheckCircle2 } from 'lucide-react'
import { uploadProject } from '../../services/projectService'
import { useAuth } from '../../context/AuthContext'

export default function StudentUpload() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tech, setTech] = useState('')
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedFile) {
      setError('Please upload a file before submitting the project.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('title', title.trim())
      payload.append('description', description.trim())
      payload.append('technology', tech.trim())
      payload.append('status', 'PENDING')
      payload.append('progress', '0')
      if (user?.id) {
        payload.append('studentId', String(user.id))
      }
      payload.append('file', selectedFile)

      await uploadProject(payload)
      setSubmitted(true)
      setTimeout(() => {
        setTitle('')
        setDescription('')
        setTech('')
        setFileName('')
        setSelectedFile(null)
        setSubmitted(false)
      }, 3000)
    } catch (apiError) {
      const message = apiError?.response?.data?.message || 'Unable to submit project. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <DashboardNavbar title="Upload Project" name={user?.name || 'Student'} />
      <div className="flex flex-col gap-6 p-4 lg:p-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Upload New Project</h2>
          <p className="mt-1 text-sm text-muted-foreground">Submit a new project for review by your instructor</p>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          {submitted ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-success/30 bg-success/5 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Project Submitted!</h3>
              <p className="text-sm text-muted-foreground">Your project has been submitted successfully and is pending review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-2">
                <label htmlFor="project-title" className="text-sm font-medium text-card-foreground">Project Title</label>
                <input
                  id="project-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="project-desc" className="text-sm font-medium text-card-foreground">Description</label>
                <textarea
                  id="project-desc"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your project..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="project-tech" className="text-sm font-medium text-card-foreground">Technology Used</label>
                <input
                  id="project-tech"
                  type="text"
                  required
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  placeholder="e.g. React, Node.js, MongoDB"
                  className="h-11 w-full rounded-lg border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-card-foreground">File Upload</label>
                <label
                  htmlFor="project-file"
                  className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-input bg-background p-8 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  {fileName ? (
                    <div className="flex items-center gap-2 text-primary">
                      <FileText className="h-5 w-5" />
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-card-foreground">Click to upload or drag and drop</p>
                        <p className="mt-1 text-xs text-muted-foreground">ZIP, PDF, or source files (max 50MB)</p>
                      </div>
                    </>
                  )}
                  <input
                    id="project-file"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setFileName(file.name)
                        setSelectedFile(file)
                      } else {
                        setFileName('')
                        setSelectedFile(null)
                      }
                    }}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex h-11 items-center justify-center rounded-lg bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Project'}
              </button>

              {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
