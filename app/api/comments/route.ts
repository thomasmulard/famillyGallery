import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Récupérer les commentaires d'une photo
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'photoId required' }, { status: 400 })
    }

    const comments = db
      .prepare(`
        SELECT c.id, c.content, c.created_at, c.updated_at, c.parent_id,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.photo_id = ?
        ORDER BY c.created_at DESC
      `)
      .all(photoId)
      .map((row: any) => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        parentId: row.parent_id,
        user: {
          id: row.user_id,
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url,
        },
      }))

    return NextResponse.json({ comments })
  } catch (e) {
    console.error('GET comments error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Ajouter un commentaire
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { photoId, content, parentId } = body

    if (!photoId || !content || content.trim().length === 0) {
      return NextResponse.json({ error: 'photoId and content required' }, { status: 400 })
    }

    const result = db
      .prepare(`
        INSERT INTO comments (photo_id, user_id, content, parent_id)
        VALUES (?, ?, ?, ?)
      `)
      .run(photoId, session.user.id, content.trim(), parentId || null)

    // Récupérer le commentaire créé avec les infos user
    const newComment = db
      .prepare(`
        SELECT c.id, c.content, c.created_at, c.updated_at, c.parent_id,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.id = ?
      `)
      .get(result.lastInsertRowid) as any

    return NextResponse.json({
      comment: {
        id: newComment.id,
        content: newComment.content,
        created_at: newComment.created_at,
        updated_at: newComment.updated_at,
        parentId: newComment.parent_id,
        user: {
          id: newComment.user_id,
          username: newComment.username,
          first_name: newComment.first_name,
          last_name: newComment.last_name,
          avatar_url: newComment.avatar_url,
        },
      },
    })
  } catch (e) {
    console.error('POST comment error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Supprimer un commentaire (seulement son propre commentaire ou admin)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get('commentId')

    if (!commentId) {
      return NextResponse.json({ error: 'commentId required' }, { status: 400 })
    }

    // Vérifier que le commentaire appartient à l'utilisateur ou qu'il est admin
    const comment = db.prepare('SELECT user_id FROM comments WHERE id = ?').get(commentId) as any

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.user_id !== session.user.id && !session.user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE comment error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
