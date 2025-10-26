'use client'

import { Home, FolderOpen, Images, Upload, Menu } from 'lucide-react'

interface MobileNavProps {
  currentPage: string
  onPageChange: (page: string) => void
  onMenuToggle: () => void
}

const navItems = [
  { id: 'home', icon: Home, label: 'Accueil' },
  { id: 'albums', icon: FolderOpen, label: 'Albums' },
  { id: 'gallery', icon: Images, label: 'Galerie' },
  { id: 'upload', icon: Upload, label: 'Upload' },
]

export default function MobileNav({ currentPage, onPageChange, onMenuToggle }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 shadow-lg">
      <div className="flex p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg
                transition-colors
                ${isActive 
                  ? 'bg-muted text-primary' 
                  : 'text-muted-foreground hover:bg-muted/50'
                }
              `}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
        <button
          onClick={onMenuToggle}
          className="flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Menu size={24} />
          <span className="text-xs font-medium">Menu</span>
        </button>
      </div>
    </nav>
  )
}
