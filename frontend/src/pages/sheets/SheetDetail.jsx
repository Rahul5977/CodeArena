import { useState, useEffect } from 'react'
import { useParams, Link as RouterLink } from 'react-router-dom'
import { FiBook, FiStar, FiCode, FiArrowLeft, FiLock, FiCheck } from 'react-icons/fi'
import api from '../../utils/api'
import { useToastContext } from '../../contexts/ToastContext'

const SheetDetail = () => {
  const { id } = useParams()
  const [sheet, setSheet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { showError, showSuccess } = useToastContext()

  const fetchSheet = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/sheets/${id}`)
      if (response.data.success) {
        setSheet(response.data.sheet)
      }
    } catch (error) {
      showError('Error', 'Failed to fetch sheet details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSheet()
  }, [id])

  const handlePurchase = async () => {
    try {
      setPaymentLoading(true)
      
      // Create Razorpay order
      const orderResponse = await api.post('/sheets/create-order', {
        sheetId: id,
        amount: sheet.price * 100, // Razorpay expects amount in paise
      })

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order')
      }

      const { order } = orderResponse.data

      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)

      script.onload = () => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'LeetLab',
          description: `Purchase ${sheet.title}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              // Verify payment
              const verifyResponse = await api.post('/sheets/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                sheetId: id
              })

              if (verifyResponse.data.success) {
                showSuccess('Payment Successful!', 'Sheet unlocked successfully')
                setSheet(prev => ({ ...prev, isUnlocked: true }))
                setIsOpen(false)
              }
            } catch (error) {
              showError('Payment Verification Failed', 'Please contact support')
            }
          },
          prefill: {
            name: 'User Name',
            email: 'user@example.com',
          },
          theme: {
            color: '#2196f3'
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      }
    } catch (error) {
      showError('Payment Failed', error.message || 'Failed to initiate payment')
    } finally {
      setPaymentLoading(false)
    }
  }

  const markProblemComplete = async (problemId) => {
    try {
      await api.post(`/sheets/${id}/problems/${problemId}/complete`)
      // Refresh sheet data
      fetchSheet()
      showSuccess('Progress Updated', 'Problem marked as completed!')
    } catch (error) {
      showError('Error', 'Failed to update progress')
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!sheet) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-lg text-base-content/50">Sheet not found</p>
        <RouterLink to="/sheets" className="btn btn-primary">
          <FiArrowLeft className="mr-2" />
          Back to Sheets
        </RouterLink>
      </div>
    )
  }

  const progress = sheet.userProgress ? (sheet.userProgress.solvedProblems / sheet.totalProblems) * 100 : 0

  return (
    <div className="space-y-6">
      <RouterLink
        to="/sheets"
        className="btn btn-ghost btn-sm"
      >
        <FiArrowLeft className="mr-2" />
        Back to Sheets
      </RouterLink>

      {/* Sheet Header */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-header p-6 pb-0">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FiBook className="text-2xl text-primary" />
                <h1 className="text-2xl font-bold text-primary">{sheet.title}</h1>
                {sheet.isPremium && <FiStar className="text-2xl text-yellow-500" />}
              </div>
              <div className="flex items-center gap-4">
                {sheet.isPremium ? (
                  <div className="badge badge-warning">
                    <FiLock className="mr-1" />
                    Premium - ₹{sheet.price}
                  </div>
                ) : (
                  <div className="badge badge-success">Free</div>
                )}
                <div className={`badge ${getDifficultyColor(sheet.difficulty)}`}>
                  {sheet.difficulty}
                </div>
                <div className="badge badge-outline">{sheet.topic}</div>
              </div>
            </div>
            
            {sheet.isPremium && !sheet.isUnlocked && (
              <button
                className="btn btn-warning btn-lg"
                onClick={() => setIsOpen(true)}
              >
                <FiLock className="mr-2" />
                Unlock for ₹{sheet.price}
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
          <div className="space-y-4">
            <p className="text-lg">{sheet.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="font-semibold">Total Problems</p>
                <p className="text-2xl font-bold text-primary">
                  {sheet.totalProblems}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="font-semibold">Completed</p>
                <p className="text-2xl font-bold text-success">
                  {sheet.userProgress?.solvedProblems || 0}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="font-semibold">Progress</p>
                <p className="text-2xl font-bold text-info">
                  {progress.toFixed(0)}%
                </p>
              </div>
            </div>
            
            <div className="w-full">
              <p className="font-semibold mb-2">Overall Progress</p>
              <progress className="progress progress-primary w-full" value={progress} max="100"></progress>
            </div>
          </div>
        </div>
      </div>

      {/* Access Check */}
      {sheet.isPremium && !sheet.isUnlocked ? (
        <div className="alert alert-warning">
          <div>
            <div className="font-bold">Premium Sheet</div>
            <div className="text-sm">
              This is a premium sheet. Purchase it for ₹{sheet.price} to access all {sheet.totalProblems} problems.
            </div>
          </div>
        </div>
      ) : (
        /* Problems Table */
        <div className="card bg-base-100 shadow-xl">
          <div className="card-header p-6 pb-0">
            <h2 className="text-xl font-bold">Problems ({sheet.problems?.length || 0})</h2>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Problem</th>
                    <th>Difficulty</th>
                    <th>Topic</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.problems?.map((problem, index) => {
                    const isCompleted = sheet.userProgress?.completedProblems?.includes(problem.id)
                    
                    return (
                      <tr key={problem.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-success"
                            checked={isCompleted}
                            onChange={() => markProblemComplete(problem.id)}
                          />
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {index + 1}. {problem.title}
                            </div>
                            <div className="text-sm text-base-content/60 truncate max-w-xs">
                              {problem.description}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </div>
                        </td>
                        <td>
                          <div className="text-sm">{problem.tags?.join(', ')}</div>
                        </td>
                        <td>
                          <RouterLink
                            to={`/problems/${problem.id}`}
                            className="btn btn-primary btn-outline btn-sm"
                          >
                            <FiCode className="mr-2" />
                            Solve
                          </RouterLink>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {isOpen && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Purchase Premium Sheet</h3>
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            
            <div className="py-4 space-y-4">
              <p>
                <strong>{sheet.title}</strong> - Premium DSA Sheet
              </p>
              <p>
                Get access to {sheet.totalProblems} carefully curated problems on {sheet.topic}.
              </p>
              <p className="text-xl font-bold text-primary">
                Price: ₹{sheet.price}
              </p>
              <p className="text-sm text-base-content/60">
                Secure payment powered by Razorpay
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
                className={`btn btn-primary ${paymentLoading ? 'loading' : ''}`}
                onClick={handlePurchase}
                disabled={paymentLoading}
              >
                Pay ₹{sheet.price}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default SheetDetail