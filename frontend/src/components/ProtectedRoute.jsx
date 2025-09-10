import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <h2 className="card-title text-error justify-center">Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <div className="card-actions justify-center">
              <Navigate to="/" replace />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute