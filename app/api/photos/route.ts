import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import db from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET - Récupérer toutes les photos de la galerie
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const photos = db
      .prepare(`
        SELECT p.id, p.filename, p.path, p.thumbnail_path, p.title, p.description, 
               p.category, p.location, p.taken_at, p.created_at,
               u.id as user_id, u.username, u.first_name, u.last_name, u.avatar_url
        FROM photos p
        JOIN users u ON u.id = p.uploaded_by
        ORDER BY p.created_at DESC
      `)
      .all()
      .map((row: any) => ({
        id: row.id,
        src: row.path,
        thumbnail: row.thumbnail_path,
        title: row.title,
        description: row.description || '',
        date: row.taken_at || row.created_at,
        category: row.category,
        year: new Date(row.taken_at || row.created_at).getFullYear().toString(),
        location: row.location,
        user: {
          id: row.user_id,
          username: row.username,
          first_name: row.first_name,
          last_name: row.last_name,
          avatar_url: row.avatar_url,
        },
      }))

    return NextResponse.json({ photos })
  } catch (e) {
    console.error('GET photos error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
