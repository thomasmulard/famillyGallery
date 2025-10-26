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

  const handleYearChange = (year: string) => {
    const newYears = filters.years.includes(year)
      ? filters.years.filter(y => y !== year)
      : [...filters.years, year]
    
    if (newYears.length > 0) {
      onFiltersChange({ ...filters, years: newYears })
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <h4 className="text-sm font-semibold mb-3">Année</h4>
              <div className="flex flex-wrap gap-3">
                {['2024', '2023'].map((year) => (
                  <label key={year} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.years.includes(year)}
                      onChange={() => handleYearChange(year)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <span className="text-sm">{year}</span>
                  </label>
                ))}
              </div>
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
