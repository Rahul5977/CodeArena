import { useState, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { FiArrowLeft, FiClock, FiUsers, FiCode } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const ContestDetail = () => {
  const { id } = useParams()
  const [contest, setContest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [timeLeft, setTimeLeft] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const { showError, showSuccess } = useToastContext()

  const fetchContest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/contests/${id}`)
      if (response.data.success) {
        setContest(response.data.contest)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch contest details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContest()
  }, [id])

  const getContestStatus = (contest) => {
    if (!contest) return 'upcoming'
    const now = new Date()
    const start = new Date(contest.startTime)
    const end = new Date(contest.endTime)

    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'live'
    return 'completed'
  }

  const status = getContestStatus(contest)

  useEffect(() => {
    if (!contest) return

    const updateTimer = () => {
      const now = new Date()
      const start = new Date(contest.startTime)
      const end = new Date(contest.endTime)

      if (now < start) {
        const diff = start - now
        setTimeLeft(formatTimeLeft(diff, 'Starts in'))
      } else if (now >= start && now <= end) {
        const diff = end - now
        setTimeLeft(formatTimeLeft(diff, 'Ends in'))
      } else {
        setTimeLeft('Contest Ended')
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [contest])

  const formatTimeLeft = (ms, prefix) => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    if (days > 0) return `${prefix} ${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${prefix} ${hours}h ${minutes}m ${seconds}s`
    return `${prefix} ${minutes}m ${seconds}s`
  }

  const handleRegister = async () => {
    try {
      setRegistering(true)
      const response = await api.post(`/contests/${id}/register`)
      if (response.data.success) {
        showSuccess('Success', 'Registered for contest successfully!')
        setIsOpen(false)
        fetchContest()
      }
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to register for contest')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-base-content/50">Contest not found</p>
        <RouterLink to="/contests" className="btn btn-primary">
          <FiArrowLeft className="mr-2" />
          Back to Contests
        </RouterLink>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RouterLink
        to="/contests"
        className="btn btn-ghost btn-sm"
      >
        <FiArrowLeft className="mr-2" />
        Back to Contests
      </RouterLink>

      {/* Contest Header */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-primary">{contest.title}</h1>
              <div className="flex items-center gap-4">
                <div className={`badge badge-lg ${status === 'live' ? 'badge-success' : status === 'upcoming' ? 'badge-info' : 'badge-neutral'}`}>
                  {status.toUpperCase()}
                </div>
                <p className="text-lg font-bold text-error">
                  {timeLeft}
                </p>
              </div>
            </div>
            <FiCode className="text-4xl text-yellow-500" />
          </div>
        </div>
        
        <div className="card-body">
          <div className="space-y-4">
            <p className="text-lg">{contest.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FiClock />
                  <p className="font-semibold">Duration</p>
                </div>
                <p>{contest.duration} minutes</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FiUsers />
                  <p className="font-semibold">Participants</p>
                </div>
                <p>{contest.participantCount || 0} registered</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FiCode />
                  <p className="font-semibold">Problems</p>
                </div>
                <p>{contest.problems?.length || 0} problems</p>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="flex gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Start Time</p>
                <p className="text-sm">{new Date(contest.startTime).toLocaleString()}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-semibold">End Time</p>
                <p className="text-sm">{new Date(contest.endTime).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              {!contest.isRegistered && status === 'upcoming' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setIsOpen(true)}
                >
                  Register for Contest
                </button>
              )}
              
              <RouterLink
                to={`/contests/${id}/leaderboard`}
                className="btn btn-outline btn-primary"
              >
                View Leaderboard
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      {/* Contest Rules */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <h2 className="text-xl font-bold">Contest Rules</h2>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {contest.rules ? (
              <p className="whitespace-pre-wrap">{contest.rules}</p>
            ) : (
              <div className="space-y-2">
                <p>• Submit solutions within the contest duration</p>
                <p>• Each problem has multiple test cases</p>
                <p>• Scoring is based on correctness and submission time</p>
                <p>• Ties are broken by submission time</p>
                <p>• Late submissions will not be accepted</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Problems Preview */}
      {contest.problems && contest.problems.length > 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <h2 className="text-xl font-bold">Problems ({contest.problems.length})</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contest.problems.map((problem, index) => (
                <div key={problem.id} className="card card-compact bg-base-200">
                  <div className="card-body">
                    <div className="space-y-2">
                      <p className="font-bold">
                        Problem {String.fromCharCode(65 + index)}: {problem.title}
                      </p>
                      <div className={`badge ${
                        problem.difficulty === 'EASY' ? 'badge-success' :
                        problem.difficulty === 'MEDIUM' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {problem.difficulty}
                      </div>
                      <p className="text-sm text-base-content/60 line-clamp-2">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Register for Contest</h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            
            <div className="py-4 space-y-4">
              <p>Are you sure you want to register for this contest?</p>
              <p className="text-sm text-base-content/60">
                Once registered, you'll receive notifications about the contest start time.
              </p>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`btn btn-primary ${registering ? 'loading' : ''}`}
                onClick={handleRegister}
                disabled={registering}
              >
                Register
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default ContestDetail