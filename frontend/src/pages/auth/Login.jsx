import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToastContext } from '../../contexts/ToastContext'
import { FiEye, FiEyeOff, FiUser, FiLock, FiCode, FiMail } from 'react-icons/fi'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const { showError, showSuccess } = useToastContext()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await login(formData.email, formData.password, formData.rememberMe)
      showSuccess('Success', 'Welcome back to LeetLab!')
      navigate('/')
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      showError('Login Failed', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-2xl">
            <FiCode className="text-white text-3xl" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            LeetLab
          </h1>
          <p className="text-gray-400 text-lg">Welcome back to your coding journey</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 hover:bg-white/10 transition-all duration-300">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-400">Continue your coding excellence</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium flex items-center gap-2">
                  <FiMail className="text-blue-400" />
                  Email Address
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/15 transition-all duration-300 pl-12 rounded-xl"
                  placeholder="Enter your email"
                  required
                />
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-white font-medium flex items-center gap-2">
                  <FiLock className="text-purple-400" />
                  Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:bg-white/15 transition-all duration-300 pl-12 pr-12 rounded-xl"
                  placeholder="Enter your password"
                  required
                />
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="cursor-pointer label justify-start gap-3 p-0">
                <input 
                  type="checkbox" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="checkbox checkbox-primary checkbox-sm border-white/30" 
                />
                <span className="label-text text-gray-300 text-sm">Remember me</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn w-full bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 h-14"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FiUser />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-gray-500 my-8">New to LeetLab?</div>

          {/* Register Link */}
          <div className="text-center">
            <Link 
              to="/register" 
              className="btn btn-outline w-full border-white/20 text-white hover:bg-white/10 hover:border-white/40 rounded-xl h-14 font-semibold"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-8 text-gray-400 text-sm mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>1000+ Problems</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Live Contests</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>AI Reviews</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            Join 50,000+ developers mastering algorithms and data structures
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login