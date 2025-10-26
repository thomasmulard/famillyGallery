import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Récupérer les statistiques et utilisateurs (admin only)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Vérifier si l'utilisateur est admin
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as { is_admin: number }
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    // Récupérer les statistiques
    const stats = {
      totalUsers: (db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }).count,
      totalPhotos: (db.prepare('SELECT COUNT(*) as count FROM photos').get() as { count: number }).count,
      totalAlbums: (db.prepare('SELECT COUNT(*) as count FROM albums').get() as { count: number }).count,
      totalComments: (db.prepare('SELECT COUNT(*) as count FROM comments').get() as { count: number }).count,
      totalReactions: (db.prepare('SELECT COUNT(*) as count FROM reactions').get() as { count: number }).count,
    }

    // Récupérer tous les utilisateurs avec leurs statistiques
    const users = db.prepare(`
      SELECT 
        u.id, u.username, u.email, u.first_name, u.last_name, u.is_admin, u.avatar_url, u.created_at,
        (SELECT COUNT(*) FROM photos WHERE uploaded_by = u.id) as photos_count,
        (SELECT COUNT(*) FROM albums WHERE user_id = u.id) as albums_count,
        (SELECT COUNT(*) FROM comments WHERE user_id = u.id) as comments_count
      FROM users u
      ORDER BY u.created_at DESC
    `).all()

    return NextResponse.json({ stats, users })
  } catch (e) {
    console.error('GET admin error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Créer un nouvel utilisateur (admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Vérifier si l'utilisateur est admin
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as { is_admin: number }
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { username, first_name, last_name, is_admin } = body

    // Validation
    if (!username) {
      return NextResponse.json({ error: 'Username est requis' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
    if (existingUser) {
      return NextResponse.json({ error: 'Le nom d\'utilisateur existe déjà' }, { status: 400 })
    }

    // Créer un email temporaire basé sur le username
    const tempEmail = `${username}@temp.familygallery.local`

    // Créer l'utilisateur sans mot de passe ni email définitif (sera défini lors de la première connexion)
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, is_admin, is_first_login)
      VALUES (?, ?, NULL, ?, ?, ?, 1)
    `).run(username, tempEmail, first_name || null, last_name || null, is_admin ? 1 : 0)

    const newUser = db.prepare('SELECT id, username, email, first_name, last_name, is_admin, created_at FROM users WHERE id = ?').get(result.lastInsertRowid)

    return NextResponse.json({ user: newUser })
  } catch (e) {
    console.error('POST admin error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Modifier un utilisateur (admin only)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Vérifier si l'utilisateur est admin
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as { is_admin: number }
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, is_admin } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Ne pas permettre de modifier son propre statut admin
    if (userId === session.user_id) {
      return NextResponse.json({ error: 'Cannot modify your own admin status' }, { status: 400 })
    }

    db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(is_admin ? 1 : 0, userId)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PUT admin error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Vérifier si l'utilisateur est admin
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as { is_admin: number }
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Ne pas permettre de supprimer son propre compte
    if (parseInt(userId) === session.user_id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Supprimer l'utilisateur et ses données (cascade avec foreign keys)
    db.prepare('DELETE FROM users WHERE id = ?').run(userId)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE admin error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
