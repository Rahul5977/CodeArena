import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { 
  FiPlus, FiList, FiUsers, FiCode, FiBookOpen, FiSearch, FiFilter,
  FiMoreVertical, FiPlay, FiLock, FiUnlock, FiStar, FiTrendingUp
} from 'react-icons/fi'
import { BiCrown, BiLock } from 'react-icons/bi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const Playlists = () => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [creating, setCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPrivate: false
  })
  const { showError, showSuccess } = useToastContext()
  const { user } = useAuth()

  // Mock data for demonstration (replace with API data)
  const mockPlaylists = [
    {
      id: 1,
      title: "Blind 75",
      description: "Must-do problems for coding interviews. Curated list of the most important problems.",
      problems: 75,
      completed: 23,
      difficulty: "Mixed",
      isPremium: false,
      isPrivate: false,
      author: { name: "LeetCode" },
      tags: ["Interview", "Popular"],
      progress: 31,
      subscribers: 125000
    },
    {
      id: 2,
      title: "Dynamic Programming Patterns",
      description: "Master DP with these curated problems covering all major patterns",
      problems: 50,
      completed: 12,
      difficulty: "Medium-Hard",
      isPremium: true,
      isPrivate: false,
      author: { name: "LeetLab" },
      tags: ["DP", "Patterns"],
      progress: 24,
      subscribers: 45000
    },
    {
      id: 3,
      title: "Graph Algorithms Mastery",
      description: "Essential graph problems and algorithms for technical interviews",
      problems: 30,
      completed: 8,
      difficulty: "Medium",
      isPremium: false,
      isPrivate: false,
      author: { name: "Community" },
      tags: ["Graph", "Algorithms"],
      progress: 27,
      subscribers: 23000
    },
    {
      id: 4,
      title: "My Interview Prep",
      description: "Personal collection for FAANG preparation",
      problems: 25,
      completed: 15,
      difficulty: "Mixed",
      isPremium: false,
      isPrivate: true,
      author: { name: "You" },
      tags: ["Personal"],
      progress: 60,
      subscribers: 0
    }
  ]

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const response = await api.get('/playlist')
      if (response.data.success) {
        setPlaylists(response.data.playlists)
      } else {
        // Use mock data for demonstration
        setTimeout(() => {
          setPlaylists(mockPlaylists)
          setLoading(false)
        }, 1000)
      }
    } catch (error) {
      // Use mock data for demonstration
      setTimeout(() => {
        setPlaylists(mockPlaylists)
        setLoading(false)
      }, 1000)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      showError('Error', 'Please enter a playlist title')
      return
    }

    try {
      setCreating(true)
      const response = await api.post('/playlist/create', formData)
      if (response.data.success) {
        showSuccess('Success', 'Playlist created successfully!')
        setFormData({ title: '', description: '', isPrivate: false })
        setIsCreating(false)
        fetchPlaylists()
      }
    } catch (error) {
      showError('Error', error.response?.data?.message || 'Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterType === 'all' ||
      (filterType === 'public' && !playlist.isPrivate) ||
      (filterType === 'private' && playlist.isPrivate) ||
      (filterType === 'premium' && playlist.isPremium) ||
      (filterType === 'my' && playlist.author.name === 'You')
    
    return matchesSearch && matchesFilter
  })

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
            Playlists
          </h1>
          <p className="text-base-content/70 mt-1">
            Curated problem collections to enhance your learning journey
          </p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreating(true)}
        >
          <FiPlus className="mr-2" />
          Create Playlist
        </button>
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
                  placeholder="Search playlists..."
                  className="input input-bordered w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filter */}
            <select
              className="select select-bordered w-full lg:w-auto"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Playlists</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="premium">Premium</option>
              <option value="my">My Playlists</option>
            </select>
          </div>
        </div>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaylists.map((playlist) => (
          <div key={playlist.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="card-title text-lg">{playlist.title}</h3>
                  {playlist.isPremium && <BiCrown className="text-warning text-xl" />}
                  {playlist.isPrivate && <BiLock className="text-base-content/50 text-sm" />}
                </div>
                
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-xs">
                    <FiMoreVertical />
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                    <li><a>View Details</a></li>
                    <li><a>Add to Favorites</a></li>
                    {playlist.author.name === 'You' && (
                      <>
                        <li><a>Edit</a></li>
                        <li><a className="text-error">Delete</a></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              <p className="text-sm text-base-content/70 mb-4 line-clamp-2">
                {playlist.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {playlist.tags?.map((tag, index) => (
                  <span key={index} className="badge badge-outline badge-xs">{tag}</span>
                ))}
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-base-content/50">Problems</div>
                    <div className="font-semibold">{playlist.problems}</div>
                  </div>
                  <div>
                    <div className="text-base-content/50">Completed</div>
                    <div className="font-semibold">{playlist.completed}</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{playlist.progress}%</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={playlist.progress} 
                    max="100"
                  ></progress>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-base-content/50">
                    <div>by {playlist.author.name}</div>
                    {playlist.subscribers > 0 && (
                      <div>{playlist.subscribers.toLocaleString()} followers</div>
                    )}
                  </div>
                  
                  <RouterLink 
                    to={`/playlists/${playlist.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <FiPlay className="mr-1" />
                    {playlist.completed > 0 ? 'Continue' : 'Start'}
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlaylists.length === 0 && (
        <div className="text-center py-12">
          <FiList className="mx-auto text-4xl text-base-content/30 mb-4" />
          <p className="text-lg text-base-content/50">
            {searchQuery || filterType !== 'all' 
              ? 'No playlists found matching your criteria'
              : 'No playlists available'
            }
          </p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => setIsCreating(true)}
          >
            Create Your First Playlist
          </button>
        </div>
      )}

      {/* Create Playlist Modal */}
      {isCreating && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-6">Create New Playlist</h3>
            
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Playlist Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter playlist title..."
                  required
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your playlist..."
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Private Playlist</span>
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Private playlists are only visible to you
                  </span>
                </label>
              </div>
              
              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Playlists