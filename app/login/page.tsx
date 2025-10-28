'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff, Images, ChevronDown, Check } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { success, error: errorToast } = useToast()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState('')
  const [users, setUsers] = useState<Array<{ id: number; email: string; username: string; first_name: string | null; last_name: string | null; avatar_url: string | null; is_first_login: boolean; displayName: string }>>([])
  const [query, setQuery] = useState('')
  const [openList, setOpenList] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Charger la liste des utilisateurs pour sélection rapide
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/auth/users')
        const data = await res.json()
        setUsers(data.users || [])
      } catch (e) {
        // ignore
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  }, [users, query])

  // Afficher un toast si retour depuis first-login
  useEffect(() => {
    const s = searchParams.get('success')
    if (s === 'password-set') {
      success('Votre mot de passe a été défini')
    }
  }, [searchParams, success])

  // Gestion sélection
  const selectUser = (u: (typeof users)[number]) => {
    setQuery(u.displayName || u.username)
    setUsername(u.username)
    setOpenList(false)
    
    // Si c'est la première connexion, rediriger vers la page de définition du mot de passe
    if (u.is_first_login) {
      router.push(`/first-login?username=${encodeURIComponent(u.username)}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        errorToast(data.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      // Rediriger vers l'accueil
      success('Connexion réussie')
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('Erreur de connexion')
      errorToast('Erreur de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Images className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">FamilyShare Gallery</h1>
          <p className="text-muted-foreground">Connectez-vous pour accéder à vos photos</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {/* Sélection utilisateur avec auto-complétion */}
            <div className="relative">
              <label className="block text-sm font-medium text-foreground mb-2">
                Nom d'utilisateur ou Email
              </label>
              <div
                className={`flex items-center gap-2 px-4 py-3 bg-background border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary/50 transition-all cursor-text`}
                onClick={() => setOpenList(true)}
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => { 
                    setQuery(e.target.value)
                    setUsername(e.target.value)
                    setOpenList(true)
                    setHighlightIndex(0) 
                  }}
                  onFocus={() => setOpenList(true)}
                  onKeyDown={(e) => {
                    if (!openList) return
                    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1)) }
                    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightIndex((i) => Math.max(i - 1, 0)) }
                    if (e.key === 'Enter') { e.preventDefault(); const u = filtered[highlightIndex]; if (u) selectUser(u) }
                    if (e.key === 'Escape') { setOpenList(false) }
                  }}
                  className="flex-1 bg-transparent outline-none text-sm"
                  placeholder="Tapez ou sélectionnez un utilisateur"
                  aria-autocomplete="list"
                  aria-expanded={openList}
                  autoComplete="off"
                  name="user_search"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <ChevronDown className={`text-muted-foreground transition-transform ${openList ? 'rotate-180' : ''}`} size={18} />
              </div>
              {/* Liste */}
              {openList && filtered.length > 0 && (
                <div ref={listRef} className="absolute z-20 mt-2 w-full max-h-60 overflow-auto bg-card border border-border rounded-lg shadow-lg">
                  {filtered.map((u, idx) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => selectUser(u)}
                      className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-muted transition-colors ${idx === highlightIndex ? 'bg-muted' : ''}`}
                    >
                      {/* Avatar */}
                      {u.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar_url} alt={u.displayName} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                          {(u.displayName || u.username).split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-foreground flex items-center gap-2">
                          {u.displayName || u.username}
                          {username === u.username && <Check size={14} className="text-primary" />}
                        </div>
                        <div className="text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                      {u.is_first_login && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">1ère connexion</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {/* Champ username caché mais requis pour l'API */}
              <input type="hidden" name="username" value={username} autoComplete="off" />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </motion.div>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Aide */}
          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>Choisissez votre nom dans la liste. Première connexion ? Vous serez redirigé pour créer votre mot de passe.</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          © 2024 FamilyShare Gallery - Galerie Photos Familiale
        </p>
      </motion.div>
    </div>
  )
}
