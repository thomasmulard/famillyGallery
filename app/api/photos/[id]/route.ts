import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import db from '@/lib/db'
import fs from 'fs'
import path from 'path'

// PUT - Mettre à jour une photo (admin seulement)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Vérifier si l'utilisateur est admin
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as { is_admin: number } | undefined
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Accès interdit - Admin seulement' }, { status: 403 })
    }

    const { title, description } = await request.json()
    const photoId = parseInt(params.id)

    if (!title) {
      return NextResponse.json({ error: 'Le titre est requis' }, { status: 400 })
    }

    // Mettre à jour la photo
    db.prepare(`
      UPDATE photos 
      SET title = ?, description = ?
      WHERE id = ?
    `).run(title, description || null, photoId)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erreur mise à jour photo', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer une photo (admin seulement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    // Vérifier si l'utilisateur est admin
    const user = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(session.user_id) as { is_admin: number } | undefined
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Accès interdit - Admin seulement' }, { status: 403 })
    }

    const photoId = parseInt(params.id)

    // Récupérer les chemins des fichiers avant suppression
    const photo = db.prepare('SELECT path, thumbnail_path FROM photos WHERE id = ?').get(photoId) as { path: string; thumbnail_path: string | null } | undefined

    if (photo) {
      // Supprimer les fichiers physiques
      try {
        const fullPath = path.join(process.cwd(), 'public', photo.path)
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath)
        }
        if (photo.thumbnail_path) {
          const thumbPath = path.join(process.cwd(), 'public', photo.thumbnail_path)
          if (fs.existsSync(thumbPath)) {
            fs.unlinkSync(thumbPath)
          }
        }
      } catch (fileError) {
        console.error('Erreur suppression fichiers', fileError)
      }
    }

    // Supprimer de la base de données (cascade sur commentaires et réactions)
    db.prepare('DELETE FROM photos WHERE id = ?').run(photoId)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Erreur suppression photo', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
