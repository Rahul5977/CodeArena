import { useState, useEffect } from 'react'
import { FiUsers, FiCode, FiBook, FiActivity } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const { showError } = useToastContext()

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/stats')
      if (response.data.success) {
        setStats(response.data.stats)
        setRecentActivity(response.data.recentActivity || [])
      }
    } catch (error) {
      showError('Error', 'Failed to fetch admin stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <div className="flex items-center gap-3">
              <FiUsers className="text-2xl text-blue-500" />
              <p className="font-bold">Total Users</p>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="stat">
              <div className="stat-value">{stats?.totalUsers || 0}</div>
              <div className="stat-desc">
                <div className="badge badge-info">
                  {stats?.newUsersThisMonth || 0} this month
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <div className="flex items-center gap-3">
              <FiCode className="text-2xl text-green-500" />
              <p className="font-bold">Problems</p>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="stat">
              <div className="stat-value">{stats?.totalProblems || 0}</div>
              <div className="stat-desc">
                <div className="badge badge-success">
                  {stats?.problemsAddedThisMonth || 0} added this month
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <div className="flex items-center gap-3">
              <FiCode className="text-2xl text-yellow-500" />
              <p className="font-bold">Contests</p>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="stat">
              <div className="stat-value">{stats?.totalContests || 0}</div>
              <div className="stat-desc">
                <div className="badge badge-warning">
                  {stats?.activeContests || 0} active
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <div className="flex items-center gap-3">
              <FiBook className="text-2xl text-purple-500" />
              <p className="font-bold">DSA Sheets</p>
            </div>
          </div>
          <div className="card-body pt-0">
            <div className="stat">
              <div className="stat-value">{stats?.totalSheets || 0}</div>
              <div className="stat-desc">
                <div className="badge badge-secondary">
                  {stats?.premiumSheets || 0} premium
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Role Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <h2 className="text-xl font-bold">User Roles</h2>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Super Admins</span>
                <div className="badge badge-error">
                  {stats?.roleDistribution?.SUPERADMIN || 0}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Admins</span>
                <div className="badge badge-warning">
                  {stats?.roleDistribution?.ADMIN || 0}
                </div>
              </div>
              <div className="flex justify-between">
                <span>Users</span>
                <div className="badge badge-primary">
                  {stats?.roleDistribution?.USER || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Action</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity, index) => (
                    <tr key={index}>
                      <td>
                        <span className="font-medium">
                          {activity.user?.name || 'Unknown'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm">
                          {activity.action}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-base-content/60">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard