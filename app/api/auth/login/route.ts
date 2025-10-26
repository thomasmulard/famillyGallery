import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import db from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      )
    }

    // Récupérer l'utilisateur par username OU email
    const user = db.prepare(`
      SELECT id, email, username, password_hash, first_name, last_name, 
             avatar_url, is_admin, is_first_login, created_at, last_login
      FROM users WHERE username = ? OR email = ?
    `).get(username, username) as any

    if (!user) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Si première connexion, le mot de passe n'est pas encore défini
    if (user.is_first_login) {
      return NextResponse.json(
        { error: 'Veuillez définir votre mot de passe lors de votre première connexion' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Mettre à jour last_login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id)

    // Créer une session
    const sessionId = createSession(user.id)

    // Définir le cookie
    const cookieStore = await cookies()
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/'
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        is_admin: Boolean(user.is_admin)
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
