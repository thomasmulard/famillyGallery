import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const user = getUserByEmail(email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      is_first_login: user.is_first_login,
      username: user.username,
      email: user.email
    })
  } catch (error) {
    console.error('Check first login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
