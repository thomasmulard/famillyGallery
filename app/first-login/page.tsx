'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Key, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function FirstLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const username = searchParams.get('username')
  const { success, error: errorToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Validation du mot de passe
  const passwordValidation = {
    minLength: password.length >= 8,
    hasMatch: password === confirmPassword && password.length > 0,
    hasEmail: email.length > 0 && email.includes('@')
  }

  const isValid = passwordValidation.minLength && passwordValidation.hasMatch && passwordValidation.hasEmail

  useEffect(() => {
    if (!username) {
      router.push('/login')
    }
  }, [username, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la définition du mot de passe')
        errorToast(data.error || 'Erreur lors de la définition du mot de passe')
        setLoading(false)
        return
      }

      // Rediriger vers login avec message de succès
      success('Mot de passe défini, vous pouvez vous connecter')
      router.push('/login?success=password-set')
    } catch (err) {
      setError('Erreur lors de la définition du mot de passe')
      errorToast('Erreur lors de la définition du mot de passe')
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
        {/* Titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Key className="text-primary-foreground" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Première connexion</h1>
          <p className="text-muted-foreground">Définissez votre email et mot de passe</p>
        </div>

        {/* Formulaire */}
        <div className="bg-card border border-border rounded-2xl shadow-lg p-8">
          {/* Username (lecture seule) */}
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Nom d'utilisateur</p>
            <p className="font-semibold text-foreground">{username}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="votre.email@exemple.com"
                required
              />
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Minimum 8 caractères"
                  required
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

            {/* Confirmer mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Retapez votre mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Validation visuelle */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {passwordValidation.hasEmail ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-muted-foreground" />
                )}
                <span className={passwordValidation.hasEmail ? 'text-green-500' : 'text-muted-foreground'}>
                  Email valide
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {passwordValidation.minLength ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-muted-foreground" />
                )}
                <span className={passwordValidation.minLength ? 'text-green-500' : 'text-muted-foreground'}>
                  Au moins 8 caractères
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {passwordValidation.hasMatch ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <XCircle size={16} className="text-muted-foreground" />
                )}
                <span className={passwordValidation.hasMatch ? 'text-green-500' : 'text-muted-foreground'}>
                  Les mots de passe correspondent
                </span>
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

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  Définir mon mot de passe
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
