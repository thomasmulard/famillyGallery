'use client'

import { X, Home, FolderOpen, Images, Upload, Settings, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'
import UserMenu from './UserMenu'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { id: 'home', icon: Home, title: 'Accueil', subtitle: "Page d'accueil" },
  { id: 'albums', icon: FolderOpen, title: 'Mes Albums', subtitle: 'Collections' },
  { id: 'gallery', icon: Images, title: 'Galerie Photos', subtitle: 'Navigation complète' },
  { id: 'upload', icon: Upload, title: 'Télécharger', subtitle: 'Ajouter des photos' },
  { id: 'admin', icon: Shield, title: 'Administration', subtitle: 'Gestion utilisateurs', adminOnly: true },
  { id: 'settings', icon: Settings, title: 'Paramètres', subtitle: 'Configuration' },
]

export default function Sidebar({ currentPage, onPageChange, isOpen, onClose }: SidebarProps) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setIsAdmin(data.user?.is_admin || false)
        }
      } catch (e) {
        console.error('Erreur vérification admin', e)
      }
    }
    checkAdmin()
  }, [])

  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin)
  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-6 z-50
        transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Images className="text-primary" size={32} />
            <div>
              <h1 className="text-xl font-semibold text-foreground">FamilyShare</h1>
              <p className="text-sm text-muted-foreground -mt-1">Gallery</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id)
                  if (window.innerWidth < 1024) onClose()
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl font-medium
                  transition-all duration-200 hover:translate-x-1 text-left
                  ${isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-foreground hover:bg-muted hover:shadow-sm'
                  }
                `}
              >
                <Icon 
                  size={20} 
                  className={`flex-shrink-0 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                />
                <div className="flex-1">
                  <div className="text-sm">{item.title}</div>
                  <div className={`text-xs mt-0.5 ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                    {item.subtitle}
                  </div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer utilisateur */}
        <div className="mt-6 pt-4 border-t border-border">
          <UserMenu variant="footer" />
        </div>
      </aside>
    </>
  )
}
