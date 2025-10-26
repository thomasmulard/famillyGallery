import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Récupérer les réactions d'une photo
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

    const reactions = db
      .prepare(`
        SELECT r.id, r.type, r.created_at,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
        FROM reactions r
        JOIN users u ON u.id = r.user_id
        WHERE r.photo_id = ?
        ORDER BY r.created_at DESC
      `)
      .all(photoId)
      .map((row: any) => ({
        id: row.id,
        type: row.type,
        created_at: row.created_at,
        user: {
          id: row.user_id,
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url,
        },
      }))

    return NextResponse.json({ reactions })
  } catch (e) {
    console.error('GET reactions error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Ajouter/modifier une réaction (une seule par user/photo)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { photoId, type } = body

    const validTypes = ['like', 'love', 'laugh', 'wow', 'sad']
    if (!photoId || !type || !validTypes.includes(type)) {
      return NextResponse.json({ error: 'photoId and valid type required' }, { status: 400 })
    }

    // Upsert : remplacer si existe déjà
    db.prepare(`
      INSERT INTO reactions (photo_id, user_id, type)
      VALUES (?, ?, ?)
      ON CONFLICT(photo_id, user_id) DO UPDATE SET type = excluded.type, created_at = CURRENT_TIMESTAMP
    `).run(photoId, session.user.id, type)

    // Récupérer la réaction avec infos user
    const reaction = db
      .prepare(`
        SELECT r.id, r.type, r.created_at,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
        FROM reactions r
        JOIN users u ON u.id = r.user_id
        WHERE r.photo_id = ? AND r.user_id = ?
      `)
      .get(photoId, session.user.id) as any

    return NextResponse.json({
      reaction: {
        id: reaction.id,
        type: reaction.type,
        created_at: reaction.created_at,
        user: {
          id: reaction.user_id,
          username: reaction.username,
          first_name: reaction.first_name,
          last_name: reaction.last_name,
          avatar_url: reaction.avatar_url,
        },
      },
    })
  } catch (e) {
    console.error('POST reaction error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Supprimer sa propre réaction
export async function DELETE(request: NextRequest) {
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

    db.prepare('DELETE FROM reactions WHERE photo_id = ? AND user_id = ?').run(photoId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE reaction error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
