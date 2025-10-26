"use client"

import { useEffect, useState, useRef } from 'react'
import { Upload as UploadIcon, Image as ImageIcon, X, Check, AlertCircle, FolderOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Album = {
  id: number
  title: string
}

type UploadFile = {
  id: string
  file: File
  preview: string
  title: string
  description: string
  category: string
  location: string
  albumId: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
}

const CATEGORIES = [
  { value: 'quotidien', label: 'Quotidien' },
  { value: 'vacances', label: 'Vacances' },
  { value: 'fetes', label: 'Fêtes' },
]

export default function Upload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [albums, setAlbums] = useState<Album[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Charger les albums de l'utilisateur
    const loadAlbums = async () => {
      try {
        const res = await fetch('/api/albums', { cache: 'no-store' })
        const data = await res.json()
        setAlbums(data.albums || [])
      } catch (e) {
        console.error('Load albums error', e)
      }
    }
    loadAlbums()
  }, [])

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: UploadFile[] = Array.from(selectedFiles).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''), // Nom sans extension
      description: '',
      category: 'quotidien',
      location: '',
      albumId: '',
      status: 'pending',
      progress: 0,
    }))

    setFiles([...files, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const updateFile = (id: string, updates: Partial<UploadFile>) => {
    setFiles(files.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const removeFile = (id: string) => {
    const file = files.find((f) => f.id === id)
    if (file?.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFiles(files.filter((f) => f.id !== id))
  }

  const uploadFile = async (fileToUpload: UploadFile) => {
    updateFile(fileToUpload.id, { status: 'uploading', progress: 0 })

    try {
      const formData = new FormData()
      formData.append('file', fileToUpload.file)
      formData.append('title', fileToUpload.title)
      formData.append('description', fileToUpload.description)
      formData.append('category', fileToUpload.category)
      formData.append('location', fileToUpload.location)
      if (fileToUpload.albumId) {
        formData.append('albumId', fileToUpload.albumId)
      }

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          updateFile(fileToUpload.id, { progress })
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          updateFile(fileToUpload.id, { status: 'success', progress: 100 })
          if (onUploadSuccess) onUploadSuccess();
        } else {
          updateFile(fileToUpload.id, {
            status: 'error',
            error: 'Erreur lors de l\'upload',
          })
        }
      })

      xhr.addEventListener('error', () => {
        updateFile(fileToUpload.id, {
          status: 'error',
          error: 'Erreur réseau',
        })
      })

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    } catch (e) {
      updateFile(fileToUpload.id, {
        status: 'error',
        error: 'Erreur lors de l\'upload',
      })
    }
  }

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending')
    for (const file of pendingFiles) {
      await uploadFile(file)
    }
  }

  const clearCompleted = () => {
    files.forEach((f) => {
      if (f.status === 'success' || f.status === 'error') {
        if (f.preview) URL.revokeObjectURL(f.preview)
      }
    })
    setFiles(files.filter((f) => f.status === 'pending' || f.status === 'uploading'))
  }

  const pendingCount = files.filter((f) => f.status === 'pending').length
  const successCount = files.filter((f) => f.status === 'success').length
  const errorCount = files.filter((f) => f.status === 'error').length

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold">Télécharger des photos</h2>
        <p className="text-sm text-muted-foreground">
          Ajoutez vos photos à la galerie. Elles seront automatiquement optimisées.
        </p>
      </header>

      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all
          ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <UploadIcon size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">
          Glissez vos photos ici ou cliquez pour sélectionner
        </h3>
        <p className="text-sm text-muted-foreground">
          Formats acceptés : JPG, PNG, WebP, etc. • Optimisation automatique
        </p>
      </div>

      {/* Actions globales */}
      {files.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-4 bg-card rounded-xl border border-border">
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              {files.length} fichier{files.length > 1 ? 's' : ''}
            </span>
            {successCount > 0 && <span className="text-green-600">✓ {successCount} réussi(s)</span>}
            {errorCount > 0 && <span className="text-red-600">✗ {errorCount} erreur(s)</span>}
          </div>
          <div className="flex gap-2">
            {(successCount > 0 || errorCount > 0) && (
              <button
                onClick={clearCompleted}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Effacer les terminés
              </button>
            )}
            {pendingCount > 0 && (
              <button
                onClick={uploadAll}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Télécharger tout ({pendingCount})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Liste des fichiers */}
      <div className="space-y-4">
        <AnimatePresence>
          {files.map((fileItem) => (
            <motion.div
              key={fileItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="flex gap-4 p-4">
                {/* Preview */}
                <div className="relative w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileItem.preview}
                    alt={fileItem.title}
                    className="w-full h-full object-cover"
                  />
                  {fileItem.status === 'success' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <Check size={32} className="text-green-600" />
                    </div>
                  )}
                  {fileItem.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <AlertCircle size={32} className="text-red-600" />
                    </div>
                  )}
                </div>

                {/* Form */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Titre</label>
                    <input
                      type="text"
                      value={fileItem.title}
                      onChange={(e) => updateFile(fileItem.id, { title: e.target.value })}
                      disabled={fileItem.status !== 'pending'}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Catégorie</label>
                    <select
                      value={fileItem.category}
                      onChange={(e) => updateFile(fileItem.id, { category: e.target.value })}
                      disabled={fileItem.status !== 'pending'}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Lieu</label>
                    <input
                      type="text"
                      value={fileItem.location}
                      onChange={(e) => updateFile(fileItem.id, { location: e.target.value })}
                      disabled={fileItem.status !== 'pending'}
                      placeholder="Optionnel"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Album</label>
                    <select
                      value={fileItem.albumId}
                      onChange={(e) => updateFile(fileItem.id, { albumId: e.target.value })}
                      disabled={fileItem.status !== 'pending'}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    >
                      <option value="">Aucun album</option>
                      {albums.map((album) => (
                        <option key={album.id} value={album.id}>
                          {album.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <input
                      type="text"
                      value={fileItem.description}
                      onChange={(e) => updateFile(fileItem.id, { description: e.target.value })}
                      disabled={fileItem.status !== 'pending'}
                      placeholder="Optionnel"
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {fileItem.status === 'pending' && (
                    <>
                      <button
                        onClick={() => uploadFile(fileItem)}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        title="Télécharger"
                      >
                        <UploadIcon size={20} />
                      </button>
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                        title="Retirer"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                  {fileItem.status === 'success' && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                      title="Supprimer de la liste"
                    >
                      <Check size={20} />
                    </button>
                  )}
                  {fileItem.status === 'error' && (
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Supprimer de la liste"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {fileItem.status === 'uploading' && (
                <div className="px-4 pb-4">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Téléchargement en cours... {fileItem.progress}%
                  </p>
                </div>
              )}

              {/* Error message */}
              {fileItem.status === 'error' && fileItem.error && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-red-600">{fileItem.error}</p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {files.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune photo sélectionnée</p>
        </div>
      )}
    </div>
  )
}
