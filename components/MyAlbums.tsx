"use client"

import { useEffect, useState } from 'react'
import { Plus, FolderOpen, Edit2, Trash2, Image as ImageIcon, Share2, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type Album = {
  id: number
  title: string
  description: string | null
  cover_photo_id: number | null
  is_shared: boolean
  created_at: string
  updated_at: string
  photo_count: number
  cover_path: string | null
  cover_thumbnail: string | null
}

export default function MyAlbums() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [formData, setFormData] = useState({ title: '', description: '', is_shared: false })
  const [submitting, setSubmitting] = useState(false)

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/albums', { cache: 'no-store' })
      const data = await res.json()
      setAlbums(data.albums || [])
    } catch (e) {
      console.error('Load albums error', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  const openCreateModal = () => {
    setEditingAlbum(null)
    setFormData({ title: '', description: '', is_shared: false })
    setShowModal(true)
  }

  const openEditModal = (album: Album) => {
    setEditingAlbum(album)
    setFormData({ title: album.title, description: album.description || '', is_shared: album.is_shared })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    try {
      setSubmitting(true)
      if (editingAlbum) {
        // Modifier
        const res = await fetch('/api/albums', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAlbum.id, ...formData }),
        })
        const data = await res.json()
        if (res.ok && data.album) {
          setAlbums(albums.map((a) => (a.id === editingAlbum.id ? data.album : a)))
        }
      } else {
        // Créer
        const res = await fetch('/api/albums', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        const data = await res.json()
        if (res.ok && data.album) {
          setAlbums([data.album, ...albums])
        }
      }
      setShowModal(false)
    } catch (e) {
      console.error('Submit album error', e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (albumId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) return

    try {
      const res = await fetch(`/api/albums?albumId=${albumId}`, { method: 'DELETE' })
      if (res.ok) {
        setAlbums(albums.filter((a) => a.id !== albumId))
      }
    } catch (e) {
      console.error('Delete album error', e)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Mes Albums</h2>
          <p className="text-sm text-muted-foreground">Organisez vos photos en albums personnalisés</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={20} />
          Créer un album
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : albums.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderOpen size={64} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun album pour le moment</h3>
          <p className="text-sm text-muted-foreground mb-4">Créez votre premier album pour organiser vos photos</p>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Créer un album
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {albums.map((album) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative rounded-xl overflow-hidden bg-card border border-border hover:shadow-lg transition-all"
            >
              {/* Image de couverture */}
              <div className="relative h-48 bg-muted flex items-center justify-center">
                {album.cover_thumbnail || album.cover_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.cover_thumbnail || album.cover_path || ''}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FolderOpen size={48} className="text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(album)}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    aria-label="Modifier"
                  >
                    <Edit2 size={16} className="text-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(album.id)}
                    className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>

                {/* Badge partage */}
                <div className="absolute top-2 left-2">
                  {album.is_shared ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      <Share2 size={12} />
                      Partagé
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-slate-500 text-white text-xs rounded-full">
                      <Lock size={12} />
                      Privé
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-1 truncate">{album.title}</h3>
                {album.description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{album.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon size={14} />
                  <span>{album.photo_count} photo{album.photo_count > 1 ? 's' : ''}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Créer/Modifier */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-card rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editingAlbum ? 'Modifier l\'album' : 'Créer un album'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Titre</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Mon album"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Description de l'album"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_shared"
                    checked={formData.is_shared}
                    onChange={(e) => setFormData({ ...formData, is_shared: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_shared" className="text-sm">Partager avec d'autres membres</label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.title.trim()}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? 'Enregistrement...' : editingAlbum ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
