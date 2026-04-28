import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getHomeByRole(role) {
  return role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'
}

export default function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={getHomeByRole(user.role)} replace />
  }

  return children
}
