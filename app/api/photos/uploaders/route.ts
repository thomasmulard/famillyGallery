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

    const rows = db.prepare(`
      SELECT DISTINCT u.id, u.username, u.first_name, u.last_name, u.avatar_url
      FROM photos p
      JOIN users u ON u.id = p.uploaded_by
      ORDER BY u.first_name IS NULL, u.first_name ASC, u.last_name ASC, u.username ASC
    `).all()

    const users = rows.map((u: any) => ({
      id: u.id,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      avatar_url: u.avatar_url,
      displayName: u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : u.username
    }))

    return NextResponse.json({ users })
  } catch (e) {
    console.error('GET uploaders error', e)
    return NextResponse.json({ users: [] }, { status: 500 })
  }
}
