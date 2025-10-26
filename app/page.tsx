'use client'

import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import Breadcrumb from '@/components/Breadcrumb'
import GalleryHeader from '@/components/GalleryHeader'
import PhotoGrid from '@/components/PhotoGrid'
import PhotoModal from '@/components/PhotoModal'
import Feed from '@/components/Feed'
import MyAlbums from '@/components/MyAlbums'
import Upload from '@/components/Upload'
import Admin from '@/components/Admin'
import { photos as staticPhotos } from '@/data/photos'
import { Photo, ViewMode } from '@/types'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('gallery')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('comfortable')
  const [filters, setFilters] = useState({
    categories: ['all'] as string[],
    years: ['2024'] as string[],
    search: '',
  })
  const [dbPhotos, setDbPhotos] = useState<Photo[]>([])

  // Fetch photos from database
  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos')
      if (res.ok) {
        const data = await res.json()
        setDbPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }
  useEffect(() => {
    fetchPhotos()
  }, [])

  // Merge static photos with database photos
  const allPhotos = useMemo(() => {
    return [...staticPhotos, ...dbPhotos]
  }, [dbPhotos])

  // Filter photos avec useMemo pour éviter les recalculs
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      const categoryMatch = filters.categories.includes('all') || 
                           filters.categories.includes(photo.category)
      const yearMatch = filters.years.includes(photo.year)
      const searchMatch = filters.search === '' ||
                         photo.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         photo.description.toLowerCase().includes(filters.search.toLowerCase())
      
      return categoryMatch && yearMatch && searchMatch
    })
  }, [filters])

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
  }

  const handleFeedPhotoClick = (photoId: number) => {
    // Find photo in merged list
    const photo = allPhotos.find(p => p.id === photoId)
    if (photo) {
      setSelectedPhoto(photo)
    }
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
  }

  const handleNavigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return
    
    const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto.id)
    let newIndex
    
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length
    } else {
      newIndex = (currentIndex + 1) % filteredPhotos.length
    }
    
    setSelectedPhoto(filteredPhotos[newIndex])
  }

  return (
    <>
      <Sidebar 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <MobileNav 
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="transition-all duration-300 lg:ml-72 pb-20 lg:pb-6">
        <div className="container mx-auto max-w-[1400px] p-6">
          <Breadcrumb />
          {currentPage === 'home' ? (
            <Feed onPhotoClick={handleFeedPhotoClick} />
          ) : currentPage === 'albums' ? (
            <MyAlbums />
          ) : currentPage === 'upload' ? (
            <Upload onUploadSuccess={fetchPhotos} />
          ) : currentPage === 'admin' ? (
            <Admin />
          ) : (
            <>
              <GalleryHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                filters={filters}
                onFiltersChange={setFilters}
                photoCount={filteredPhotos.length}
              />

              <PhotoGrid
                photos={filteredPhotos}
                viewMode={viewMode}
                onPhotoClick={handlePhotoClick}
              />
            </>
          )}
        </div>
      </main>

      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          photos={filteredPhotos}
          onClose={handleCloseModal}
          onNavigate={handleNavigatePhoto}
        />
      )}
    </>
  )
}
