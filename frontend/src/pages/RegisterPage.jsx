import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, User, ShieldCheck } from 'lucide-react'
import { register } from '../services/authService'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required'
    if (!EMAIL_REGEX.test(formData.email.trim())) return 'Please enter a valid email'
    if (formData.password.length < 6) return 'Password must be at least 6 characters'
    if (formData.password !== formData.confirmPassword) return 'Password and confirm password must match'
    return ''
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    try {
      await register({
        name: formData.name.trim(),
        username: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      })
      setSuccess('Registration successful. Redirecting to login...')
      setTimeout(() => navigate('/login'), 900)
    } catch (apiError) {
      const apiMessage = apiError?.response?.data?.message || 'Registration failed. Please try again.'
      setError(apiMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary/5 px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--color-primary)/0.16,transparent_40%),radial-gradient(circle_at_80%_0%,var(--color-accent)/0.12,transparent_35%),radial-gradient(circle_at_20%_100%,var(--color-secondary-foreground)/0.08,transparent_40%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-card/95 p-8 shadow-2xl shadow-primary/10 backdrop-blur-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-card-foreground">Create Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start building your FSAD portfolio journey</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <FormField
            label="Name"
            icon={<User className="h-4 w-4" />}
            type="text"
            placeholder="Your full name"
            value={formData.name}
            onChange={(value) => updateField('name', value)}
          />
          <FormField
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(value) => updateField('email', value)}
          />
          <FormField
            label="Password"
            icon={<Lock className="h-4 w-4" />}
            type="password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(value) => updateField('password', value)}
          />
          <FormField
            label="Confirm Password"
            icon={<Lock className="h-4 w-4" />}
            type="password"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(value) => updateField('confirmPassword', value)}
          />
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-card-foreground">Role</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <select
                value={formData.role}
                onChange={(event) => updateField('role', event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-background/80 pl-10 pr-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </label>

          {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}
          {success ? <p className="rounded-lg bg-success/15 px-3 py-2 text-sm text-success">{success}</p> : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-11 rounded-lg bg-primary font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

function FormField({ label, icon, type, placeholder, value, onChange }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-card-foreground">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-border bg-background/80 pl-10 pr-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          required
        />
      </div>
    </label>
  )
}
