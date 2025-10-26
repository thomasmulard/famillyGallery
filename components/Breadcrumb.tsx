'use client'

import { Home, ChevronRight } from 'lucide-react'

export default function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 mb-6 text-sm">
      <Home size={16} className="text-muted-foreground" />
      <button className="px-2 py-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
        Accueil
      </button>
      <ChevronRight size={14} className="text-muted-foreground" />
      <span className="font-medium text-foreground">Galerie Photos</span>
    </nav>
  )
}
