// Script pour créer le premier utilisateur admin
// Exécuter avec: node scripts/create-admin.js

const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createAdmin() {
  const dataDir = path.join(__dirname, '..', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  const dbPath = path.join(dataDir, 'familygallery.db')
  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')

  // S'assurer que la table users existe (init minimal si l'app n'a pas encore démarré)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      first_name TEXT,
      last_name TEXT,
      avatar_url TEXT,
      is_admin BOOLEAN DEFAULT 0,
      is_first_login BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    );
  `)

  console.log('🔐 Création d\'un compte administrateur\n')

  const email = await question('Email: ')
  const username = await question('Nom d\'utilisateur: ')
  const firstName = await question('Prénom: ')
  const lastName = await question('Nom: ')
  const password = await question('Mot de passe (min 8 caractères): ')

  if (password.length < 8) {
    console.error('❌ Le mot de passe doit contenir au moins 8 caractères')
    rl.close()
    db.close()
    return
  }

  try {
    const hash = await bcrypt.hash(password, 10)

    const stmt = db.prepare(`
      INSERT INTO users (email, username, first_name, last_name, password_hash, is_admin, is_first_login)
      VALUES (?, ?, ?, ?, ?, 1, 0)
    `)

    stmt.run(email.trim(), username.trim(), firstName.trim(), lastName.trim(), hash)

    console.log('\n✅ Administrateur créé avec succès!')
    console.log(`📧 Email: ${email}`)
    console.log(`👤 Username: ${username}`)
    console.log('\n🔗 Vous pouvez maintenant vous connecter sur: http://localhost:3000/login')
  } catch (error) {
    if (String(error.message).includes('UNIQUE constraint failed')) {
      console.error('❌ Erreur: cet email ou nom d\'utilisateur existe déjà.')
    } else {
      console.error('❌ Erreur:', error.message)
    }
  } finally {
    rl.close()
    db.close()
  }
}

createAdmin()
