import { useState } from 'react'
import { FiEdit, FiCheck } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import { useToastContext } from '../contexts/ToastContext'
import api from '../utils/api'

const Profile = () => {
  const { user } = useAuth()
  const { showError, showSuccess } = useToastContext()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showError('Error', 'Please fill in all fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('Error', 'New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showError('Error', 'Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.data.success) {
        showSuccess('Success', 'Password updated successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        setIsOpen(false)
      }
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPERADMIN':
        return 'badge-error'
      case 'ADMIN':
        return 'badge-warning'
      default:
        return 'badge-primary'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Profile Info */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex items-center gap-6">
            <div className="avatar">
              <div className="w-24 rounded-full">
                <img 
                  src={user?.image || `https://ui-avatars.com/api/?name=${user?.name}&background=2196f3&color=fff`} 
                  alt={user?.name}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{user?.name}</h2>
              <p className="text-base-content/70">{user?.email}</p>
              <div className={`badge ${getRoleColor(user?.role)}`}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <h2 className="text-xl font-bold">Account Settings</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-base-200 rounded-lg">
              <div>
                <h3 className="font-semibold">Password</h3>
                <p className="text-sm text-base-content/60">Update your account password</p>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setIsOpen(true)}
              >
                <FiEdit className="mr-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat bg-base-100 shadow-lg rounded-box">
          <div className="stat-title">Problems Solved</div>
          <div className="stat-value text-success">
            {user?.problemsSolved || 0}
          </div>
          <div className="stat-desc">Keep it up!</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-box">
          <div className="stat-title">Playlists Created</div>
          <div className="stat-value text-primary">
            {user?.playlistsCreated || 0}
          </div>
          <div className="stat-desc">Organize your learning</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-box">
          <div className="stat-title">Submissions</div>
          <div className="stat-value text-info">
            {user?.totalSubmissions || 0}
          </div>
          <div className="stat-desc">Total attempts</div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Change Password</h3>
            
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="input input-bordered"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="input input-bordered"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="input input-bordered"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                />
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                onClick={handlePasswordChange}
                disabled={loading}
              >
                <FiCheck className="mr-2" />
                Update Password
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default Profile