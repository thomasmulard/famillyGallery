'use client'

import React from 'react'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  title?: string
  description?: string
  type?: ToastType
  duration?: number
}

type ToastContextValue = {
  show: (opts: Omit<ToastItem, 'id'>) => void
  success: (message: string, opts?: Partial<Omit<ToastItem, 'id' | 'description' | 'type'>>) => void
  error: (message: string, opts?: Partial<Omit<ToastItem, 'id' | 'description' | 'type'>>) => void
  info: (message: string, opts?: Partial<Omit<ToastItem, 'id' | 'description' | 'type'>>) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const idRef = React.useRef(1)

  const remove = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = React.useCallback<ToastContextValue['show']>(({ title, description, type = 'info', duration = 3000 }) => {
    const id = idRef.current++
    setToasts((prev) => [...prev, { id, title, description, type, duration }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }, [remove])

  const api: ToastContextValue = React.useMemo(() => ({
    show,
    success: (message, opts) => show({ title: message, type: 'success', ...(opts ?? {}) }),
    error: (message, opts) => show({ title: message, type: 'error', ...(opts ?? {}) }),
    info: (message, opts) => show({ title: message, type: 'info', ...(opts ?? {}) }),
  }), [show])

  const typeStyles: Record<ToastType, { container: string; icon: React.ReactNode }> = {
    success: {
      container: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
      icon: <CheckCircle2 className="text-emerald-500" size={18} />,
    },
    error: {
      container: 'border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200',
      icon: <AlertTriangle className="text-red-500" size={18} />,
    },
    info: {
      container: 'border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-200',
      icon: <Info className="text-blue-500" size={18} />,
    },
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Container top-right above modals */}
      <div className="pointer-events-none fixed top-4 right-4 z-[2000] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto w-[320px] max-w-[90vw] rounded-lg border px-3 py-2 shadow-xl backdrop-blur-sm transition-all ${typeStyles[(t.type ?? 'info') as ToastType].container}`}
            role="status"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {typeStyles[(t.type ?? 'info') as ToastType].icon}
              </div>
              <div className="flex-1 min-w-0">
                {t.title && <div className="text-sm font-semibold truncate">{t.title}</div>}
                {t.description && <div className="text-xs opacity-80 mt-0.5 line-clamp-3">{t.description}</div>}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="ml-1 text-xs text-foreground/60 hover:text-foreground"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
