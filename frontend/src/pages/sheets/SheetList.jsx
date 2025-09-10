import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FiSearch, FiBook, FiStar, FiLock, FiUnlock } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const SheetList = () => {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('') // free, premium, all
  const { showError } = useToastContext()
  const { isAdmin } = useAuth()

  const fetchSheets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/sheets')
      if (response.data.success) {
        setSheets(response.data.sheets)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch sheets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSheets()
  }, [])

  const topics = ['Array', 'String', 'Tree', 'Graph', 'Dynamic Programming', 'Greedy', 'Backtracking']
  const difficulties = ['EASY', 'MEDIUM', 'HARD']

  const filteredSheets = sheets.filter(sheet => {
    const matchesSearch = sheet.title.toLowerCase().includes(search.toLowerCase()) ||
                         sheet.description.toLowerCase().includes(search.toLowerCase())
    const matchesTopic = !topicFilter || sheet.topic === topicFilter
    const matchesDifficulty = !difficultyFilter || sheet.difficulty === difficultyFilter
    const matchesType = !typeFilter || (typeFilter === 'free' ? !sheet.isPremium : typeFilter === 'premium' ? sheet.isPremium : true)
    
    return matchesSearch && matchesTopic && matchesDifficulty && matchesType
  })

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'badge-success'
      case 'MEDIUM': return 'badge-warning' 
      case 'HARD': return 'badge-error'
      default: return 'badge-ghost'
    }
  }

  const SheetCard = ({ sheet }) => {
    const progress = sheet.userProgress ? (sheet.userProgress.solvedProblems / sheet.totalProblems) * 100 : 0
    
    return (
      <div className="card bg-base-100 shadow-xl card-hover">
        <div className="card-header p-6 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FiBook className="text-xl text-primary" />
                <h3 className="text-lg font-bold text-primary">{sheet.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                {sheet.isPremium ? (
                  <div className="badge badge-warning">
                    <FiLock className="mr-1" />
                    Premium
                  </div>
                ) : (
                  <div className="badge badge-success">
                    <FiUnlock className="mr-1" />
                    Free
                  </div>
                )}
                <div className={`badge ${getDifficultyColor(sheet.difficulty)}`}>
                  {sheet.difficulty}
                </div>
              </div>
            </div>
            
            {sheet.isPremium && <FiStar className="text-xl text-yellow-500" />}
          </div>
        </div>
        
        <div className="card-body pt-0">
          <div className="space-y-4">
            <p className="text-base-content/70 line-clamp-3">
              {sheet.description}
            </p>
            
            <div className="flex flex-wrap gap-2">
              <div className="badge badge-outline">
                {sheet.topic}
              </div>
              <div className="badge badge-outline">
                {sheet.totalProblems} problems
              </div>
            </div>
            
            {sheet.userProgress && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-base-content/60">Progress</span>
                  <span className="text-sm font-bold">
                    {sheet.userProgress.solvedProblems}/{sheet.totalProblems}
                  </span>
                </div>
                <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
              </div>
            )}
            
            <RouterLink
              to={`/sheets/${sheet.id}`}
              className={`btn w-full ${sheet.isPremium && !sheet.isUnlocked ? 'btn-outline btn-warning' : 'btn-primary'}`}
            >
              {sheet.isPremium && !sheet.isUnlocked ? (
                <>
                  <FiLock className="mr-2" />
                  Unlock Sheet
                </>
              ) : (
                'Start Learning'
              )}
            </RouterLink>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">DSA Sheets</h1>
        {isAdmin() && (
          <RouterLink
            to="/admin/sheets"
            className="btn btn-primary btn-sm"
          >
            Manage Sheets
          </RouterLink>
        )}
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Search sheets..."
                className="input input-bordered w-full pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select
              className="select select-bordered"
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
            >
              <option value="">All Topics</option>
              {topics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            
            <select
              className="select select-bordered"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="">All Difficulties</option>
              {difficulties.map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
            
            <select
              className="select select-bordered"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
            </select>
            
            <button 
              className="btn btn-outline"
              onClick={() => {
                setSearch('')
                setTopicFilter('')
                setDifficultyFilter('')
                setTypeFilter('')
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Sheets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSheets.map(sheet => (
          <SheetCard key={sheet.id} sheet={sheet} />
        ))}
      </div>

      {filteredSheets.length === 0 && (
        <div className="text-center py-20">
          <div className="space-y-4">
            <FiBook className="mx-auto text-6xl text-base-content/30" />
            <h3 className="text-xl font-bold text-base-content/50">
              No sheets found
            </h3>
            <p className="text-base-content/40">
              Try adjusting your search filters
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SheetList