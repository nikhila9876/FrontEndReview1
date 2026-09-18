/**
 * Reusable Button Component
 * Supports loading spinner, disabled state, variants, and icons.
 */
const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  loadingText,
  disabled = false,
  onClick,
  icon: Icon,
  className = '',
  fullWidth = true,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn btn-${variant} ${fullWidth ? 'btn-full-width' : ''} ${className}`}
    >
      {loading ? (
        <span className="btn-loading-state">
          <svg
            className="spinner-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="spinner-track"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="spinner-head"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || 'Please wait...'}</span>
        </span>
      ) : (
        <span className="btn-content">
          {Icon && <Icon size={18} className="btn-icon" />}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};

export default Button;
