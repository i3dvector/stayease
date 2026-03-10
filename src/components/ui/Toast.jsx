import { useState, useCallback, createContext, useContext, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div id="toast-container">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const icons = {
    success: <CheckCircle size={16} className="text-emerald-600" />,
    error: <XCircle size={16} className="text-red-600" />,
    warning: <AlertCircle size={16} className="text-amber-600" />,
  }
  const borders = {
    success: 'border-l-4 border-emerald-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-amber-500',
  }

  return (
    <div className={`flex items-center gap-3 bg-white shadow-lg rounded-lg px-4 py-3 min-w-64 ${borders[toast.type] ?? borders.success}`}>
      {icons[toast.type]}
      <span className="text-sm text-gray-800 flex-1">{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} className="text-gray-400 hover:text-gray-600">
        <X size={14} />
      </button>
    </div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
