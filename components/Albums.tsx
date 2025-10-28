"use client"

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

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
  owned?: boolean
  owner?: {
    id: number
    username: string
    first_name: string | null
    last_name: string | null
  }
}

export default function MyAlbums() {
  const { success, error: errorToast } = useToast()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', is_shared: true })

  const loadAlbums = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/albums')
      if (!res.ok) throw new Error('Erreur chargement albums')
      const data = await res.json()
      setAlbums(data.albums || [])
    } catch (e: any) {
      console.error(e)
      errorToast('Impossible de charger les albums')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  const owned = useMemo(() => albums.filter(a => a.owned || a.owner == null || a.owner?.id == null), [albums])
  const shared = useMemo(() => albums.filter(a => !a.owned && a.is_shared), [albums])

  const onCreate = async () => {
    if (!form.title.trim()) return
    try {
      setCreating(true)
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: form.title.trim(), description: form.description.trim() || null, is_shared: form.is_shared })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur création album')
      success('Album créé')
      setForm({ title: '', description: '', is_shared: true })
      await loadAlbums()
    } catch (e: any) {
      errorToast(e?.message || 'Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const onDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/albums?albumId=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur suppression')
      success('Album supprimé')
      await loadAlbums()
    } catch (e: any) {
      errorToast(e?.message || 'Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Albums</h2>
          <p className="text-sm text-muted-foreground">Séparés entre « Mes albums » et « Albums collaboratifs ».</p>
        </div>
      </header>

      <section className="rounded-xl border p-4">
        <h3 className="text-lg font-medium mb-4">Créer un album</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="sm:col-span-1">
            <label className="block text-sm text-muted-foreground mb-1">Titre</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Ex: Anniv 2024"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-muted-foreground mb-1">Description</label>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Optionnel"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_shared"
              type="checkbox"
              className="h-4 w-4"
              checked={form.is_shared}
              onChange={e => setForm(f => ({ ...f, is_shared: e.target.checked }))}
            />
            <label htmlFor="is_shared" className="text-sm">Collaboratif</label>
          </div>
          <div className="sm:col-span-4">
            <Button onClick={onCreate} disabled={creating || !form.title.trim()}>{creating ? 'Création…' : 'Créer'}</Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Mes albums</h3>
          <span className="text-xs text-muted-foreground">{owned.length}</span>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : owned.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucun album pour le moment.</div>
        ) : (
          <AlbumGrid albums={owned} onDelete={onDelete} canEdit />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold">Albums collaboratifs</h3>
          <span className="text-xs text-muted-foreground">{shared.length}</span>
        </div>
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement…</div>
        ) : shared.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucun album collaboratif.</div>
        ) : (
          <AlbumGrid albums={shared} onDelete={onDelete} canEdit={false} />
        )}
      </section>
    </div>
  )
}

function AlbumGrid({ albums, onDelete, canEdit }: { albums: Album[]; onDelete: (id: number) => void; canEdit: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {albums.map((a) => (
        <article key={a.id} className="group relative overflow-hidden rounded-xl border bg-card">
          <div className="aspect-[4/3] bg-muted relative">
            {a.cover_thumbnail ? (
              <Image src={a.cover_thumbnail} alt={a.title} fill className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-muted-foreground text-xs">
                Pas de couverture
              </div>
            )}
            {a.is_shared && (
              <span className="absolute left-2 top-2 rounded-full bg-amber-500/90 text-white text-[10px] px-2 py-0.5">Collaboratif</span>
            )}
          </div>
          <div className="p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium leading-tight truncate" title={a.title}>{a.title}</h4>
              <span className="text-xs text-muted-foreground">{a.photo_count} photo{a.photo_count > 1 ? 's' : ''}</span>
            </div>
            {a.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-muted-foreground">Maj {new Date(a.updated_at).toLocaleDateString()}</span>
              {canEdit ? (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Edit to be added later */}
                  <Button variant="outline" size="sm" onClick={() => onDelete(a.id)}>Supprimer</Button>
                </div>
              ) : (
                <div className="text-[11px] text-muted-foreground">Lecture seule</div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
