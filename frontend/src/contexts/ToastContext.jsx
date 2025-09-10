import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (type, title, message) => {
    const id = Date.now()
    const toast = { id, type, title, message }
    
    setToasts(prev => [...prev, toast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const showSuccess = (title, message) => showToast('success', title, message)
  const showError = (title, message) => showToast('error', title, message)
  const showWarning = (title, message) => showToast('warning', title, message)
  const showInfo = (title, message) => showToast('info', title, message)

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getAlertClass = (type) => {
    switch (type) {
      case 'success': return 'alert-success'
      case 'error': return 'alert-error'
      case 'warning': return 'alert-warning'
      case 'info': return 'alert-info'
      default: return 'alert-info'
    }
  }

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast toast-top toast-end z-50">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`alert ${getAlertClass(toast.type)} cursor-pointer shadow-lg`} 
            onClick={() => removeToast(toast.id)}
          >
            <div>
              <div className="font-bold">{toast.title}</div>
              <div className="text-sm">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}