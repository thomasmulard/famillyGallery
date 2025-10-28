export interface Photo {
  id: number
  src: string
  thumbnail?: string  // Miniature optimisée pour l'affichage dans la grille
  title: string
  description: string
  date: string
  category: 'vacances' | 'fetes' | 'quotidien'
  location?: string
  // Utilisateur ayant uploadé la photo
  user?: {
    id: number
    username: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
  // Utilisateurs tagués sur la photo (si disponible)
  tags?: Array<{
    id: number
    username: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }>
}

export type ViewMode = 'compact' | 'comfortable' | 'spacious' | 'masonry' | 'list'

export interface Filters {
  categories: string[]
  search: string
  // Filtres avancés
  peopleIds?: number[] // Photos contenant toutes ces personnes
  uploaderIds?: number[] // Photos uploadées par ces utilisateurs
}
