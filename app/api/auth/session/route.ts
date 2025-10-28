import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) {
      return NextResponse.json({ user: null })
    }

    const session = getSession(sessionId)

    if (!session) {
      cookieStore.delete('session')
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        username: session.user.username,
        first_name: session.user.first_name,
        last_name: session.user.last_name,
        avatar_url: session.user.avatar_url,
        is_admin: session.user.is_admin
      },
      expires_at: session.expires_at
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json({ user: null })
  }
}
