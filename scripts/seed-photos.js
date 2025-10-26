const Database = require('better-sqlite3')
const path = require('path')
const fs = require('fs')

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'familygallery.db')
const db = new Database(dbPath)

// Activer les foreign keys
db.pragma('foreign_keys = ON')

console.log('📸 Importation des photos de démonstration...\n')

// Récupérer l'admin pour l'attribuer comme uploader
const admin = db.prepare('SELECT id FROM users WHERE is_admin = 1 LIMIT 1').get()

if (!admin) {
  console.error('❌ Aucun administrateur trouvé. Créez d\'abord un admin avec le script create-admin.js')
  process.exit(1)
}

console.log(`✅ Admin trouvé (ID: ${admin.id})`)

// Photos de démonstration (basées sur data/photos.ts)
const photos = [
  {
    id: 1,
    filename: 'image_1.jpeg',
    original_filename: 'image_1.jpeg',
    path: '/images/image_1.jpeg',
    thumbnail_path: '/images/image_1.jpeg',
    title: 'Plage au coucher du soleil',
    description: 'Famille souriante sur une plage de sable fin avec des palmiers en arrière-plan au coucher du soleil',
    category: 'vacances',
    location: 'Côte d\'Azur',
    taken_at: '2024-07-15',
    width: 1920,
    height: 1080,
    size: 2048000,
    mime_type: 'image/jpeg'
  },
  {
    id: 2,
    filename: 'image_2.jpeg',
    original_filename: 'image_2.jpeg',
    path: '/images/image_2.jpeg',
    thumbnail_path: '/images/image_2.jpeg',
    title: 'Anniversaire',
    description: 'Jeune garçon blond soufflant les bougies d\'un gâteau d\'anniversaire coloré entouré de sa famille',
    category: 'fetes',
    location: 'Maison',
    taken_at: '2024-04-20',
    width: 1920,
    height: 1080,
    size: 1890000,
    mime_type: 'image/jpeg'
  },
  {
    id: 3,
    filename: 'image_3.jpeg',
    original_filename: 'image_3.jpeg',
    path: '/images/image_3.jpeg',
    thumbnail_path: '/images/image_3.jpeg',
    title: 'Randonnée en montagne',
    description: 'Famille de cinq personnes en tenue de randonnée posant devant un panorama montagneux avec des sommets enneigés',
    category: 'vacances',
    location: 'Alpes',
    taken_at: '2024-09-10',
    width: 1920,
    height: 1080,
    size: 2200000,
    mime_type: 'image/jpeg'
  },
  {
    id: 4,
    filename: 'image_4.jpeg',
    original_filename: 'image_4.jpeg',
    path: '/images/image_4.jpeg',
    thumbnail_path: '/images/image_4.jpeg',
    title: 'Noël en famille',
    description: 'Sapin de Noël décoré avec des guirlandes dorées et des cadeaux colorés disposés au pied dans un salon chaleureux',
    category: 'fetes',
    location: 'Maison',
    taken_at: '2023-12-25',
    width: 1920,
    height: 1080,
    size: 1950000,
    mime_type: 'image/jpeg'
  },
  {
    id: 5,
    filename: 'image_5.jpeg',
    original_filename: 'image_5.jpeg',
    path: '/images/image_5.jpeg',
    thumbnail_path: '/images/image_5.jpeg',
    title: 'Pique-nique au parc',
    description: 'Famille assise sur une couverture à carreaux dans un parc verdoyant avec un panier de pique-nique et des enfants qui jouent',
    category: 'quotidien',
    location: 'Parc de la Villette',
    taken_at: '2024-06-12',
    width: 1920,
    height: 1080,
    size: 2100000,
    mime_type: 'image/jpeg'
  },
  {
    id: 6,
    filename: 'image_6.jpeg',
    original_filename: 'image_6.jpeg',
    path: '/images/image_6.jpeg',
    thumbnail_path: '/images/image_6.jpeg',
    title: 'Premiers pas',
    description: 'Petite fille aux cheveux bouclés faisant ses premiers pas dans un salon lumineux avec ses parents qui l\'encouragent',
    category: 'quotidien',
    location: null,
    taken_at: '2024-03-18',
    width: 1920,
    height: 1080,
    size: 1850000,
    mime_type: 'image/jpeg'
  },
  {
    id: 7,
    filename: 'image_7.jpeg',
    original_filename: 'image_7.jpeg',
    path: '/images/image_7.jpeg',
    thumbnail_path: '/images/image_7.jpeg',
    title: 'Barbecue familial',
    description: 'Barbecue familial dans un jardin avec une grande table dressée et la famille réunie autour du grill fumant',
    category: 'quotidien',
    location: 'Jardin',
    taken_at: '2024-07-22',
    width: 1920,
    height: 1080,
    size: 2050000,
    mime_type: 'image/jpeg'
  },
  {
    id: 8,
    filename: 'image_8.jpeg',
    original_filename: 'image_8.jpeg',
    path: '/images/image_8.jpeg',
    thumbnail_path: '/images/image_8.jpeg',
    title: 'Sortie au zoo',
    description: 'Enfants émerveillés devant l\'enclos des girafes au zoo, pointant du doigt les animaux avec excitation',
    category: 'vacances',
    location: 'Zoo de Vincennes',
    taken_at: '2024-05-08',
    width: 1920,
    height: 1080,
    size: 1980000,
    mime_type: 'image/jpeg'
  },
  {
    id: 9,
    filename: 'image_9.jpeg',
    original_filename: 'image_9.jpeg',
    path: '/images/image_9.jpeg',
    thumbnail_path: '/images/image_9.jpeg',
    title: 'Moments précieux',
    description: 'Collection de moments familiaux mémorables capturés ensemble',
    category: 'quotidien',
    location: null,
    taken_at: '2024-08-05',
    width: 1920,
    height: 1080,
    size: 2000000,
    mime_type: 'image/jpeg'
  },
  {
    id: 10,
    filename: 'image_10.jpeg',
    original_filename: 'image_10.jpeg',
    path: '/images/image_10.jpeg',
    thumbnail_path: '/images/image_10.jpeg',
    title: 'Souvenirs d\'été',
    description: 'Moments inoubliables passés en famille pendant les vacances d\'été',
    category: 'vacances',
    location: 'Bretagne',
    taken_at: '2024-08-18',
    width: 1920,
    height: 1080,
    size: 2150000,
    mime_type: 'image/jpeg'
  },
  {
    id: 11,
    filename: 'image_11.jpeg',
    original_filename: 'image_11.jpeg',
    path: '/images/image_11.jpeg',
    thumbnail_path: '/images/image_11.jpeg',
    title: 'Après-midi ensoleillé',
    description: 'Profiter d\'un bel après-midi ensoleillé en famille',
    category: 'quotidien',
    location: null,
    taken_at: '2024-07-30',
    width: 1920,
    height: 1080,
    size: 1920000,
    mime_type: 'image/jpeg'
  },
  {
    id: 12,
    filename: 'image_12.jpeg',
    original_filename: 'image_12.jpeg',
    path: '/images/image_12.jpeg',
    thumbnail_path: '/images/image_12.jpeg',
    title: 'Aventures familiales',
    description: 'Exploration et découvertes en famille lors de nos sorties',
    category: 'vacances',
    location: 'Provence',
    taken_at: '2024-09-22',
    width: 1920,
    height: 1080,
    size: 2080000,
    mime_type: 'image/jpeg'
  },
  {
    id: 13,
    filename: 'image_13.jpeg',
    original_filename: 'image_13.jpeg',
    path: '/images/image_13.jpeg',
    thumbnail_path: '/images/image_13.jpeg',
    title: 'Rires et joie',
    description: 'Moments de bonheur et de complicité partagés ensemble',
    category: 'quotidien',
    location: null,
    taken_at: '2024-05-25',
    width: 1920,
    height: 1080,
    size: 1870000,
    mime_type: 'image/jpeg'
  },
  {
    id: 14,
    filename: 'image_14.jpeg',
    original_filename: 'image_14.jpeg',
    path: '/images/image_14.jpeg',
    thumbnail_path: '/images/image_14.jpeg',
    title: 'Journée spéciale',
    description: 'Une journée mémorable passée en famille',
    category: 'fetes',
    location: null,
    taken_at: '2024-08-10',
    width: 1920,
    height: 1080,
    size: 1990000,
    mime_type: 'image/jpeg'
  },
  {
    id: 15,
    filename: 'image_15.jpeg',
    original_filename: 'image_15.jpeg',
    path: '/images/image_15.jpeg',
    thumbnail_path: '/images/image_15.jpeg',
    title: 'Temps de qualité',
    description: 'Profiter de chaque instant passé ensemble en famille',
    category: 'quotidien',
    location: null,
    taken_at: '2024-10-05',
    width: 1920,
    height: 1080,
    size: 1910000,
    mime_type: 'image/jpeg'
  },
  {
    id: 16,
    filename: 'image_16.jpeg',
    original_filename: 'image_16.jpeg',
    path: '/images/image_16.jpeg',
    thumbnail_path: '/images/image_16.jpeg',
    title: 'Célébration',
    description: 'Moments de célébration et de fête en famille',
    category: 'fetes',
    location: null,
    taken_at: '2023-12-31',
    width: 1920,
    height: 1080,
    size: 2020000,
    mime_type: 'image/jpeg'
  },
  {
    id: 17,
    filename: 'image_17.jpeg',
    original_filename: 'image_17.jpeg',
    path: '/images/image_17.jpeg',
    thumbnail_path: '/images/image_17.jpeg',
    title: 'Escapade nature',
    description: 'Découverte de la nature lors de nos balades familiales',
    category: 'vacances',
    location: 'Fontainebleau',
    taken_at: '2024-04-14',
    width: 1920,
    height: 1080,
    size: 2130000,
    mime_type: 'image/jpeg'
  },
  {
    id: 18,
    filename: 'image_18.jpeg',
    original_filename: 'image_18.jpeg',
    path: '/images/image_18.jpeg',
    thumbnail_path: '/images/image_18.jpeg',
    title: 'Instants précieux',
    description: 'Capturer les petits moments qui comptent vraiment',
    category: 'quotidien',
    location: null,
    taken_at: '2024-07-08',
    width: 1920,
    height: 1080,
    size: 1940000,
    mime_type: 'image/jpeg'
  },
  {
    id: 19,
    filename: 'image_19.jpeg',
    original_filename: 'image_19.jpeg',
    path: '/images/image_19.jpeg',
    thumbnail_path: '/images/image_19.jpeg',
    title: 'Ensemble',
    description: 'La famille réunie pour des moments inoubliables',
    category: 'quotidien',
    location: null,
    taken_at: '2024-09-30',
    width: 1920,
    height: 1080,
    size: 1960000,
    mime_type: 'image/jpeg'
  },
  {
    id: 20,
    filename: 'image_20.jpeg',
    original_filename: 'image_20.jpeg',
    path: '/images/image_20.jpeg',
    thumbnail_path: '/images/image_20.jpeg',
    title: 'Joie de vivre',
    description: 'Partager le bonheur et la joie de vivre en famille',
    category: 'quotidien',
    location: null,
    taken_at: '2024-08-25',
    width: 1920,
    height: 1080,
    size: 2010000,
    mime_type: 'image/jpeg'
  }
]

// Insérer les photos
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO photos (
    id, filename, original_filename, path, thumbnail_path,
    title, description, category, location, taken_at,
    width, height, size, mime_type, uploaded_by
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`)

const insertMany = db.transaction((photos) => {
  for (const photo of photos) {
    insertStmt.run(
      photo.id,
      photo.filename,
      photo.original_filename,
      photo.path,
      photo.thumbnail_path,
      photo.title,
      photo.description,
      photo.category,
      photo.location,
      photo.taken_at,
      photo.width,
      photo.height,
      photo.size,
      photo.mime_type,
      admin.id
    )
  }
})

insertMany(photos)

console.log(`\n✅ ${photos.length} photos importées avec succès !`)
console.log('🎉 Vous pouvez maintenant ajouter des commentaires et réactions.\n')

db.close()
