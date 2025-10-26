import { NextRequest, NextResponse } from 'next/server'
import { setPassword } from '@/lib/auth'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur, email et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe par username
    const user = db.prepare('SELECT id, email FROM users WHERE username = ?').get(username) as { id: number; email: string } | undefined

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id) as { id: number } | undefined
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Mettre à jour l'email et définir le mot de passe
    db.prepare('UPDATE users SET email = ? WHERE id = ?').run(email, user.id)
    await setPassword(user.id, password)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la définition du mot de passe' },
      { status: 500 }
    )
  }
}
