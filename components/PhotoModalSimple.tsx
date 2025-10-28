import React, { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send } from 'lucide-react'
import { Photo } from '@/types'
import { useToast } from '@/components/ui/toast'
import CommentThread from './comments/CommentThread'

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
  user: {
    id: number
    username: string
    first_name: string | null
    last_name: string | null
  }
}

interface PhotoModalProps {
  photo: Photo
  photos: Photo[]
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
}

export default function PhotoModalSimple({ photo, photos, onClose, onNavigate }: PhotoModalProps) {
  const { success, error } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; is_admin: boolean } | null>(null)
  const [loadingComments, setLoadingComments] = useState(false)
  const [userReaction, setUserReaction] = useState<Reaction['type'] | null>(null)

  const currentIndex = photos.findIndex(p => p.id === photo.id)
  const prevPhoto = photos[(currentIndex - 1 + photos.length) % photos.length]
  const nextPhoto = photos[(currentIndex + 1) % photos.length]

  // Charger user, commentaires et réactions
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoadingComments(true)
        const [sessionRes, commentsRes, reactionsRes] = await Promise.all([
          fetch('/api/auth/session', { cache: 'no-store' }),
          fetch(`/api/comments?photoId=${photo.id}`, { cache: 'no-store' }),
          fetch(`/api/reactions?photoId=${photo.id}`, { cache: 'no-store' }),
        ])
        const sessionData = await sessionRes.json()
        const commentsData = await commentsRes.json()
        const reactionsData = await reactionsRes.json()
        
        if (!mounted) return
        
        if (sessionData.user) {
          setCurrentUser({ id: sessionData.user.id, username: sessionData.user.username, is_admin: sessionData.user.is_admin || false })
        }
        setComments(commentsData.comments || [])
        setReactions(reactionsData.reactions || [])
        
        // Trouver la réaction du user
        if (sessionData.user) {
          const myReaction = (reactionsData.reactions || []).find((r: Reaction) => r.user.id === sessionData.user.id)
          setUserReaction(myReaction ? myReaction.type : null)
        }
      } catch (e) {
        console.error('Error loading data', e)
      } finally {
        if (mounted) {
          setLoadingComments(false)
        }
      }
    })()
    return () => {
      mounted = false
    }
  }, [photo.id])

  const displayName = (u: any) => {
    if (u?.first_name || u?.last_name) {
      return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
    }
    return u?.username || 'Utilisateur'
  }

  const getInitials = (u: any) => {
    const name = displayName(u)
    return name
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const handleReaction = async (type: Reaction['type']) => {
    try {
      if (userReaction === type) {
        // Retirer
        const res = await fetch(`/api/reactions?photoId=${photo.id}`, { method: 'DELETE' })
        if (res.ok) {
          setUserReaction(null)
          setReactions(reactions.filter((r) => r.user.id !== currentUser?.id))
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('feed:refresh'))
          }
        }
      } else {
        // Ajouter/modifier
        const res = await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoId: photo.id, type }),
        })
        const data = await res.json()
        if (res.ok && data.reaction) {
          setUserReaction(type)
          setReactions([data.reaction, ...reactions.filter((r) => r.user.id !== currentUser?.id)])
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('feed:refresh'))
          }
        }
      }
    } catch (e) {
      console.error('Reaction error', e)
    }
  }

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
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('feed:refresh'))
        }
      }
    } catch (e) {
      error("Impossible d'envoyer la réponse")
    }
  }

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

  const loveCount = reactions.filter(r => r.type === 'love').length

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

        {/* Content Container - Layout Horizontal adaptatif */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-[95vw] max-w-6xl mx-4 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
          style={{ maxHeight: '90vh', height: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Partie Gauche - Image (s'adapte à la taille disponible) */}
          <div className="relative flex-1 bg-black/10 dark:bg-card flex items-center justify-center overflow-hidden max-h-[40vh] md:max-h-none md:min-h-[600px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full h-full object-contain"
              loading="eager"
            />

            {/* Navigation Buttons - Sur l'image */}
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-40"
              aria-label="Photo précédente"
            >
              <ChevronLeft size={24} className="text-stone-800" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full transition-all duration-300 hover:scale-110 shadow-lg z-40"
              aria-label="Photo suivante"
            >
              <ChevronRight size={24} className="text-stone-800" />
            </button>
          </div>

          {/* Partie Droite - Infos et Commentaires */}
          <div className="w-full md:w-[380px] flex flex-col bg-white dark:bg-card max-h-[50vh] md:max-h-none">
            {/* Header avec avatar et nom */}
            <div className="p-4 border-b border-stone-200 dark:border-border flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 flex-1 min-w-0">
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
                      {getInitials(photo.user)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-800 dark:text-foreground truncate">
                    {photo.user ? displayName(photo.user) : 'Utilisateur'}
                  </p>
                  <p className="text-sm text-stone-600 dark:text-muted-foreground truncate">{photo.title}</p>
                </div>
              </div>
              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-stone-400 dark:text-muted-foreground hover:text-stone-600 dark:hover:text-foreground p-1.5 hover:bg-stone-100 dark:hover:bg-muted rounded-full transition-all flex-shrink-0"
                aria-label="Fermer"
              >
                <X size={22} />
              </button>
            </div>

            {/* Zone de scroll pour les commentaires */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Liste des commentaires */}
              <div>
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-stone-800 dark:text-foreground">
                  <MessageCircle size={16} /> Commentaires ({comments.length})
                </h4>
                
                {loadingComments ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-stone-200 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-24 bg-stone-200 rounded" />
                          <div className="h-3 w-full bg-stone-200 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-sm text-stone-500 dark:text-muted-foreground">Aucun commentaire pour le moment.</div>
                ) : (
                  <div className="space-y-3">
                    <CommentThread
                      comments={comments}
                      parentId={null}
                      currentUser={currentUser}
                      displayName={displayName}
                      getInitials={getInitials}
                      handleDeleteComment={handleDeleteComment}
                      handleReplyComment={handleReplyComment}
                      photoId={photo.id}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer fixe avec input de commentaire */}
            <div className="p-4 border-t border-stone-200 dark:border-border bg-white dark:bg-card flex-shrink-0">
              {/* Likes */}
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-stone-200 dark:border-border">
                <Heart 
                  size={26} 
                  className={`cursor-pointer transition-all ${userReaction === 'love' ? 'fill-red-500 text-red-500' : 'text-stone-700 dark:text-foreground hover:text-red-500 hover:scale-110'}`}
                  onClick={() => handleReaction('love')}
                />
                {loveCount > 0 && (
                  <p className="text-sm font-semibold text-stone-700 dark:text-foreground">
                    {loveCount} like{loveCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center gap-2">
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {currentUser && (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-semibold text-xs">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-4 py-2 text-sm text-stone-700 dark:text-foreground bg-stone-100 dark:bg-muted border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 dark:focus:ring-primary focus:bg-white dark:focus:bg-background transition"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="p-2.5 bg-stone-200 dark:bg-muted hover:bg-stone-300 dark:hover:bg-muted/80 text-stone-600 dark:text-foreground rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Préchargement des images adjacentes */}
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
