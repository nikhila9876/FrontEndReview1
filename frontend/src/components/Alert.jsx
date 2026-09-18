import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

/**
 * Reusable Alert banner for errors, success messages, and notifications
 */
const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const iconMap = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info,
    warning: AlertCircle,
  };

  const IconComponent = iconMap[type] || Info;

  return (
    <div className={`alert-banner alert-${type} ${className}`} role="alert">
      <div className="alert-content">
        <IconComponent size={20} className="alert-icon" />
        <span className="alert-message">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="alert-close-btn"
          onClick={onClose}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
