import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable input field component
 * Supports text, email, password (with show/hide toggle), icons, and validation error messages.
 */
const InputField = ({
  id,
  name,
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id || name} className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className={`input-container ${error ? 'has-error' : ''}`}>
        {Icon && (
          <div className="input-icon-left">
            <Icon size={18} />
          </div>
        )}

        <input
          id={id || name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`form-input ${Icon ? 'with-left-icon' : ''} ${
            isPassword ? 'with-right-icon' : ''
          }`}
        />

        {isPassword && (
          <button
            type="button"
            className="input-icon-right-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && <span className="field-error-message">{error}</span>}
    </div>
  );
};

export default InputField;
