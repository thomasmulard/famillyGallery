import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import db from './db'

export interface User {
  id: number
  email: string
  username: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  is_admin: boolean
  is_first_login: boolean
  created_at: string
  last_login: string | null
}

export interface Session {
  id: string
  user_id: number
  expires_at: string
}

// Créer un utilisateur (par admin)
export function createUser(email: string, username: string, firstName: string, lastName: string, isAdmin: boolean = false) {
  const stmt = db.prepare(`
    INSERT INTO users (email, username, first_name, last_name, is_admin, is_first_login)
    VALUES (?, ?, ?, ?, ?, 1)
  `)
  const result = stmt.run(email, username, firstName, lastName, isAdmin ? 1 : 0)
  return result.lastInsertRowid
}

// Définir le mot de passe (première connexion)
export async function setPassword(userId: number, password: string) {
  const hash = await bcrypt.hash(password, 10)
  const stmt = db.prepare(`
    UPDATE users 
    SET password_hash = ?, is_first_login = 0
    WHERE id = ?
  `)
  stmt.run(hash, userId)
}

// Vérifier les credentials
export async function verifyCredentials(email: string, password: string): Promise<User | null> {
  const stmt = db.prepare(`
    SELECT id, email, username, password_hash, first_name, last_name, 
           avatar_url, is_admin, is_first_login, created_at, last_login
    FROM users WHERE email = ?
  `)
  const user = stmt.get(email) as any
  
  if (!user) return null
  
  // Si première connexion, le mot de passe n'est pas encore défini
  if (user.is_first_login) {
    return null
  }
  
  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) return null
  
  // Mettre à jour last_login
  const updateStmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
  updateStmt.run(user.id)
  
  const { password_hash, ...userWithoutPassword } = user
  return {
    ...userWithoutPassword,
    is_admin: Boolean(user.is_admin),
    is_first_login: Boolean(user.is_first_login)
  }
}

// Vérifier si c'est la première connexion
export function isFirstLogin(email: string): boolean {
  const stmt = db.prepare('SELECT is_first_login FROM users WHERE email = ?')
  const result = stmt.get(email) as any
  return result ? Boolean(result.is_first_login) : false
}

// Créer une session
export function createSession(userId: number): string {
  const sessionId = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 jours
  
  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, expires_at)
    VALUES (?, ?, ?)
  `)
  stmt.run(sessionId, userId, expiresAt.toISOString())
  
  return sessionId
}

// Récupérer une session
export function getSession(sessionId: string): (Session & { user: User }) | null {
  const stmt = db.prepare(`
    SELECT s.id, s.user_id, s.expires_at,
           u.id as user_id, u.email, u.username, u.first_name, u.last_name,
           u.avatar_url, u.is_admin, u.is_first_login, u.created_at, u.last_login
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > CURRENT_TIMESTAMP
  `)
  const result = stmt.get(sessionId) as any
  
  if (!result) return null
  
  return {
    id: result.id,
    user_id: result.user_id,
    expires_at: result.expires_at,
    user: {
      id: result.user_id,
      email: result.email,
      username: result.username,
      first_name: result.first_name,
      last_name: result.last_name,
      avatar_url: result.avatar_url,
      is_admin: Boolean(result.is_admin),
      is_first_login: Boolean(result.is_first_login),
      created_at: result.created_at,
      last_login: result.last_login
    }
  }
}

// Supprimer une session (logout)
export function deleteSession(sessionId: string) {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?')
  stmt.run(sessionId)
}

// Nettoyer les sessions expirées
export function cleanExpiredSessions() {
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP')
  stmt.run()
}

// Récupérer un utilisateur par email
export function getUserByEmail(email: string): User | null {
  const stmt = db.prepare(`
    SELECT id, email, username, first_name, last_name, avatar_url, 
           is_admin, is_first_login, created_at, last_login
    FROM users WHERE email = ?
  `)
  const user = stmt.get(email) as any
  
  if (!user) return null
  
  return {
    ...user,
    is_admin: Boolean(user.is_admin),
    is_first_login: Boolean(user.is_first_login)
  }
}

// Récupérer tous les utilisateurs (admin)
export function getAllUsers(): User[] {
  const stmt = db.prepare(`
    SELECT id, email, username, first_name, last_name, avatar_url,
           is_admin, is_first_login, created_at, last_login
    FROM users
    ORDER BY created_at DESC
  `)
  const users = stmt.all() as any[]
  
  return users.map(user => ({
    ...user,
    is_admin: Boolean(user.is_admin),
    is_first_login: Boolean(user.is_first_login)
  }))
}
