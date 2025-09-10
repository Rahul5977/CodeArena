import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FiSearch, FiPlus, FiEye } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const Problems = () => {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const { showError } = useToastContext()
  const { isAdmin } = useAuth()

  const fetchProblems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/problems/get-all-problems')
      if (response.data.success) {
        setProblems(response.data.problems)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch problems')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProblems()
  }, [])

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY':
        return 'badge-success'
      case 'MEDIUM':
        return 'badge-warning'
      case 'HARD':
        return 'badge-error'
      default:
        return 'badge-ghost'
    }
  }

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(search.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesDifficulty = !difficultyFilter || problem.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Problems</h1>
        {isAdmin() && (
          <RouterLink
            to="/problems/create"
            className="btn btn-primary btn-sm"
          >
            <FiPlus className="mr-2" />
            Create Problem
          </RouterLink>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
            <input
              type="text"
              placeholder="Search problems by title or tags..."
              className="input input-bordered w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <select
            className="select select-bordered w-48"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProblems.map(problem => (
            <div key={problem.id} className="card bg-base-100 shadow-xl card-hover">
              <div className="card-body">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="card-title text-lg">{problem.title}</h2>
                  <div className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </div>
                </div>
                
                <p className="text-base-content/70 text-sm line-clamp-3 mb-4">
                  {problem.description}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {problem.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="badge badge-outline badge-sm">
                      {tag}
                    </span>
                  ))}
                  {problem.tags.length > 3 && (
                    <span className="badge badge-ghost badge-sm">
                      +{problem.tags.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="card-actions justify-end">
                  <RouterLink
                    to={`/problems/${problem.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <FiEye className="mr-2" />
                    Solve
                  </RouterLink>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-20">
            <div className="space-y-4">
              <p className="text-xl text-base-content/50">
                No problems found
              </p>
              <p className="text-base-content/40">
                Try adjusting your search filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Problems