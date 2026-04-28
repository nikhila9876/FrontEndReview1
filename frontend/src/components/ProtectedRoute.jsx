import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getHomeByRole(role) {
  return role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getHomeByRole(user.role)} replace />
  }

  return children
}
