import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

const typeConfig = {
  success: {
    bg: 'bg-emerald-600',
    icon: CheckCircle,
    text: 'text-white',
  },
  error: {
    bg: 'bg-rose-600',
    icon: AlertCircle,
    text: 'text-white',
  },
  info: {
    bg: 'bg-sky-600',
    icon: Info,
    text: 'text-white',
  },
  warning: {
    bg: 'bg-amber-500',
    icon: AlertTriangle,
    text: 'text-white',
  },
}

let toastId = 0

function ToastItem({ id, message, type = 'info', onDismiss }) {
  const config = typeConfig[type] || typeConfig.info
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative flex items-start gap-3 overflow-hidden rounded-xl shadow-lg ${config.bg}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.bg}`} />
      <div className="flex items-start gap-3 p-4 pl-5">
        <Icon className="h-5 w-5 shrink-0 mt-0.5 text-white" />
        <p className="text-sm font-medium text-white flex-1">{message}</p>
        <button
          onClick={() => onDismiss(id)}
          className="shrink-0 rounded-lg p-1 text-white/70 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    if (timers.current[id]) {
      clearTimeout(timers.current[id])
      delete timers.current[id]
    }
  }, [])

  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = ++toastId
      setToasts((prev) => [...prev, { id, message, type }])
      timers.current[id] = setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem {...t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
