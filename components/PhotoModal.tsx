import React, { useEffect, useCallback, useState } from 'react'
import CommentThread from './comments/CommentThread'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, MessageCircle, Heart, ThumbsUp, Laugh, Meh, Zap, Trash2, Edit2, Check, XCircle } from 'lucide-react'
import { Photo } from '@/types'
import { useToast } from '@/components/ui/toast'

type Comment = {
  id: number
  content: string
  created_at: string
  updated_at: string
  parentId?: number | null
  user: {
    id: number
    username: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

type Reaction = {
  id: number
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad'
  created_at: string
  user: {
    id: number
    username: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }
}

interface PhotoModalProps {
  photo: Photo
  photos: Photo[]
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
}

export default function PhotoModal({ photo, photos, onClose, onNavigate }: PhotoModalProps) {
  const { success, error } = useToast()
  // Handler pour poster une réponse
  // Handler pour poster une réponse
  const handleReplyComment = async (content: string, parentId: number) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id, content, parentId }),
      })
      const data = await res.json()
      if (res.ok && data.comment) {
        setComments([data.comment, ...comments])
        success('Réponse publiée')
        // Rafraîchir le feed d'accueil
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('feed:refresh'))
        }
      }
    } catch (e) {
      error("Impossible d'envoyer la réponse")
    }
  }


  const currentIndex = photos.findIndex(p => p.id === photo.id)
  const photoNumber = `${currentIndex + 1} / ${photos.length}`

  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; is_admin: boolean } | null>(null)
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingReactions, setLoadingReactions] = useState(false)
  const [userReaction, setUserReaction] = useState<Reaction['type'] | null>(null)
  const [editingPhoto, setEditingPhoto] = useState(false)
  const [editTitle, setEditTitle] = useState(photo.title)
  const [editDescription, setEditDescription] = useState(photo.description)

  // Charger le user connecté
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = await res.json()
        if (mounted && data.user) {
          setCurrentUser({ id: data.user.id, username: data.user.username, is_admin: data.user.is_admin || false })
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Charger commentaires et réactions
  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      try {
        setLoadingComments(true)
        setLoadingReactions(true)
        const [commentsRes, reactionsRes] = await Promise.all([
          fetch(`/api/comments?photoId=${photo.id}`, { cache: 'no-store' }),
          fetch(`/api/reactions?photoId=${photo.id}`, { cache: 'no-store' }),
        ])
        const commentsData = await commentsRes.json()
        const reactionsData = await reactionsRes.json()
        if (!mounted) return
        setComments(commentsData.comments || [])
        setReactions(reactionsData.reactions || [])
        // Trouver la réaction du user courant
        if (currentUser) {
          const myReaction = (reactionsData.reactions || []).find((r: Reaction) => r.user.id === currentUser.id)
          setUserReaction(myReaction ? myReaction.type : null)
        }
      } catch (e) {
        console.error('Load data error', e)
      } finally {
        if (mounted) {
          setLoadingComments(false)
          setLoadingReactions(false)
        }
      }
    }
    loadData()
    return () => {
      mounted = false
    }
  }, [photo.id, currentUser])

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo.id, content: newComment.trim() }),
      })
      const data = await res.json()
      if (res.ok && data.comment) {
        setComments([data.comment, ...comments])
        setNewComment('')
        success('Commentaire publié')
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('feed:refresh'))
        }
      }
    } catch (e) {
      console.error('Add comment error', e)
      error("Impossible d'envoyer le commentaire")
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`/api/comments?commentId=${commentId}`, { method: 'DELETE' })
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
        success('Commentaire supprimé')
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('feed:refresh'))
        }
      }
    } catch (e) {
      console.error('Delete comment error', e)
      error('Erreur lors de la suppression du commentaire')
    }
  }

  const handleReaction = async (type: Reaction['type']) => {
    try {
      if (userReaction === type) {
        // Retirer la réaction
        const res = await fetch(`/api/reactions?photoId=${photo.id}`, { method: 'DELETE' })
        if (res.ok) {
          setUserReaction(null)
          setReactions(reactions.filter((r) => r.user.id !== currentUser?.id))
          success('Réaction retirée')
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('feed:refresh'))
          }
        }
      } else {
        // Ajouter/modifier la réaction
        const res = await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId: photo.id, type }),
        })
        const data = await res.json()
        if (res.ok && data.reaction) {
          setUserReaction(type)
          // Retirer l'ancienne réaction du user et ajouter la nouvelle
          setReactions([data.reaction, ...reactions.filter((r) => r.user.id !== currentUser?.id)])
          success('Réaction enregistrée')
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('feed:refresh'))
          }
        }
      }
    } catch (e) {
      console.error('Reaction error', e)
      error('Erreur lors de la réaction')
    }
  }

  const displayName = (u: Comment['user']) => {
    if (u.first_name || u.last_name) {
      return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
    }
    return u.username
  }

  const getInitials = (u: Comment['user']) => {
    const name = displayName(u)
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const reactionCounts = reactions.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Mise à jour de la photo (admin seulement)
  const handleUpdatePhoto = async () => {
    if (!currentUser?.is_admin) return
    
    try {
      const res = await fetch(`/api/photos/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription
        })
      })
      
      if (res.ok) {
        photo.title = editTitle
        photo.description = editDescription
        setEditingPhoto(false)
        success('Photo mise à jour')
      } else {
        error('Erreur lors de la mise à jour')
      }
    } catch (e) {
      console.error('Erreur mise à jour photo', e)
      error('Erreur lors de la mise à jour')
    }
  }

  const cancelEditPhoto = () => {
    setEditTitle(photo.title)
    setEditDescription(photo.description)
    setEditingPhoto(false)
  }

  // Suppression de photo (admin seulement)
  const handleDeletePhoto = async () => {
    if (!currentUser?.is_admin) return
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return
    
    try {
      const res = await fetch(`/api/photos/${photo.id}`, { method: 'DELETE' })
      if (res.ok) {
        onClose()
        success('Photo supprimée')
        window.location.reload() // Rafraîchir la page
      } else {
        error('Erreur lors de la suppression')
      }
    } catch (e) {
      console.error('Erreur suppression photo', e)
      error('Erreur lors de la suppression')
    }
  }


  // Calculer les index des photos adjacentes
  const prevIndex = (currentIndex - 1 + photos.length) % photos.length
  const nextIndex = (currentIndex + 1) % photos.length
  const prevPhoto = photos[prevIndex]
  const nextPhoto = photos[nextIndex]

  // Calculer les photos +2 et -2 pour préchargement anticipé
  const prevIndex2 = (currentIndex - 2 + photos.length) % photos.length
  const nextIndex2 = (currentIndex + 2) % photos.length
  const prevPhoto2 = photos[prevIndex2]
  const nextPhoto2 = photos[nextIndex2]

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') onNavigate('prev')
    if (e.key === 'ArrowRight') onNavigate('next')
  }, [onClose, onNavigate])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-fade-in" onClick={onClose}>
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Content Container - Image centrée avec overlays */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec avatar et nom - Overlay en haut */}
          <div className="absolute top-0 left-0 right-0 z-30 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {photo.user?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photo.user.avatar_url}
                      alt={displayName(photo.user)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-sm">
                      {getInitials(photo.user || { id: 0, username: 'U', first_name: null, last_name: null, avatar_url: null })}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-white drop-shadow-lg">
                    {photo.user ? displayName(photo.user) : 'Utilisateur'}
                  </p>
                  <p className="text-sm text-white/90 drop-shadow-md">{photo.title}</p>
                </div>
              </div>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-full transition-all"
                aria-label="Fermer"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            className="group absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-40"
            aria-label="Photo précédente"
          >
            <ChevronLeft size={24} className="text-stone-800" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            className="group absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-40"
            aria-label="Photo suivante"
          >
            <ChevronRight size={24} className="text-stone-800" />
          </button>

          {/* Image Principale */}
          <div className="relative w-full aspect-[3/4] md:aspect-[4/5] bg-black flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>

          {/* Footer avec likes et commentaire - Overlay en bas */}
          <div className="absolute bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-white via-white to-transparent">
            {/* Likes */}
            <div className="flex items-center gap-2 mb-3">
              <Heart 
                size={24} 
                className={`cursor-pointer transition-all ${userReaction === 'love' ? 'fill-red-500 text-red-500' : 'text-stone-700 hover:text-red-500'}`}
                onClick={() => handleReaction('love')}
              />
              {reactions.filter(r => r.type === 'love').length > 0 && (
                <p className="text-sm font-semibold text-stone-700">
                  {reactions.filter(r => r.type === 'love').length} like{reactions.filter(r => r.type === 'love').length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Input commentaire */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {currentUser && (
                  <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-sm">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="flex-1 px-4 py-2 text-sm text-stone-700 bg-stone-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2.5 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle size={18} />
              </button>
            </form>
          </div>

          {/* Préchargement des images adjacentes (invisibles) */}
          <div className="hidden">
            {prevPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={prevPhoto.src} alt={`Préchargement: ${prevPhoto.title}`} />
            )}
            {nextPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={nextPhoto.src} alt={`Préchargement: ${nextPhoto.title}`} />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
