import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import db from '@/lib/db'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Créer les dossiers s'ils n'existent pas
const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
const thumbsDir = path.join(uploadsDir, 'thumbnails')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(thumbsDir)) {
  fs.mkdirSync(thumbsDir, { recursive: true })
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value
    if (!sessionId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const session = getSession(sessionId)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = (formData.get('category') as string) || 'quotidien'
    const location = formData.get('location') as string
    const albumId = formData.get('albumId') as string
  const tagUserIdsRaw = formData.get('tagUserIds') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Générer un nom unique
    const fileExt = path.extname(file.name)
    const uniqueName = `${uuidv4()}${fileExt}`
    const filename = uniqueName.replace(fileExt, '.jpg') // Toujours en JPEG pour uniformité
    const thumbnailFilename = `thumb_${filename}`

    // Convertir le File en Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Traiter l'image avec Sharp
    const imageProcessor = sharp(buffer)
    const metadata = await imageProcessor.metadata()

    // Image principale optimisée (max 1920x1080, qualité 85)
    await imageProcessor
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(path.join(uploadsDir, filename))

    // Thumbnail (max 400x300, qualité 80)
    await sharp(buffer)
      .resize(400, 300, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(path.join(thumbsDir, thumbnailFilename))

    // Obtenir la taille du fichier optimisé
    const stats = fs.statSync(path.join(uploadsDir, filename))

    // Insérer dans la base de données
    const result = db
      .prepare(`
        INSERT INTO photos (
          filename, original_filename, path, thumbnail_path,
          title, description, category, location,
          width, height, size, mime_type, uploaded_by, album_id, taken_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `)
      .run(
        filename,
        file.name,
        `/uploads/${filename}`,
        `/uploads/thumbnails/${thumbnailFilename}`,
        title || file.name.replace(fileExt, ''),
        description || null,
        category,
        location || null,
        metadata.width || 1920,
        metadata.height || 1080,
        stats.size,
        'image/jpeg',
        session.user.id,
        albumId ? parseInt(albumId) : null
      )

    // Récupérer la photo créée
    const photo = db
      .prepare(`
        SELECT id, filename, path, thumbnail_path, title, description, category, location, created_at
        FROM photos
        WHERE id = ?
      `)
      .get(result.lastInsertRowid) as any

    // Insérer les tags (photo_tags)
    try {
      if (tagUserIdsRaw) {
        const ids = JSON.parse(tagUserIdsRaw) as number[]
        if (Array.isArray(ids) && ids.length > 0) {
          const insertTag = db.prepare(`INSERT OR IGNORE INTO photo_tags (photo_id, user_id) VALUES (?, ?)`)
          ids.forEach(uid => {
            if (typeof uid === 'number') insertTag.run(photo.id, uid)
          })
        }
      }
    } catch (e) {
      console.error('Upload tags parse/insert error', e)
    }

    return NextResponse.json({
      success: true,
      photo: {
        id: photo.id,
        filename: photo.filename,
        path: photo.path,
        thumbnail_path: photo.thumbnail_path,
        title: photo.title,
        description: photo.description,
        category: photo.category,
        location: photo.location,
        created_at: photo.created_at,
      },
    })
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
