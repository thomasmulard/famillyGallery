"use client"

import { useEffect, useState } from 'react'
import { Users, Image, FolderOpen, MessageCircle, Heart, Shield, Trash2, AlertTriangle, UserPlus, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/toast'

type Stats = {
  totalUsers: number
  totalPhotos: number
  totalAlbums: number
  totalComments: number
  totalReactions: number
}

type User = {
  id: number
  username: string
  email: string
  first_name: string | null
  last_name: string | null
  is_admin: number
  avatar_url: string | null
  created_at: string
  photos_count: number
  albums_count: number
  comments_count: number
}

export default function Admin() {
  const { success, error } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    username: '',
    first_name: '',
    last_name: '',
    is_admin: false,
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
        setUsers(data.users)
      } else if (res.status === 403) {
        error('Vous n\'avez pas les droits d\'administrateur')
      }
    } catch (e) {
      console.error('Erreur chargement données admin', e)
      error('Erreur de chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const toggleAdmin = async (userId: number, currentStatus: number) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_admin: currentStatus ? 0 : 1 }),
      })
      if (res.ok) {
        success('Rôle mis à jour')
        loadData()
      } else {
        const data = await res.json()
        error(data.error || 'Erreur lors de la modification')
      }
    } catch (e) {
      console.error('Erreur toggle admin', e)
      error('Erreur lors de la modification')
    }
  }

  const deleteUser = async (userId: number) => {
    if (!deleteModalUser) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin?userId=${userId}`, { method: 'DELETE' })
      if (res.ok) {
        success('Utilisateur supprimé')
        loadData()
        setDeleteModalUser(null)
        setDeleteConfirmText('')
      } else {
        const data = await res.json()
        error(data.error || 'Erreur lors de la suppression')
      }
    } catch (e) {
      console.error('Erreur suppression utilisateur', e)
      error('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (res.ok) {
        setShowCreateModal(false)
        setCreateForm({
          username: '',
          first_name: '',
          last_name: '',
          is_admin: false,
        })
        loadData()
        success('Utilisateur créé')
      } else {
        error(data.error || 'Erreur lors de la création')
      }
    } catch (e) {
      console.error('Erreur création utilisateur', e)
      error('Erreur lors de la création')
    } finally {
      setCreating(false)
    }
  }

  const displayName = (u: User) => {
    if (u.first_name || u.last_name) {
      return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
    }
    return u.username
  }

  const getInitials = (u: User) => {
    const name = displayName(u)
    return name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Shield size={28} /> Panneau d'Administration
          </h2>
          <p className="text-sm text-muted-foreground">Gestion des utilisateurs et statistiques de la galerie</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={18} />
          Créer un utilisateur
        </button>
      </header>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={<Users size={24} />} label="Utilisateurs" value={stats.totalUsers} color="text-blue-500" />
          <StatCard icon={<Image size={24} />} label="Photos" value={stats.totalPhotos} color="text-green-500" />
          <StatCard icon={<FolderOpen size={24} />} label="Albums" value={stats.totalAlbums} color="text-purple-500" />
          <StatCard icon={<MessageCircle size={24} />} label="Commentaires" value={stats.totalComments} color="text-amber-500" />
          <StatCard icon={<Heart size={24} />} label="Réactions" value={stats.totalReactions} color="text-red-500" />
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Utilisateurs ({users.length})</h3>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Photos</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Albums</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Commentaires</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Admin</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                            {getInitials(user)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{displayName(user)}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-center text-sm">{user.photos_count}</td>
                    <td className="px-4 py-3 text-center text-sm">{user.albums_count}</td>
                    <td className="px-4 py-3 text-center text-sm">{user.comments_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleAdmin(user.id, user.is_admin)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            user.is_admin
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/70'
                          }`}
                        >
                          {user.is_admin ? 'Admin' : 'Membre'}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDeleteModalUser(user)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Avertissement */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Attention</p>
          <p className="text-amber-800 dark:text-amber-200">
            La suppression d'un utilisateur entraînera la suppression de toutes ses photos, albums et commentaires. Cette action est irréversible.
          </p>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card rounded-xl border border-border p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <UserPlus size={24} className="text-primary" />
                  Créer un utilisateur
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                  <p className="text-blue-800 dark:text-blue-200">
                    L'utilisateur devra définir son email et son mot de passe lors de sa première connexion.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nom d'utilisateur <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Prénom</label>
                    <input
                      type="text"
                      value={createForm.first_name}
                      onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <input
                      type="text"
                      value={createForm.last_name}
                      onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_admin"
                    checked={createForm.is_admin}
                    onChange={(e) => setCreateForm({ ...createForm, is_admin: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <label htmlFor="is_admin" className="text-sm font-medium">
                    Administrateur
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {creating ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Confirmation Modal */}
      <AnimatePresence>
        {deleteModalUser && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDeleteModalUser(null)
                setDeleteConfirmText('')
              }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 bg-card rounded-xl border border-red-500/50 p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-5">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertTriangle size={24} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-red-600 mb-1">
                    Supprimer l'utilisateur
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Cette action est irréversible et supprimera toutes les données associées.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDeleteModalUser(null)
                    setDeleteConfirmText('')
                  }}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-5">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
                  {deleteModalUser.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={deleteModalUser.avatar_url}
                      alt={deleteModalUser.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                      {getInitials(deleteModalUser)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{displayName(deleteModalUser)}</div>
                    <div className="text-sm text-muted-foreground">@{deleteModalUser.username}</div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2 text-sm mb-4">
                  <p className="font-semibold text-red-900 dark:text-red-100">Les données suivantes seront supprimées :</p>
                  <ul className="list-disc list-inside space-y-1 text-red-800 dark:text-red-200 ml-2">
                    <li>{deleteModalUser.photos_count} photo{deleteModalUser.photos_count > 1 ? 's' : ''}</li>
                    <li>{deleteModalUser.albums_count} album{deleteModalUser.albums_count > 1 ? 's' : ''}</li>
                    <li>{deleteModalUser.comments_count} commentaire{deleteModalUser.comments_count > 1 ? 's' : ''}</li>
                    <li>Toutes les réactions</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pour confirmer, tapez : <span className="font-mono font-bold text-red-600">SUPPRIMER DEFINITIVEMENT</span>
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Tapez la phrase de confirmation"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalUser(null)
                    setDeleteConfirmText('')
                  }}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteUser(deleteModalUser.id)}
                  disabled={deleteConfirmText !== 'SUPPRIMER DEFINITIVEMENT' || deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deleting ? 'Suppression...' : 'Supprimer definitivement'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={`${color} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
