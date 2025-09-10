import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FiCode, FiClock, FiUsers, FiCalendar } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const ContestList = () => {
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const { showError } = useToastContext()
  const { isAdmin } = useAuth()

  const fetchContests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/contests')
      if (response.data.success) {
        setContests(response.data.contests)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch contests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContests()
  }, [])

  const getContestStatus = (contest) => {
    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)

    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'live'
    return 'completed'
  }

  const filterContests = (status) => {
    return contests.filter(contest => getContestStatus(contest) === status)
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getTimeUntilStart = (startTime) => {
    const now = new Date()
    const start = new Date(startTime)
    const diff = start - now

    if (diff <= 0) return 'Started'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const ContestCard = ({ contest }) => {
    const status = getContestStatus(contest)
    
    return (
      <div className="card bg-base-100 shadow-xl card-hover">
        <div className="card-header p-6 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FiCode className="text-xl text-primary" />
                <h3 className="text-lg font-bold">{contest.title}</h3>
              </div>
              <div className={`badge ${status === 'live' ? 'badge-success' : status === 'upcoming' ? 'badge-info' : 'badge-neutral'}`}>
                {status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-body pt-0">
          <div className="space-y-4">
            <p className="text-base-content/70 line-clamp-2">
              {contest.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FiClock className="text-base-content/50" />
                <span className="text-sm">
                  {status === 'upcoming' ? `Starts in ${getTimeUntilStart(contest.startTime)}` : 
                   status === 'live' ? 'Live Now!' : 
                   `Ended ${formatTime(contest.endTime)}`}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <FiUsers className="text-base-content/50" />
                <span className="text-sm">
                  {contest.participantCount || 0} participants
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <FiCalendar className="text-base-content/50" />
                <span className="text-sm">
                  {formatTime(contest.startTime)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <RouterLink
                to={`/contests/${contest.id}`}
                className="btn btn-primary btn-sm flex-1"
              >
                View Contest
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  const tabs = [
    { name: 'All Contests', count: contests.length },
    { name: 'Upcoming', count: filterContests('upcoming').length },
    { name: 'Live', count: filterContests('live').length },
    { name: 'Completed', count: filterContests('completed').length }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contests</h1>
        {isAdmin() && (
          <RouterLink
            to="/admin/contests"
            className="btn btn-primary btn-sm"
          >
            Manage Contests
          </RouterLink>
        )}
      </div>

      <div className="tabs tabs-boxed">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`tab ${activeTab === index ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 0 && contests.map(contest => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
        {activeTab === 1 && filterContests('upcoming').map(contest => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
        {activeTab === 2 && filterContests('live').map(contest => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
        {activeTab === 3 && filterContests('completed').map(contest => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>

      {contests.length === 0 && (
        <div className="text-center py-20">
          <div className="space-y-4">
            <FiCode className="mx-auto text-6xl text-base-content/30" />
            <h3 className="text-xl font-bold text-base-content/50">
              No contests available
            </h3>
            <p className="text-base-content/40">
              Check back later for upcoming contests!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContestList