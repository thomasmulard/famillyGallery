"use client"

import { useEffect, useMemo, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface SessionUser {
  id: number
  email: string
  username: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  is_admin: number | boolean
}

export default function UserMenu({ variant = 'header' as 'header' | 'footer' }: { variant?: 'header' | 'footer' }) {
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' })
        const data = await res.json()
        if (mounted) {
          setUser(data.user || null)
        }
      } catch (e) {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const initials = useMemo(() => {
    if (!user) return '?'
    const base = user.first_name || user.last_name ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : user.username
    return base
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }, [user])

  const displayName = useMemo(() => {
    if (!user) return ''
    const name = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
    return name || user.username || user.email
  }, [user])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // ignore
    } finally {
      window.location.href = '/login'
    }
  }

  if (!user) {
    const Placeholder = (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
          <User size={16} />
        </div>
        {variant === 'footer' && (
          <div className="flex flex-col">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-36 rounded bg-muted mt-1" />
          </div>
        )}
      </div>
    )
    return variant === 'footer' ? (
      <div className="px-2 py-1.5 rounded-xl bg-muted/40">{Placeholder}</div>
    ) : Placeholder
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'footer' ? (
          <button
            aria-label="Menu utilisateur"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
            )}
            <div className="min-w-0 text-left">
              <div className="text-sm font-medium leading-none truncate">{displayName}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
          </button>
        ) : (
          <button
            aria-label="Menu utilisateur"
            className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-muted transition-colors"
          >
            {user.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar_url}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium leading-none">{displayName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
