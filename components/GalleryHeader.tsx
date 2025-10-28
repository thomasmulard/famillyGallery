'use client'

import { useState, useCallback, useEffect } from 'react'
import { Grid, LayoutGrid, Search, Filter, Images as ImagesIcon, FolderOpen, Calendar, Grid3x3, Maximize2, List } from 'lucide-react'
import { Filters, ViewMode } from '@/types'
import ThemeToggle from './ThemeToggle'
import { useDebounce } from '@/lib/hooks'

interface GalleryHeaderProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  photoCount: number
}

export default function GalleryHeader({
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  photoCount,
}: GalleryHeaderProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search)
  const [people, setPeople] = useState<Array<{ id: number; displayName: string; avatar_url: string | null }>>([])
  const [uploaders, setUploaders] = useState<Array<{ id: number; displayName: string; avatar_url: string | null }>>([])
  
  // Debounce la recherche pour optimiser les performances
  const debouncedSearch = useDebounce(searchInput, 300)

  // Mettre à jour les filtres quand le debounce change
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch })
    }
  }, [debouncedSearch, filters, onFiltersChange])

  const handleCategoryChange = (category: string) => {
    if (category === 'all') {
      onFiltersChange({ ...filters, categories: ['all'] })
    } else {
      const newCategories = filters.categories.includes(category)
        ? filters.categories.filter(c => c !== category)
        : [...filters.categories.filter(c => c !== 'all'), category]
      
      onFiltersChange({
        ...filters,
        categories: newCategories.length === 0 ? ['all'] : newCategories,
      })
    }
  }

  // Chargement des listes pour filtres avancés
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [peopleRes, uploadersRes] = await Promise.all([
          fetch('/api/auth/users', { cache: 'no-store' }),
          fetch('/api/photos/uploaders', { cache: 'no-store' }),
        ])
        if (peopleRes.ok) {
          const data = await peopleRes.json()
          if (mounted) setPeople((data.users || []).map((u: any) => ({ id: u.id, displayName: u.displayName || u.username, avatar_url: u.avatar_url || null })))
        }
        if (uploadersRes.ok) {
          const data = await uploadersRes.json()
          if (mounted) setUploaders((data.users || []).map((u: any) => ({ id: u.id, displayName: u.displayName || u.username, avatar_url: u.avatar_url || null })))
        }
      } catch (e) {
        // silencieux
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const togglePerson = (id: number) => {
    const current = filters.peopleIds ?? []
    const exists = current.includes(id)
    const next = exists ? current.filter(x => x !== id) : [...current, id]
    onFiltersChange({ ...filters, peopleIds: next })
  }

  const toggleUploader = (id: number) => {
    const current = filters.uploaderIds ?? []
    const exists = current.includes(id)
    const next = exists ? current.filter(x => x !== id) : [...current, id]
    onFiltersChange({ ...filters, uploaderIds: next })
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">Galerie Photos</h2>
          <p className="text-muted-foreground">Découvrez tous nos moments précieux en famille</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* View Controls */}
          <div className="hidden md:flex gap-1 bg-card border border-border rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('compact')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors text-sm ${
                viewMode === 'compact'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Vue compacte - Grille dense 6 colonnes"
            >
              <Grid3x3 size={18} />
              <span className="hidden lg:inline">Compact</span>
            </button>
            <button
              onClick={() => onViewModeChange('comfortable')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors text-sm ${
                viewMode === 'comfortable'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Vue confortable - Grille classique 4 colonnes"
            >
              <Grid size={18} />
              <span className="hidden lg:inline">Normal</span>
            </button>
            <button
              onClick={() => onViewModeChange('spacious')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors text-sm ${
                viewMode === 'spacious'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Vue spacieuse - Grandes photos 3 colonnes"
            >
              <Maximize2 size={18} />
              <span className="hidden lg:inline">Large</span>
            </button>
            <button
              onClick={() => onViewModeChange('masonry')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors text-sm ${
                viewMode === 'masonry'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Vue mosaïque - Disposition en colonnes"
            >
              <LayoutGrid size={18} />
              <span className="hidden lg:inline">Mosaïque</span>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors text-sm ${
                viewMode === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title="Vue liste - Affichage détaillé"
            >
              <List size={18} />
              <span className="hidden lg:inline">Liste</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Search */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 min-w-[240px] focus-within:ring-2 focus-within:ring-primary/20">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher des photos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
          >
            <Filter size={20} />
            Filtres
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Catégories</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'all', label: 'Toutes les photos' },
                  { value: 'vacances', label: 'Vacances' },
                  { value: 'fetes', label: 'Fêtes' },
                  { value: 'quotidien', label: 'Quotidien' },
                ].map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(cat.value)}
                      onChange={() => handleCategoryChange(cat.value)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm">{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Personnes taguées */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Personnes</h4>
              {people.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun membre disponible</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {people.map(p => {
                    const selected = (filters.peopleIds ?? []).includes(p.id)
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePerson(p.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'}`}
                        title={p.displayName}
                      >
                        {p.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.avatar_url} alt={p.displayName} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold">
                            {p.displayName.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()}
                          </span>
                        )}
                        <span className="truncate max-w-[140px]">{p.displayName}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Uploader */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Ajoutées par</h4>
              {uploaders.length === 0 ? (
                <div className="text-sm text-muted-foreground">Aucun uploader</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {uploaders.map(u => {
                    const selected = (filters.uploaderIds ?? []).includes(u.id)
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggleUploader(u.id)}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border hover:bg-muted'}`}
                        title={u.displayName}
                      >
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt={u.displayName} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-semibold">
                            {u.displayName.split(' ').map(x => x[0]).join('').slice(0,2).toUpperCase()}
                          </span>
                        )}
                        <span className="truncate max-w-[140px]">{u.displayName}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-6 bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <ImagesIcon size={18} className="text-primary" />
          <span className="text-muted-foreground">
            {photoCount} photo{photoCount > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FolderOpen size={18} className="text-primary" />
          <span className="text-muted-foreground">5 albums</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={18} className="text-primary" />
          <span className="text-muted-foreground">Cette année</span>
        </div>
      </div>
    </>
  )
}
