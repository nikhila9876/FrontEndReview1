import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock } from 'lucide-react'
import ReCAPTCHA from 'react-google-recaptcha'
import { login } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const navigate = useNavigate()
  const { login: saveAuthSession } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [captchaToken, setCaptchaToken] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const recaptchaRef = useRef(null)
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeV_nUsAAAAAIkOCLMniIf_ryp74aCDoz9Xy1ky'

  const validateForm = () => {
    if (!EMAIL_REGEX.test(email.trim())) return 'Please enter a valid email address'
    if (!password) return 'Password is required'
    return ''
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    if (!captchaToken) {
      setError('Please complete CAPTCHA verification.')
      return
    }

    setIsLoading(true)
    try {
      const response = await login({
        email: email.trim().toLowerCase(),
        password,
      })

      saveAuthSession(response.data)
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
      const role = response.data?.user?.role
      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true })
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    } catch (apiError) {
      const apiMessage = apiError?.response?.data?.message || 'Login failed. Check your credentials and try again.'
      setError(apiMessage)
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary/5 px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,var(--color-primary)/0.16,transparent_38%),radial-gradient(circle_at_88%_0%,var(--color-accent)/0.14,transparent_32%),radial-gradient(circle_at_60%_100%,var(--color-secondary-foreground)/0.09,transparent_42%)]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-card/95 p-8 shadow-2xl shadow-primary/10 backdrop-blur-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-card-foreground">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to access your portfolio dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-card-foreground">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="h-11 w-full rounded-lg border border-border bg-background/80 pl-10 pr-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-card-foreground">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                className="h-11 w-full rounded-lg border border-border bg-background/80 pl-10 pr-4 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </label>

          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={siteKey}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
            />
          </div>

          {error ? <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            disabled={isLoading || !captchaToken}
            className="mt-2 h-11 rounded-lg bg-primary font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
