'use client'

import { useEffect } from 'react'

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Activer le cache des images
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker pas disponible, pas grave
      })
    }

    // Optimiser les animations
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms')
    }

    // Précharger les polices
    const fonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ]
    fonts.forEach(font => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = font
      document.head.appendChild(link)
    })
  }, [])

  return <>{children}</>
}
