import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Alert from '../components/Alert';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
  };

  // Client-side form validation
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );

      if (result.success) {
        setSuccessMessage('Account registered! Redirecting to email verification...');
        setTimeout(() => {
          navigate('/verify-otp', {
            state: {
              email: result.email || formData.email.trim(),
              message: result.message,
            },
          });
        }, 800);
      } else {
        setServerError(result.message);
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Get started with your free account</p>
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

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <InputField
            id="name"
            name="name"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            required
            disabled={isLoading}
            autoComplete="name"
          />

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
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={Lock}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />

          <InputField
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={Lock}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            loadingText="Creating account..."
            icon={UserPlus}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
