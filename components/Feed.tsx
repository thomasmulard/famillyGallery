"use client"

import { useEffect, useState } from 'react'
import { MessageCircle, Heart, ThumbsUp, Laugh, Meh, Zap } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

type FeedPhoto = {
  id: number
  title: string
  description?: string | null
  thumbnail_path?: string | null
  path: string
  created_at: string
  comments_count: number
  reactions_count: number
  user: { id: number; username: string; first_name: string | null; last_name: string | null; avatar_url: string | null }
}

type FeedComment = {
  id: number
  content: string
  created_at: string
  user: { id: number; username: string; first_name: string | null; last_name: string | null; avatar_url: string | null }
  photo: { id: number; title: string; thumbnail_path?: string | null; path: string }
}

type FeedReaction = {
  id: number
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad'
  created_at: string
  user: { id: number; username: string; first_name: string | null; last_name: string | null; avatar_url: string | null }
  photo: { id: number; title: string; thumbnail_path?: string | null; path: string }
}

interface FeedProps {
  onPhotoClick?: (photoId: number) => void
}

export default function Feed({ onPhotoClick }: FeedProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [latestPhotos, setLatestPhotos] = useState<FeedPhoto[]>([])
  const [recentComments, setRecentComments] = useState<FeedComment[]>([])
  const [recentReactions, setRecentReactions] = useState<FeedReaction[]>([])
  const [refreshKey, setRefreshKey] = useState(0)
  const { success, error: errorToast, info } = useToast()
  const [hasUpdates, setHasUpdates] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async (showToast: boolean) => {
      try {
        setLoading(true)
        const res = await fetch('/api/feed', { cache: 'no-store' })
        if (!res.ok) throw new Error('Erreur')
        const data = await res.json()
        if (!mounted) return
        setLatestPhotos(data.latestPhotos || [])
        setRecentComments(data.recentComments || [])
        setRecentReactions(data.recentReactions || [])
        setError(null)
        if (showToast) success('Flux actualisé')
        setHasUpdates(false)
      } catch (e) {
        if (mounted) {
          setError("Impossible de charger le fil d'actualité")
          errorToast("Impossible de charger le fil d'actualité")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Chargement initial sans toast
    load(false)

    const onExternalRefresh = () => {
      // Signaler qu'il y a des nouveautés sans recharger automatiquement
      setHasUpdates(true)
      info('Nouvelles activités disponibles')
    }
    window.addEventListener('feed:refresh', onExternalRefresh)
    return () => {
      mounted = false
      window.removeEventListener('feed:refresh', onExternalRefresh)
    }
  }, [refreshKey, success, errorToast])

  const refresh = () => {
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Fil d'actualité</h2>
          <p className="text-sm text-muted-foreground">Dernières photos, commentaires et réactions</p>
        </div>
        <button
          onClick={refresh}
          className="relative px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Actualiser
          {hasUpdates && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-[10px] bg-red-500 text-white">New</span>
          )}
        </button>
      </header>

      {/* Dernières photos */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Dernières photos</h3>
          {latestPhotos.length > 0 && (
            <span className="text-xs text-muted-foreground">{latestPhotos.length} éléments</span>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : latestPhotos.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucune photo pour le moment.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {latestPhotos.map((p) => (
              <div 
                key={p.id} 
                className="group rounded-xl overflow-hidden bg-muted/30 border border-border cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onPhotoClick?.(p.id)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.thumbnail_path || p.path}
                  alt={p.title}
                  className="w-full aspect-[4/3] object-cover group-hover:scale-[1.02] transition-transform"
                />
                <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} /> {p.comments_count}
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={14} /> {p.reactions_count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Commentaires récents */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Commentaires récents</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : recentComments.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</div>
        ) : (
          <div className="space-y-3">
            {recentComments.map((c) => (
              <div 
                key={c.id} 
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onPhotoClick?.(c.photo.id)}
              >
                {/* avatar */}
                {c.user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.user.avatar_url} alt={c.user.username} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                    {(c.user.first_name || c.user.last_name ? `${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim() : c.user.username).split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm"><span className="font-medium">{c.user.first_name || c.user.last_name ? `${c.user.first_name ?? ''} ${c.user.last_name ?? ''}`.trim() : c.user.username}</span> a commenté <span className="font-medium">{c.photo.title}</span></div>
                  <div className="text-sm text-muted-foreground truncate">“{c.content}”</div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.photo.thumbnail_path || c.photo.path} alt={c.photo.title} className="w-16 h-12 rounded-md object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Réactions récentes */}
      <section>
        <h3 className="text-lg font-semibold mb-3">Réactions récentes</h3>
        {loading ? (
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-24 rounded-full bg-muted animate-pulse" />
            ))}
          </div>
        ) : recentReactions.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucune réaction pour le moment.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {recentReactions.map((r) => (
              <div 
                key={r.id} 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onPhotoClick?.(r.photo.id)}
              >
                {iconForReaction(r.type)}
                <span className="font-medium">{nameForReaction(r.type)}</span>
                <span className="text-muted-foreground">par {(r.user.first_name || r.user.last_name ? `${r.user.first_name ?? ''} ${r.user.last_name ?? ''}`.trim() : r.user.username)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="text-sm text-red-500">{error}</div>
      )}
    </div>
  )
}

function iconForReaction(type: FeedReaction['type']) {
  switch (type) {
    case 'love':
      return <Heart size={16} className="text-red-500" />
    case 'like':
      return <ThumbsUp size={16} className="text-blue-500" />
    case 'laugh':
      return <Laugh size={16} className="text-amber-500" />
    case 'wow':
      return <Zap size={16} className="text-purple-500" />
    case 'sad':
      return <Meh size={16} className="text-slate-500" />
  }
}

function nameForReaction(type: FeedReaction['type']) {
  switch (type) {
    case 'love':
      return 'Adore'
    case 'like':
      return 'Like'
    case 'laugh':
      return 'Rigole'
    case 'wow':
      return 'Waouh'
    case 'sad':
      return 'Triste'
  }
}
