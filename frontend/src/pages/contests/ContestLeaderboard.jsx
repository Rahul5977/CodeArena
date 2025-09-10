import { useState, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { FiArrowLeft, FiCode, FiUser } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const ContestLeaderboard = () => {
  const { id } = useParams()
  const [contest, setContest] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const { showError } = useToastContext()

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/contests/${id}/leaderboard`)
      if (response.data.success) {
        setContest(response.data.contest)
        setLeaderboard(response.data.leaderboard)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [id])

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-500'
      case 2: return 'text-gray-400'
      case 3: return 'text-amber-600'
      default: return 'text-base-content'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RouterLink
        to={`/contests/${id}`}
        className="btn btn-ghost btn-sm"
      >
        <FiArrowLeft className="mr-2" />
        Back to Contest
      </RouterLink>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <div className="flex items-center gap-3">
            <FiCode className="text-2xl text-primary" />
            <h1 className="text-2xl font-bold">{contest?.title} - Leaderboard</h1>
          </div>
        </div>
        
        <div className="card-body">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Participant</th>
                  <th>Score</th>
                  <th>Problems Solved</th>
                  <th>Last Submission</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((participant, index) => (
                  <tr key={participant.userId}>
                    <td>
                      <div className={`font-bold text-lg ${getRankColor(index + 1)}`}>
                        {index + 1}
                        {index < 3 && <FiCode className="inline ml-1" />}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img 
                              src={participant.user?.image || `https://ui-avatars.com/api/?name=${participant.user?.name}&background=2196f3&color=fff`}
                              alt={participant.user?.name}
                            />
                          </div>
                        </div>
                        <span className="font-medium">{participant.user?.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-primary">
                        {participant.totalScore || 0}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {participant.problemsSolved || 0}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm text-base-content/60">
                        {participant.lastSubmission 
                          ? new Date(participant.lastSubmission).toLocaleString()
                          : 'No submissions'
                        }
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {leaderboard.length === 0 && (
            <div className="text-center py-10">
              <FiUser className="mx-auto text-4xl text-base-content/30 mb-4" />
              <p className="text-lg text-base-content/50">
                No participants yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContestLeaderboard