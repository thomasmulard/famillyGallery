import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET(_req: NextRequest) {
  try {
    // Liste publique minimale pour l'écran de connexion (exclure les admins)
    const stmt = db.prepare(`
      SELECT id, email, username, first_name, last_name, avatar_url, is_first_login
      FROM users
      WHERE is_admin = 0
      ORDER BY first_name IS NULL, first_name ASC, last_name ASC, username ASC
    `)
    const users = stmt.all().map((u: any) => ({
      id: u.id,
      email: u.email,
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name,
      avatar_url: u.avatar_url,
      is_first_login: Boolean(u.is_first_login),
      displayName: u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : u.username
    }))

    return NextResponse.json({ users })
  } catch (e) {
    console.error('GET /api/auth/users error', e)
    return NextResponse.json({ users: [] }, { status: 500 })
  }
}
