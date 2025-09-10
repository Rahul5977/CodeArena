import { useState, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { FiArrowLeft, FiPlus, FiTrash2, FiCode, FiList } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const PlaylistDetail = () => {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [problems, setProblems] = useState([])
  const [availableProblems, setAvailableProblems] = useState([])
  const [selectedProblems, setSelectedProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { showError, showSuccess } = useToastContext()

  const fetchPlaylistDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/playlist/${id}`)
      if (response.data.success) {
        setPlaylist(response.data.playlist)
        setProblems(response.data.playlist.problems || [])
      }
    } catch (error) {
      showError('Error', 'Failed to fetch playlist details')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableProblems = async () => {
    try {
      const response = await api.get('/problems/get-all-problems')
      if (response.data.success) {
        setAvailableProblems(response.data.problems)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch problems')
    }
  }

  useEffect(() => {
    fetchPlaylistDetail()
  }, [id])

  useEffect(() => {
    if (isOpen) {
      fetchAvailableProblems()
    }
  }, [isOpen])

  const handleAddProblems = async () => {
    if (selectedProblems.length === 0) {
      showError('Error', 'Please select at least one problem')
      return
    }

    try {
      setAdding(true)
      const response = await api.post(`/playlist/${id}/add-problem`, {
        problemIds: selectedProblems
      })
      if (response.data.success) {
        showSuccess('Success', 'Problems added successfully')
        setSelectedProblems([])
        setIsOpen(false)
        fetchPlaylistDetail()
      }
    } catch (error) {
      showError('Error', 'Failed to add problems')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveProblem = async (problemId) => {
    try {
      const response = await api.delete(`/playlist/${id}/remove-problem`, {
        data: { problemIds: [problemId] }
      })
      if (response.data.success) {
        showSuccess('Success', 'Problem removed successfully')
        fetchPlaylistDetail()
      }
    } catch (error) {
      showError('Error', 'Failed to remove problem')
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'badge-success'
      case 'MEDIUM': return 'badge-warning'
      case 'HARD': return 'badge-error'
      default: return 'badge-ghost'
    }
  }

  const toggleProblemSelection = (problemId) => {
    setSelectedProblems(prev => 
      prev.includes(problemId) 
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId]
    )
  }

  const problemsInPlaylist = problems.map(p => p.problem.id)
  const filteredAvailableProblems = availableProblems.filter(
    problem => !problemsInPlaylist.includes(problem.id)
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-base-content/50">Playlist not found</p>
        <RouterLink to="/playlists" className="btn btn-primary">
          <FiArrowLeft className="mr-2" />
          Back to Playlists
        </RouterLink>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <RouterLink
        to="/playlists"
        className="btn btn-ghost btn-sm"
      >
        <FiArrowLeft className="mr-2" />
        Back to Playlists
      </RouterLink>

      {/* Playlist Header */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FiList className="text-2xl text-primary" />
                <h1 className="text-2xl font-bold text-primary">{playlist.name}</h1>
              </div>
              <div className="badge badge-primary badge-lg">
                {problems.length} problems
              </div>
            </div>
            
            <button
              className="btn btn-primary"
              onClick={() => setIsOpen(true)}
            >
              <FiPlus className="mr-2" />
              Add Problems
            </button>
          </div>
        </div>
        
        {playlist.description && (
          <div className="card-body pt-0">
            <p className="text-lg">{playlist.description}</p>
          </div>
        )}
      </div>

      {/* Problems Table */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <h2 className="text-xl font-bold">Problems</h2>
        </div>
        <div className="card-body">
          {problems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="space-y-1">
                          <div className="font-medium">{item.problem.title}</div>
                          <div className="text-sm text-base-content/60 line-clamp-1">
                            {item.problem.description}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${getDifficultyColor(item.problem.difficulty)}`}>
                          {item.problem.difficulty}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {item.problem.tags?.slice(0, 2).map((tag) => (
                            <span key={tag} className="badge badge-outline badge-sm">
                              {tag}
                            </span>
                          ))}
                          {item.problem.tags?.length > 2 && (
                            <span className="badge badge-ghost badge-sm">
                              +{item.problem.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <RouterLink
                            to={`/problems/${item.problem.id}`}
                            className="btn btn-primary btn-outline btn-sm"
                          >
                            <FiCode className="mr-2" />
                            Solve
                          </RouterLink>
                          <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={() => handleRemoveProblem(item.problem.id)}
                            title="Remove problem"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="space-y-4">
                <FiCode className="mx-auto text-6xl text-base-content/30" />
                <p className="text-lg text-base-content/50">
                  No problems in this playlist yet
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsOpen(true)}
                >
                  <FiPlus className="mr-2" />
                  Add Problems
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Problems Modal */}
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-4xl">
            <h3 className="font-bold text-lg">Add Problems to Playlist</h3>
            
            <div className="py-4 space-y-4">
              <p className="text-base-content/60">
                Select problems to add to your playlist:
              </p>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredAvailableProblems.map((problem) => (
                  <div key={problem.id} className="card card-compact bg-base-200">
                    <div className="card-body">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={selectedProblems.includes(problem.id)}
                            onChange={() => toggleProblemSelection(problem.id)}
                          />
                          <div className="space-y-1">
                            <div className="font-medium">{problem.title}</div>
                            <div className="flex items-center gap-2">
                              <div className={`badge badge-sm ${getDifficultyColor(problem.difficulty)}`}>
                                {problem.difficulty}
                              </div>
                              <div className="text-xs text-base-content/50">
                                {problem.tags?.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredAvailableProblems.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-base-content/50">
                    All available problems are already in this playlist
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`btn btn-primary ${adding ? 'loading' : ''}`}
                onClick={handleAddProblems}
                disabled={adding || selectedProblems.length === 0}
              >
                Add {selectedProblems.length} Problems
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default PlaylistDetail