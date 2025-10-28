'use client'

import { motion } from 'framer-motion'
import { Heart, Share2, MapPin, Calendar } from 'lucide-react'
import { Photo, ViewMode } from '@/types'
import { useState, useEffect } from 'react'

interface PhotoGridProps {
  photos: Photo[]
  viewMode: ViewMode
  onPhotoClick: (photo: Photo) => void
}

export default function PhotoGrid({ photos, viewMode, onPhotoClick }: PhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  // Précharger les images
  useEffect(() => {
    const preloadImages = async () => {
      const imagesToPreload = photos.slice(0, 8) // Précharger les 8 premières
      imagesToPreload.forEach((photo) => {
        const img = document.createElement('img')
        img.src = photo.thumbnail || photo.src
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(photo.id))
        }
      })
    }
    preloadImages()
  }, [photos])
  if (photos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Aucune photo trouvée</h3>
        <p className="text-muted-foreground">Essayez de modifier vos filtres ou votre recherche</p>
      </div>
    )
  }

  // Vue Liste
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: index * 0.01, ease: "easeOut" }}
            className="group flex items-center gap-4 bg-card rounded-xl border border-border p-3 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onPhotoClick(photo)}
          >
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.thumbnail || photo.src}
                alt={photo.title}
                className="w-full h-full object-cover"
                loading={index < 10 ? "eager" : "lazy"}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 truncate">{photo.title}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {photo.date}
                </span>
                {photo.location && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {photo.location}
                  </span>
                )}
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  {photo.category}
                </span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="Partager"
              >
                <Share2 size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="J'aime"
              >
                <Heart size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
  // Configuration des grilles selon le mode
  const gridConfig = {
    compact: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2',
    comfortable: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
    spacious: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8',
    masonry: 'columns-2 md:columns-3 lg:columns-4 gap-4'
  }

  const cardSizeConfig = {
    compact: 'aspect-square',
    comfortable: 'aspect-[4/3]',
    spacious: 'aspect-[16/10]',
    masonry: 'h-auto'
  }

  const paddingConfig = {
    compact: 'p-1',
    comfortable: 'p-3',
    spacious: 'p-4',
    masonry: 'p-3'
  }

  // Générer des hauteurs aléatoires pour le mode mosaïque
  const getMasonryHeight = (index: number) => {
    const heights = ['h-64', 'h-72', 'h-80', 'h-96']
    return heights[index % heights.length]
  }

  return (
    <div className={gridConfig[viewMode as keyof typeof gridConfig]}>
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.2, 
            delay: index * 0.02,
            ease: "easeOut"
          }}
          className={`group relative bg-card rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer ${
            viewMode === 'masonry' ? 'break-inside-avoid mb-4 inline-block w-full' : ''
          }`}
          onClick={() => onPhotoClick(photo)}
        >
          <div className={`relative overflow-hidden ${
            viewMode === 'masonry' 
              ? getMasonryHeight(index)
              : cardSizeConfig[viewMode as keyof typeof cardSizeConfig]
          }`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.thumbnail || photo.src}
              alt={photo.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
              loading={index < 8 ? "eager" : "lazy"}
            />
              {/* Overlay - masqué en mode compact */}
            {viewMode !== 'compact' && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`absolute bottom-0 left-0 right-0 text-white ${paddingConfig[viewMode as keyof typeof paddingConfig]}`}>
                  <h3 className={`font-semibold mb-1 drop-shadow-md ${viewMode === 'spacious' ? 'text-xl' : 'text-sm md:text-base'}`}>
                    {photo.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{photo.reactions?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{photo.comments?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={`absolute ${viewMode === 'compact' ? 'top-1 right-1' : 'top-3 right-3'} flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className={`${viewMode === 'compact' ? 'p-1.5' : 'p-2'} bg-white/90 hover:bg-white rounded-lg backdrop-blur-sm transition-colors`}
                title="Partager"
              >
                <Share2 size={viewMode === 'compact' ? 16 : 18} className="text-foreground" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className={`${viewMode === 'compact' ? 'p-1.5' : 'p-2'} bg-white/90 hover:bg-white rounded-lg backdrop-blur-sm transition-colors`}
                title="J'aime"
              >
                <Heart size={viewMode === 'compact' ? 16 : 18} className="text-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
