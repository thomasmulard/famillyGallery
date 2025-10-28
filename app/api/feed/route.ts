import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Dernières photos avec compteurs
    const latestPhotos = db
      .prepare(`
        SELECT p.id, p.title, p.description, p.thumbnail_path, p.path, p.created_at,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url,
               (SELECT COUNT(*) FROM comments c WHERE c.photo_id = p.id) as comments_count,
               (SELECT COUNT(*) FROM reactions r WHERE r.photo_id = p.id) as reactions_count
        FROM photos p
        JOIN users u ON u.id = p.uploaded_by
        ORDER BY p.created_at DESC
        LIMIT 6
      `)
      .all()
      .map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        thumbnail_path: row.thumbnail_path,
        path: row.path,
        created_at: row.created_at,
        comments_count: Number(row.comments_count || 0),
        reactions_count: Number(row.reactions_count || 0),
        user: {
          id: row.user_id,
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url,
        },
      }))

    // Commentaires récents - Un seul commentaire par photo (le plus récent)
    // Limité à 6 commentaires maximum
    const recentComments = db
      .prepare(`
        SELECT c.id, c.content, c.created_at,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url,
               p.id as photo_id, p.title as photo_title, p.thumbnail_path as photo_thumb, p.path as photo_path
        FROM comments c
        JOIN users u ON u.id = c.user_id
        JOIN photos p ON p.id = c.photo_id
        WHERE c.id IN (
          SELECT MAX(id) 
          FROM comments 
          GROUP BY photo_id
        )
        ORDER BY c.created_at DESC
        LIMIT 6
      `)
      .all()
      .map((row: any) => ({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        user: {
          id: row.user_id,
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url,
        },
        photo: {
          id: row.photo_id,
          title: row.photo_title,
          thumbnail_path: row.photo_thumb,
          path: row.photo_path,
        },
      }))

    // Réactions récentes
    const recentReactions = db
      .prepare(`
        SELECT r.id, r.type, r.created_at,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url,
               p.id as photo_id, p.title as photo_title, p.thumbnail_path as photo_thumb, p.path as photo_path
        FROM reactions r
        JOIN users u ON u.id = r.user_id
        JOIN photos p ON p.id = r.photo_id
        ORDER BY r.created_at DESC
        LIMIT 6
      `)
      .all()
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
        photo: {
          id: row.photo_id,
          title: row.photo_title,
          thumbnail_path: row.photo_thumb,
          path: row.photo_path,
        },
      }))

    return NextResponse.json({ latestPhotos, recentComments, recentReactions })
  } catch (e) {
    console.error('Feed error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
