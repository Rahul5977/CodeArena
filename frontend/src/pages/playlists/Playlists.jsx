import { useState, useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FiPlus, FiList, FiUsers, FiCode } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'
import { useAuth } from '../../contexts/AuthContext'

const Playlists = () => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const { showError, showSuccess } = useToastContext()
  const { user } = useAuth()

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const response = await api.get('/playlist')
      if (response.data.success) {
        setPlaylists(response.data.playlists)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch playlists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const handleCreatePlaylist = async () => {
    if (!formData.title.trim()) {
      showError('Error', 'Please enter a playlist title')
      return
    }

    try {
      setCreating(true)
      const response = await api.post('/playlist/create', formData)
      if (response.data.success) {
        showSuccess('Success', 'Playlist created successfully!')
        setFormData({ title: '', description: '' })
        setIsOpen(false)
        fetchPlaylists()
      }
    } catch (error) {
      showError('Error', 'Failed to create playlist')
    } finally {
      setCreating(false)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Playlists</h1>
        <button
          className="btn btn-primary"
          onClick={() => setIsOpen(true)}
        >
          <FiPlus className="mr-2" />
          Create Playlist
        </button>
      </div>

      {playlists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map(playlist => (
            <div key={playlist.id} className="card bg-base-100 shadow-xl card-hover">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <FiList className="text-xl text-primary" />
                  <div className="badge badge-outline">
                    {playlist.problems?.length || 0} problems
                  </div>
                </div>
                
                <h2 className="card-title">{playlist.title}</h2>
                
                {playlist.description && (
                  <p className="text-base-content/70 text-sm line-clamp-3">
                    {playlist.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <FiUsers />
                  <span>Created by {playlist.createdBy?.name || 'You'}</span>
                </div>
                
                <div className="card-actions justify-end mt-4">
                  <RouterLink
                    to={`/playlists/${playlist.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    <FiCode className="mr-2" />
                    View Playlist
                  </RouterLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="space-y-4">
            <FiList className="mx-auto text-6xl text-base-content/30" />
            <h3 className="text-xl font-bold text-base-content/50">
              No playlists yet
            </h3>
            <p className="text-base-content/40">
              Create your first playlist to organize problems
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setIsOpen(true)}
            >
              <FiPlus className="mr-2" />
              Create Your First Playlist
            </button>
          </div>
        </div>
      )}

      {/* Create Playlist Modal */}
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Create New Playlist</h3>
            
            <div className="py-4 space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Playlist Title</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter playlist title"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description (Optional)</span>
                </label>
                <textarea
                  placeholder="Enter playlist description"
                  className="textarea textarea-bordered"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                />
              </div>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`btn btn-primary ${creating ? 'loading' : ''}`}
                onClick={handleCreatePlaylist}
                disabled={creating}
              >
                Create Playlist
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default Playlists