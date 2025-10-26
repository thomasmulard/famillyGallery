import React, { useEffect, useCallback, useState } from 'react'
import CommentThread from './comments/CommentThread'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, MessageCircle, Heart, ThumbsUp, Laugh, Meh, Zap, Trash2, Edit2, Check, XCircle } from 'lucide-react'
import { Photo } from '@/types'

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
      }
    } catch (e) {
      // TODO: toast erreur
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
      }
    } catch (e) {
      console.error('Add comment error', e)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      const res = await fetch(`/api/comments?commentId=${commentId}`, { method: 'DELETE' })
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId))
      }
    } catch (e) {
      console.error('Delete comment error', e)
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
        }
      }
    } catch (e) {
      console.error('Reaction error', e)
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
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (e) {
      console.error('Erreur mise à jour photo', e)
      alert('Erreur lors de la mise à jour')
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
        window.location.reload() // Rafraîchir la page
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (e) {
      console.error('Erreur suppression photo', e)
      alert('Erreur lors de la suppression')
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
      <div className="fixed inset-0 z-[1000] flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        />

        {/* Content - Layout Horizontal Desktop / Vertical Mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative z-10 w-[95vw] lg:w-[85vw] lg:max-w-[1400px] h-[90vh] flex flex-col lg:flex-row gap-0 lg:gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-lg transition-all hover:rotate-90 z-30"
            aria-label="Fermer"
          >
            <X size={24} />
          </button>

          {/* Progress indicator */}
          <div className="absolute -top-12 left-0 right-20 flex items-center justify-center z-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-white text-sm font-medium">{photoNumber}</span>
              <div className="w-full h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / photos.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            className="group absolute left-2 lg:-left-16 top-1/2 lg:top-1/2 -translate-y-1/2 p-2 lg:p-3 bg-card/90 dark:bg-card/80 hover:bg-primary/80 rounded-full transition-all hover:scale-110 shadow-lg z-40 border border-border"
            aria-label="Photo précédente"
            title={prevPhoto ? prevPhoto.title : 'Photo précédente'}
          >
            <ChevronLeft size={20} className="lg:hidden text-primary dark:text-primary-foreground" />
            <ChevronLeft size={24} className="hidden lg:block text-primary dark:text-primary-foreground" />
            {/* Miniature au survol - Positionnée à droite du bouton, à l'intérieur - Desktop uniquement */}
            {prevPhoto && (
              <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-95 group-hover:scale-100">
                <div className="bg-card/95 backdrop-blur-md border-2 border-primary/50 rounded-xl p-2 shadow-2xl">
                  <div className="relative w-40 h-28 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={prevPhoto.thumbnail || prevPhoto.src}
                      alt={prevPhoto.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                  <p className="text-xs text-foreground font-semibold truncate w-40 px-1">{prevPhoto.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate w-40 px-1">← Photo précédente</p>
                </div>
              </div>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            className="group absolute right-2 lg:-right-16 top-1/2 lg:top-1/2 -translate-y-1/2 p-2 lg:p-3 bg-card/90 dark:bg-card/80 hover:bg-primary/80 rounded-full transition-all hover:scale-110 shadow-lg z-40 border border-border"
            aria-label="Photo suivante"
            title={nextPhoto ? nextPhoto.title : 'Photo suivante'}
          >
            <ChevronRight size={20} className="lg:hidden text-primary dark:text-primary-foreground" />
            <ChevronRight size={24} className="hidden lg:block text-primary dark:text-primary-foreground" />
            {/* Miniature au survol - Positionnée à gauche du bouton, à l'intérieur - Desktop uniquement */}
            {nextPhoto && (
              <div className="hidden lg:block absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-95 group-hover:scale-100">
                <div className="bg-card/95 backdrop-blur-md border-2 border-primary/50 rounded-xl p-2 shadow-2xl">
                  <div className="relative w-40 h-28 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={nextPhoto.thumbnail || nextPhoto.src}
                      alt={nextPhoto.title}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                  <p className="text-xs text-foreground font-semibold truncate w-40 px-1">{nextPhoto.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate w-40 px-1">Photo suivante →</p>
                </div>
              </div>
            )}
          </button>

          {/* Image Principale - Côté Gauche Desktop / Haut Mobile */}
          <div className="flex-1 lg:flex-1 relative flex items-center justify-center bg-black/20 rounded-t-xl lg:rounded-xl overflow-hidden min-h-[50vh] lg:min-h-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.title}
              className="w-full h-full object-contain rounded-t-xl lg:rounded-xl"
              loading="eager"
            />
          </div>

          {/* Panneau d'informations - Côté Droit Desktop / Bas Mobile */}
          <div className="w-full lg:w-[380px] bg-card rounded-b-xl lg:rounded-xl flex flex-col overflow-hidden max-h-[45vh] lg:max-h-full">
            {/* Header avec titre */}
            <div className="p-3 lg:p-5 border-b border-border">
              {editingPhoto ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Titre</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdatePhoto}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <Check size={16} /> Enregistrer
                    </button>
                    <button
                      onClick={cancelEditPhoto}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <XCircle size={16} /> Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg lg:text-xl font-bold text-foreground mb-1 flex-1">{photo.title}</h3>
                    {currentUser?.is_admin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingPhoto(true)}
                          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={handleDeletePhoto}
                          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{photo.date}</span>
                    {photo.location && (
                      <>
                        <span>•</span>
                        <span>{photo.location}</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Content scrollable */}
            <div className="flex-1 overflow-y-auto p-3 lg:p-5 space-y-4 lg:space-y-5">
              {/* Description */}
              {photo.description && (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{photo.description}</p>
                </div>
              )}

              {/* Réactions */}
              <div className="border-t border-border pt-4">
                <div className="flex flex-wrap gap-2">
                  <ReactionButton 
                    icon={<ThumbsUp size={18} />} 
                    label="Like" 
                    type="like" 
                    active={userReaction === 'like'} 
                    count={reactionCounts.like} 
                    onClick={() => handleReaction('like')}
                    users={reactions.filter(r => r.type === 'like').map(r => r.user)}
                  />
                  <ReactionButton 
                    icon={<Heart size={18} />} 
                    label="Adore" 
                    type="love" 
                    active={userReaction === 'love'} 
                    count={reactionCounts.love} 
                    onClick={() => handleReaction('love')}
                    users={reactions.filter(r => r.type === 'love').map(r => r.user)}
                  />
                  <ReactionButton 
                    icon={<Laugh size={18} />} 
                    label="Rigole" 
                    type="laugh" 
                    active={userReaction === 'laugh'} 
                    count={reactionCounts.laugh} 
                    onClick={() => handleReaction('laugh')}
                    users={reactions.filter(r => r.type === 'laugh').map(r => r.user)}
                  />
                  <ReactionButton 
                    icon={<Zap size={18} />} 
                    label="Waouh" 
                    type="wow" 
                    active={userReaction === 'wow'} 
                    count={reactionCounts.wow} 
                    onClick={() => handleReaction('wow')}
                    users={reactions.filter(r => r.type === 'wow').map(r => r.user)}
                  />
                  <ReactionButton 
                    icon={<Meh size={18} />} 
                    label="Triste" 
                    type="sad" 
                    active={userReaction === 'sad'} 
                    count={reactionCounts.sad} 
                    onClick={() => handleReaction('sad')}
                    users={reactions.filter(r => r.type === 'sad').map(r => r.user)}
                  />
                </div>
                {loadingReactions && <div className="text-xs text-muted-foreground mt-2">Chargement...</div>}
              </div>

              {/* Commentaires */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle size={16} /> Commentaires ({comments.length})
                </h4>
                <form onSubmit={handleAddComment} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Ajouter un commentaire..."
                      className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Publier
                    </button>
                  </div>
                </form>
                {loadingComments ? (
                  <div className="text-xs text-muted-foreground">Chargement...</div>
                ) : comments.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</div>
                ) : (
                  <div className="space-y-3">
                    {/* Utilisation du composant modulaire CommentThread */}
                    {/* Assurez-vous d'importer CommentThread depuis components/comments/CommentThread */}
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
          </div>

          {/* Préchargement des images adjacentes (invisibles) */}
          <div className="hidden">
            {/* Images immédiates (priorité haute) */}
            {prevPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prevPhoto.src}
                alt={`Préchargement: ${prevPhoto.title}`}
              />
            )}
            {nextPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={nextPhoto.src}
                alt={`Préchargement: ${nextPhoto.title}`}
              />
            )}
            {/* Images +2 et -2 (préchargement anticipé, priorité normale) */}
            {prevPhoto2 && prevPhoto2.id !== photo.id && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={prevPhoto2.src}
                alt={`Préchargement anticipé: ${prevPhoto2.title}`}
              />
            )}
            {nextPhoto2 && nextPhoto2.id !== photo.id && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={nextPhoto2.src}
                alt={`Préchargement anticipé: ${nextPhoto2.title}`}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function ReactionButton({
  icon,
  label,
  type,
  active,
  count,
  onClick,
  users = [],
}: {
  icon: React.ReactNode
  label: string
  type: string
  active: boolean
  count?: number
  onClick: () => void
  users?: Array<{
    id: number
    username: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  }>
}) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  
  const getUserDisplayName = (user: typeof users[0]) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    }
    return user.username
  }
  
  const colors: Record<string, string> = {
    like: 'text-blue-500 bg-blue-500/10 border-blue-500',
    love: 'text-red-500 bg-red-500/10 border-red-500',
    laugh: 'text-amber-500 bg-amber-500/10 border-amber-500',
    wow: 'text-purple-500 bg-purple-500/10 border-purple-500',
    sad: 'text-slate-500 bg-slate-500/10 border-slate-500',
  }
  
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        onMouseEnter={() => users.length > 0 && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onTouchStart={() => users.length > 0 && setShowTooltip(true)}
        onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-sm ${
          active ? colors[type] : 'border-border bg-background hover:bg-muted'
        }`}
      >
        {icon}
        {count ? <span className="text-xs font-semibold">{count}</span> : null}
      </button>
      
      {/* Tooltip avec les noms des utilisateurs */}
      {showTooltip && users.length > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border border-border max-w-[200px]">
            <div className="text-xs font-semibold mb-1">{label}</div>
            <div className="text-xs space-y-0.5">
              {users.map((user, idx) => (
                <div key={user.id}>{getUserDisplayName(user)}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
