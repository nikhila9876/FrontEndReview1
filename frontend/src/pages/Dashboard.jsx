import { LogOut, ShieldCheck, Database, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Navigation bar */}
      <nav className="dashboard-nav">
        <div className="dashboard-brand">
          <ShieldCheck size={24} color="#4f46e5" />
          <span>MERN Hackathon Auth</span>
        </div>
        <Button
          variant="secondary"
          onClick={logout}
          icon={LogOut}
          fullWidth={false}
        >
          Sign Out
        </Button>
      </nav>

      {/* Main card */}
      <div className="dashboard-card">
        <div className="user-profile-header">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              Welcome, {user?.name || 'Developer'}!
              {user?.isEmailVerified && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    color: '#065f46',
                    background: '#d1fae5',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 600,
                  }}
                >
                  <CheckCircle size={12} /> Verified
                </span>
              )}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              You are securely authenticated via JWT with verified email credentials.
            </p>
          </div>
        </div>

        {/* User Metadata */}
        <h3 style={{ fontSize: '1rem', marginBottom: '12px', fontWeight: 600 }}>
          Authenticated User Profile (from <code style={{ color: '#4f46e5' }}>/api/auth/me</code>)
        </h3>
        <div className="user-meta-grid">
          <div className="meta-card">
            <div className="meta-label">Full Name</div>
            <div className="meta-value">{user?.name || 'N/A'}</div>
          </div>
          <div className="meta-card">
            <div className="meta-label">Email Address</div>
            <div className="meta-value">{user?.email || 'N/A'}</div>
          </div>
          <div className="meta-card">
            <div className="meta-label">Email Verification</div>
            <div className="meta-value" style={{ color: user?.isEmailVerified ? '#059669' : '#d97706' }}>
              {user?.isEmailVerified ? 'Verified' : 'Pending Verification'}
            </div>
          </div>
          <div className="meta-card">
            <div className="meta-label">Account Created</div>
            <div className="meta-value">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : 'Just now'}
            </div>
          </div>
        </div>

        {/* Hackathon Guide Box */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '20px',
          }}
        >
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Database size={18} color="#4f46e5" /> Production Hackathon Foundation
          </h4>
          <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
            This authentication system features active MongoDB storage, bcrypt password hashing, Brevo transactional email OTP verification with resend cooldowns, and JWT protected routes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
