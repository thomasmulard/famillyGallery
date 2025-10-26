export interface Photo {
  id: number
  src: string
  thumbnail?: string  // Miniature optimisée pour l'affichage dans la grille
  title: string
  description: string
  date: string
  category: 'vacances' | 'fetes' | 'quotidien'
  year: string
  location?: string
  people?: string[]
}

export type ViewMode = 'compact' | 'comfortable' | 'spacious' | 'masonry' | 'list'

export interface Filters {
  categories: string[]
  years: string[]
  search: string
}
