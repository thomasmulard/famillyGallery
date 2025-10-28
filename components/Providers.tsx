'use client'

import { ThemeProvider as Provider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/ui/toast'
import React from 'react'
import { useToast } from '@/components/ui/toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <ToastProvider>
        <SessionExpiryWatcher />
        {children}
      </ToastProvider>
    </Provider>
  )
}

function SessionExpiryWatcher() {
  const { info, error } = useToast()
  const shownRef = React.useRef<{ day?: boolean; soon?: boolean }>({})

  React.useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = await res.json()
        if (!data?.expires_at) return
        const exp = new Date(data.expires_at).getTime()
        const now = Date.now()
        const diffMs = exp - now
        if (diffMs <= 0) return
        const diffMin = Math.floor(diffMs / 60000)
        if (diffMin <= 5 && !shownRef.current.soon) {
          shownRef.current.soon = true
          info('Votre session expire dans moins de 5 minutes')
        } else if (diffMin <= 60 * 24 && !shownRef.current.day) {
          shownRef.current.day = true
          info('Votre session expire dans moins de 24 heures')
        }
      } catch (e) {
        // Optionnel: signaler une erreur de récupération de session
      }
    }

    check()
    const interval = setInterval(check, 60 * 60 * 1000) // toutes les heures
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [info, error])

  return null
}
