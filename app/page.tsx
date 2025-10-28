'use client'

import { useState, useMemo, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import Breadcrumb from '@/components/Breadcrumb'
import GalleryHeader from '@/components/GalleryHeader'
import PhotoGrid from '@/components/PhotoGrid'
import PhotoModalSimple from '@/components/PhotoModalSimple'
import Feed from '@/components/Feed'
import MyAlbums from '@/components/Albums'
import Upload from '@/components/Upload'
import Admin from '@/components/Admin'
import { Photo, ViewMode, Filters } from '@/types'

export default function Home() {
  const [currentPage, setCurrentPage] = useState('gallery')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('comfortable')
  const [filters, setFilters] = useState<Filters>({
    categories: ['all'] as string[],
    search: '',
    peopleIds: [] as number[],
    uploaderIds: [] as number[],
  })
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])

  // Fetch photos from database
  const fetchPhotos = async () => {
    try {
      const res = await fetch('/api/photos')
      if (res.ok) {
        const data = await res.json()
        setAllPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }
  useEffect(() => {
    fetchPhotos()
  }, [])

  // Filter photos avec useMemo pour éviter les recalculs
  const filteredPhotos = useMemo(() => {
    return allPhotos.filter(photo => {
      const categoryMatch = filters.categories.includes('all') || 
                           filters.categories.includes(photo.category)
      const searchMatch = filters.search === '' ||
                         photo.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         photo.description.toLowerCase().includes(filters.search.toLowerCase())
      // Filtre uploader: si des uploaders sont sélectionnés, l'uploader de la photo doit être dans la liste
      const uploaderMatch = (filters.uploaderIds?.length ?? 0) === 0 ||
        (photo.user && filters.uploaderIds?.includes(photo.user.id))
      // Filtre personnes taguées: si des personnes sont sélectionnées, la photo doit contenir TOUTES ces personnes
      const peopleIds = filters.peopleIds ?? []
      const tags = photo.tags ?? []
      const peopleMatch = peopleIds.length === 0 || (
        peopleIds.every(id => tags.some(t => t.id === id))
      )
      
      return categoryMatch && searchMatch && uploaderMatch && peopleMatch
    })
  }, [allPhotos, filters])

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
        <PhotoModalSimple
          photo={selectedPhoto}
          photos={filteredPhotos}
          onClose={handleCloseModal}
          onNavigate={handleNavigatePhoto}
        />
      )}
    </>
  )
}
