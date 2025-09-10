import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const Submissions = () => {
  const [submissions, setSubmissions] = useState([])
  const [filteredSubmissions, setFilteredSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [search, setSearch] = useState('')
  const { showError } = useToastContext()

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/submission/get-all-submissions')
      if (response.data.success) {
        setSubmissions(response.data.submissions)
        setFilteredSubmissions(response.data.submissions)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch submissions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  useEffect(() => {
    let filtered = submissions

    if (statusFilter) {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    if (languageFilter) {
      filtered = filtered.filter(sub => sub.language === languageFilter)
    }

    if (search) {
      filtered = filtered.filter(sub => 
        sub.problem?.title?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredSubmissions(filtered)
  }, [submissions, statusFilter, languageFilter, search])

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'acepted': // Handle typo
        return 'badge-success'
      case 'wrong answer':
        return 'badge-error'
      case 'time limit exceeded':
        return 'badge-warning'
      case 'memory limit exceeded':
        return 'badge-secondary'
      case 'runtime error':
        return 'badge-error'
      case 'compilation error':
        return 'badge-ghost'
      default:
        return 'badge-ghost'
    }
  }

  const getLanguageColor = (language) => {
    switch (language.toLowerCase()) {
      case 'python':
        return 'badge-info'
      case 'javascript':
        return 'badge-warning'
      case 'java':
        return 'badge-error'
      case 'cpp':
      case 'c++':
        return 'badge-secondary'
      default:
        return 'badge-ghost'
    }
  }

  // Calculate stats
  const totalSubmissions = submissions.length
  const acceptedSubmissions = submissions.filter(sub => 
    sub.status.toLowerCase() === 'accepted' || sub.status.toLowerCase() === 'acepted'
  ).length
  const acceptanceRate = totalSubmissions > 0 ? 
    Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0

  const uniqueLanguages = [...new Set(submissions.map(sub => sub.language))]
  const uniqueStatuses = [...new Set(submissions.map(sub => sub.status))]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Submissions</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat bg-base-100 shadow-lg rounded-box">
          <div className="stat-title">Total Submissions</div>
          <div className="stat-value text-info">{totalSubmissions}</div>
          <div className="stat-desc">All time submissions</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-box">
          <div className="stat-title">Accepted</div>
          <div className="stat-value text-success">{acceptedSubmissions}</div>
          <div className="stat-desc">Successfully solved</div>
        </div>
        
        <div className="stat bg-base-100 shadow-lg rounded-box">
          <div className="stat-title">Acceptance Rate</div>
          <div className="stat-value text-primary">{acceptanceRate}%</div>
          <div className="stat-desc">Success percentage</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Search by problem name..."
                className="input input-bordered w-full pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select
              className="select select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            
            <select
              className="select select-bordered"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="">All Languages</option>
              {uniqueLanguages.map(language => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
            
            <div className="text-sm text-base-content/60 self-center">
              {filteredSubmissions.length} of {totalSubmissions} submissions
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <h2 className="text-xl font-bold">Submission History</h2>
        </div>
        <div className="card-body">
          {filteredSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Status</th>
                    <th>Language</th>
                    <th>Memory</th>
                    <th>Time</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>
                        <div className="space-y-1">
                          <RouterLink
                            to={`/problems/${submission.problemId}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {submission.problem?.title || 'Unknown Problem'}
                          </RouterLink>
                          <div className="text-xs text-base-content/50">
                            ID: {submission.problemId}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </div>
                      </td>
                      <td>
                        <div className={`badge badge-outline ${getLanguageColor(submission.language)}`}>
                          {submission.language}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm">
                          {submission.memory || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm">
                          {submission.time || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-base-content/60">
                          {new Date(submission.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="space-y-4">
                <p className="text-lg text-base-content/50">
                  {submissions.length === 0 ? 'No submissions yet' : 'No submissions match your filters'}
                </p>
                <p className="text-base-content/40">
                  {submissions.length === 0 
                    ? 'Start solving problems to see your submissions here!'
                    : 'Try adjusting your search filters'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Submissions