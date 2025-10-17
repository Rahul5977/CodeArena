import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { 
  FiSearch, FiFilter, FiCode, FiClock, FiCheck, FiX, FiEye,
  FiTrendingUp, FiCalendar, FiPlay
} from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const Submissions = () => {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [languageFilter, setLanguageFilter] = useState('')
  const [search, setSearch] = useState('')
  const { showError } = useToastContext()

  // Mock data for demonstration (replace with API data)
  const mockSubmissions = [
    {
      id: 1,
      problemId: 1,
      problem: { title: "Two Sum", difficulty: "Easy" },
      status: "ACCEPTED",
      language: "JavaScript",
      runtime: "68ms",
      memory: "44.2MB",
      submittedAt: "2024-01-15T10:30:00Z",
      code: "var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n};"
    },
    {
      id: 2,
      problemId: 4,
      problem: { title: "Valid Parentheses", difficulty: "Easy" },
      status: "WRONG_ANSWER",
      language: "Python",
      runtime: "32ms",
      memory: "16.3MB",
      submittedAt: "2024-01-15T09:15:00Z",
      code: "def isValid(self, s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    \n    for char in s:\n        if char in mapping:\n            if not stack or stack.pop() != mapping[char]:\n                return False\n        else:\n            stack.append(char)\n    \n    return not stack"
    },
    {
      id: 3,
      problemId: 2,
      problem: { title: "Longest Substring Without Repeating Characters", difficulty: "Medium" },
      status: "ACCEPTED",
      language: "Java",
      runtime: "2ms",
      memory: "42.8MB",
      submittedAt: "2024-01-14T14:22:00Z",
      code: "public int lengthOfLongestSubstring(String s) {\n    Set<Character> set = new HashSet<>();\n    int left = 0, right = 0, maxLength = 0;\n    \n    while (right < s.length()) {\n        if (!set.contains(s.charAt(right))) {\n            set.add(s.charAt(right));\n            right++;\n            maxLength = Math.max(maxLength, right - left);\n        } else {\n            set.remove(s.charAt(left));\n            left++;\n        }\n    }\n    \n    return maxLength;\n}"
    }
  ]

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/submission/get-all-submissions')
      if (response.data.success) {
        setSubmissions(response.data.submissions)
      } else {
        // Use mock data for demonstration
        setTimeout(() => {
          setSubmissions(mockSubmissions)
          setLoading(false)
        }, 1000)
      }
    } catch (error) {
      // Use mock data for demonstration
      setTimeout(() => {
        setSubmissions(mockSubmissions)
        setLoading(false)
      }, 1000)
    }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'text-success'
      case 'WRONG_ANSWER':
        return 'text-error'
      case 'TIME_LIMIT_EXCEEDED':
        return 'text-warning'
      case 'RUNTIME_ERROR':
        return 'text-error'
      case 'COMPILATION_ERROR':
        return 'text-error'
      default:
        return 'text-base-content'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'badge-success'
      case 'WRONG_ANSWER':
        return 'badge-error'
      case 'TIME_LIMIT_EXCEEDED':
        return 'badge-warning'
      case 'RUNTIME_ERROR':
        return 'badge-error'
      case 'COMPILATION_ERROR':
        return 'badge-error'
      default:
        return 'badge-neutral'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <FiCheck className="text-success" />
      case 'WRONG_ANSWER':
        return <FiX className="text-error" />
      case 'TIME_LIMIT_EXCEEDED':
        return <FiClock className="text-warning" />
      default:
        return <FiCode className="text-base-content/50" />
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-success'
      case 'medium': return 'text-warning'
      case 'hard': return 'text-error'
      default: return 'text-base-content'
    }
  }

  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = !statusFilter || sub.status === statusFilter
    const matchesLanguage = !languageFilter || sub.language === languageFilter
    const matchesSearch = !search || sub.problem?.title?.toLowerCase().includes(search.toLowerCase())
    
    return matchesStatus && matchesLanguage && matchesSearch
  })

  const stats = {
    total: submissions.length,
    accepted: submissions.filter(s => s.status === 'ACCEPTED').length,
    wrongAnswer: submissions.filter(s => s.status === 'WRONG_ANSWER').length,
    timeLimitExceeded: submissions.filter(s => s.status === 'TIME_LIMIT_EXCEEDED').length
  }

  const acceptanceRate = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Submissions
          </h1>
          <p className="text-base-content/70 mt-1">
            Track your progress and review your solutions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs">Total</div>
          <div className="stat-value text-2xl">{stats.total}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs">Accepted</div>
          <div className="stat-value text-2xl text-success">{stats.accepted}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs">Wrong Answer</div>
          <div className="stat-value text-2xl text-error">{stats.wrongAnswer}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs">Time Limit</div>
          <div className="stat-value text-2xl text-warning">{stats.timeLimitExceeded}</div>
        </div>
        <div className="stat bg-base-100 shadow-lg rounded-lg p-4">
          <div className="stat-title text-xs">Acceptance</div>
          <div className="stat-value text-2xl text-primary">{acceptanceRate}%</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  className="input input-bordered w-full pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              className="select select-bordered w-full lg:w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WRONG_ANSWER">Wrong Answer</option>
              <option value="TIME_LIMIT_EXCEEDED">Time Limit Exceeded</option>
              <option value="RUNTIME_ERROR">Runtime Error</option>
              <option value="COMPILATION_ERROR">Compilation Error</option>
            </select>

            {/* Language Filter */}
            <select
              className="select select-bordered w-full lg:w-auto"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="Go">Go</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <div key={submission.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all">
            <div className="card-body">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Status Icon & Problem */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center">
                    {getStatusIcon(submission.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <RouterLink 
                        to={`/problems/${submission.problemId}`}
                        className="link link-hover font-semibold text-lg"
                      >
                        {submission.problem.title}
                      </RouterLink>
                      <span className={`text-sm font-medium ${getDifficultyColor(submission.problem.difficulty)}`}>
                        {submission.problem.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
                      <span className={`badge ${getStatusBadge(submission.status)} badge-sm`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <FiCode />
                        <span>{submission.language}</span>
                      </div>
                      
                      {submission.runtime && (
                        <div className="flex items-center gap-1">
                          <FiClock />
                          <span>{submission.runtime}</span>
                        </div>
                      )}
                      
                      {submission.memory && (
                        <div className="flex items-center gap-1">
                          <FiTrendingUp />
                          <span>{submission.memory}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <FiCalendar />
                        <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-outline btn-sm">
                      <FiEye className="mr-1" />
                      View Code
                    </label>
                    <div tabIndex={0} className="dropdown-content z-[1] card compact w-96 p-4 shadow bg-base-100">
                      <div className="card-body">
                        <h4 className="card-title text-sm">Code</h4>
                        <pre className="text-xs bg-base-200 p-3 rounded overflow-auto max-h-48">
                          <code>{submission.code}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                  
                  <RouterLink 
                    to={`/problems/${submission.problemId}`}
                    className="btn btn-primary btn-sm"
                  >
                    <FiPlay className="mr-1" />
                    Retry
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <FiCode className="mx-auto text-4xl text-base-content/30 mb-4" />
            <p className="text-lg text-base-content/50">
              {search || statusFilter || languageFilter
                ? 'No submissions found matching your criteria'
                : 'No submissions yet'
              }
            </p>
            {!search && !statusFilter && !languageFilter && (
              <RouterLink to="/problems" className="btn btn-primary mt-4">
                Start Solving Problems
              </RouterLink>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Submissions