import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Alert from '../components/Alert';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
    if (unverifiedEmail) setUnverifiedEmail('');
  };

  // Client-side form validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    setUnverifiedEmail('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await login(formData.email.trim(), formData.password);

      if (result.success) {
        setSuccessMessage('Logged in successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        setServerError(result.message);
        if (result.isEmailVerified === false) {
          setUnverifiedEmail(result.email || formData.email.trim());
        }
      }
    } catch {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-badge">MERN Auth Module</span>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <Alert
          type="error"
          message={serverError}
          onClose={() => setServerError('')}
        />
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage('')}
        />

        {unverifiedEmail && (
          <div className="unverified-email-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertTriangle size={18} color="#d97706" />
              <strong>Account Verification Required</strong>
            </div>
            <p style={{ fontSize: '0.86rem', color: '#78350f', margin: '0 0 10px' }}>
              Please verify your email address to access your account.
            </p>
            <Link
              to={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                textDecoration: 'none',
              }}
            >
              <span>Verify Email Now</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <InputField
            id="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            required
            disabled={isLoading}
            autoComplete="email"
          />

          <InputField
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            loadingText="Signing in..."
            icon={LogIn}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one now</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
