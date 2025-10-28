import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Récupérer les albums de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const albums = db
      .prepare(`
        SELECT a.id, a.title, a.description, a.cover_photo_id, a.is_shared, a.created_at, a.updated_at,
               a.user_id as owner_id, u.username as owner_username, u.first_name as owner_first_name, u.last_name as owner_last_name,
               (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) as photo_count,
               cp.path as cover_path, cp.thumbnail_path as cover_thumbnail
        FROM albums a
        JOIN users u ON u.id = a.user_id
        LEFT JOIN photos cp ON cp.id = a.cover_photo_id
        WHERE a.user_id = ? OR (a.is_shared = 1 AND a.user_id != ?)
        ORDER BY a.updated_at DESC
      `)
      .all(session.user.id, session.user.id)
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        cover_photo_id: row.cover_photo_id,
        is_shared: Boolean(row.is_shared),
        created_at: row.created_at,
        updated_at: row.updated_at,
        photo_count: Number(row.photo_count || 0),
        cover_path: row.cover_path,
        cover_thumbnail: row.cover_thumbnail,
        owned: row.owner_id === session.user.id,
        owner: {
          id: row.owner_id,
          username: row.owner_username,
          first_name: row.owner_first_name,
          last_name: row.owner_last_name,
        }
      }))

    return NextResponse.json({ albums })
  } catch (e) {
    console.error('GET albums error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Créer un nouvel album
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, is_shared } = body

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    const result = db
      .prepare(`
        INSERT INTO albums (title, description, user_id, is_shared)
        VALUES (?, ?, ?, ?)
      `)
      .run(title.trim(), description?.trim() || null, session.user.id, is_shared ? 1 : 0)

    const newAlbum = db
      .prepare(`
        SELECT a.id, a.title, a.description, a.cover_photo_id, a.is_shared, a.created_at, a.updated_at,
               (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) as photo_count
        FROM albums a
        WHERE a.id = ?
      `)
      .get(result.lastInsertRowid) as any

    return NextResponse.json({
      album: {
        id: newAlbum.id,
        title: newAlbum.title,
        description: newAlbum.description,
        cover_photo_id: newAlbum.cover_photo_id,
        is_shared: Boolean(newAlbum.is_shared),
        created_at: newAlbum.created_at,
        updated_at: newAlbum.updated_at,
        photo_count: Number(newAlbum.photo_count || 0),
        cover_path: null,
        cover_thumbnail: null,
      },
    })
  } catch (e) {
    console.error('POST album error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Modifier un album
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { id, title, description, is_shared } = body

    if (!id || !title || title.trim().length === 0) {
      return NextResponse.json({ error: 'ID and title required' }, { status: 400 })
    }

    // Vérifier que l'album appartient à l'utilisateur
    const album = db.prepare('SELECT user_id FROM albums WHERE id = ?').get(id) as any
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }
    if (album.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    db.prepare(`
      UPDATE albums
      SET title = ?, description = ?, is_shared = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(title.trim(), description?.trim() || null, is_shared ? 1 : 0, id)

    const updatedAlbum = db
      .prepare(`
        SELECT a.id, a.title, a.description, a.cover_photo_id, a.is_shared, a.created_at, a.updated_at,
               (SELECT COUNT(*) FROM photos p WHERE p.album_id = a.id) as photo_count,
               cp.path as cover_path, cp.thumbnail_path as cover_thumbnail
        FROM albums a
        LEFT JOIN photos cp ON cp.id = a.cover_photo_id
        WHERE a.id = ?
      `)
      .get(id) as any

    return NextResponse.json({
      album: {
        id: updatedAlbum.id,
        title: updatedAlbum.title,
        description: updatedAlbum.description,
        cover_photo_id: updatedAlbum.cover_photo_id,
        is_shared: Boolean(updatedAlbum.is_shared),
        created_at: updatedAlbum.created_at,
        updated_at: updatedAlbum.updated_at,
        photo_count: Number(updatedAlbum.photo_count || 0),
        cover_path: updatedAlbum.cover_path,
        cover_thumbnail: updatedAlbum.cover_thumbnail,
      },
    })
  } catch (e) {
    console.error('PUT album error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Supprimer un album
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const albumId = searchParams.get('albumId')

    if (!albumId) {
      return NextResponse.json({ error: 'albumId required' }, { status: 400 })
    }

    // Vérifier que l'album appartient à l'utilisateur
    const album = db.prepare('SELECT user_id FROM albums WHERE id = ?').get(albumId) as any
    if (!album) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 })
    }
    if (album.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    db.prepare('DELETE FROM albums WHERE id = ?').run(albumId)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE album error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
