import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FiCode, FiUser, FiBook, FiTrendingUp } from 'react-icons/fi'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import { useToastContext } from '../contexts/ToastContext'

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { showError } = useToastContext()

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard')
      if (response.data.success) {
        setDashboardData(response.data.data)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading || !dashboardData) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-base-content/70">Ready to solve some problems today?</p>
            </div>
            <div className="avatar">
              <div className="w-16 rounded-full">
                <img 
                  src={user?.image || `https://ui-avatars.com/api/?name=${user?.name}&background=2196f3&color=fff`} 
                  alt={user?.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-success">
            <FiTrendingUp size={32} />
          </div>
          <div className="stat-title">Problems Solved</div>
          <div className="stat-value text-success">
            {dashboardData.problemsSolved || 0}
          </div>
          <div className="stat-desc">Keep going!</div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-primary">
            <FiUser size={32} />
          </div>
          <div className="stat-title">Contest Rank</div>
          <div className="stat-value text-primary">
            #{dashboardData.contestRank || 'N/A'}
          </div>
          <div className="stat-desc">Global ranking</div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-warning">
            <FiCode size={32} />
          </div>
          <div className="stat-title">Streak</div>
          <div className="stat-value text-warning">
            {dashboardData.streak || 0} days
          </div>
          <div className="stat-desc">Current solving streak</div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-secondary">
            <FiBook size={32} />
          </div>
          <div className="stat-title">Sheets Completed</div>
          <div className="stat-value text-secondary">
            {dashboardData.sheetsCompleted || 0}
          </div>
          <div className="stat-desc">DSA sheets progress</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Quick Actions</h2>
            <div className="space-y-3">
              <RouterLink
                to="/problems"
                className="btn btn-primary w-full justify-start"
              >
                <FiCode className="mr-2" />
                Solve Problems
              </RouterLink>
              
              <RouterLink
                to="/contests"
                className="btn btn-warning w-full justify-start"
              >
                <FiUser className="mr-2" />
                Join Contest
              </RouterLink>
              
              <RouterLink
                to="/sheets"
                className="btn btn-secondary w-full justify-start"
              >
                <FiBook className="mr-2" />
                Practice Sheets
              </RouterLink>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Recent Activity</h2>
            <div className="space-y-3">
              {dashboardData.recentActivity?.map((activity, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{activity.description}</span>
                  <span className="text-xs text-base-content/50">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
              
              {(!dashboardData.recentActivity || dashboardData.recentActivity.length === 0) && (
                <p className="text-center text-base-content/50">
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {dashboardData.currentSheet && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Continue Learning</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{dashboardData.currentSheet.title}</h3>
                  <p className="text-sm text-base-content/70">
                    {dashboardData.currentSheet.topic} • {dashboardData.currentSheet.difficulty}
                  </p>
                </div>
                <RouterLink
                  to={`/sheets/${dashboardData.currentSheet.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Continue
                </RouterLink>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-bold">
                    {dashboardData.currentSheet.progress}%
                  </span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={dashboardData.currentSheet.progress} 
                  max="100"
                ></progress>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard