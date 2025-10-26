# 🚀 Installation et Configuration - FamilyShare Gallery

## 📋 Prérequis
- Node.js 18+ 
- npm ou yarn

## ⚙️ Installation

### 1. Installer les dépendances
```bash
npm install
```

### 2. Créer le premier administrateur

**Option A: Via script interactif (Recommandé)**
```bash
node scripts/create-admin.js
```

Suivez les instructions pour créer votre compte admin.

**Option B: Manuellement dans le code**
Créez un fichier `scripts/seed.js` et utilisez les fonctions de `lib/auth.ts`

### 3. Lancer l'application
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔐 Première connexion

1. **Administrateur**: Connectez-vous avec les identifiants créés à l'étape 2
2. **Ajout de membres**: 
   - Allez dans le panneau d'administration
   - Ajoutez des membres de la famille
   - Ils recevront un email (ou vous leur communiquez leur email de connexion)
3. **Première connexion d'un membre**:
   - Le membre se connecte avec son email
   - Il est redirigé vers la page de définition de mot de passe
   - Après avoir défini son mot de passe, il peut accéder à la galerie

## 📁 Structure de la base de données

La base de données SQLite est stockée dans `data/familygallery.db`

### Tables principales:
- `users` - Utilisateurs de l'application
- `albums` - Albums photos personnels
- `photos` - Photos uploadées
- `comments` - Commentaires sur les photos  
- `reactions` - Likes et réactions
- `sessions` - Sessions utilisateurs

## 📂 Structure des fichiers

```
famillyGallery/
├── data/
│   └── familygallery.db          # Base de données SQLite
├── public/
│   └── uploads/                  # Photos uploadées (sera créé automatiquement)
├── app/
│   ├── login/                    # Page de connexion
│   ├── first-login/              # Première connexion
│   ├── api/
│   │   └── auth/                 # API d'authentification
├── lib/
│   ├── db.ts                     # Configuration database
│   └── auth.ts                   # Services d'authentification
└── scripts/
    └── create-admin.js           # Script création admin
```

## 🎯 Fonctionnalités

### ✅ Authentification
- [x] Connexion par email/mot de passe
- [x] Première connexion avec définition du mot de passe
- [x] Sessions sécurisées (30 jours)
- [x] Protection des routes par middleware
- [x] Gestion admin/utilisateur

### 🚧 À venir (TODO)
- [ ] Page d'accueil avec fil d'actualité
- [ ] Système de commentaires
- [ ] Système de réactions (likes, emojis)
- [ ] Page "Mes Albums"
- [ ] Page de téléchargement avec optimisation
- [ ] Panneau d'administration
- [ ] Gestion des permissions

## 🔒 Sécurité

- **Mots de passe**: Hashés avec bcrypt (10 rounds)
- **Sessions**: Stockées en base avec expiration
- **Cookies**: HttpOnly, Secure en production
- **Routes**: Protégées par middleware
- **SQL**: Prepared statements (protection injection)

## 📦 Déplacement du projet

Pour déplacer le projet complet:

1. **Copier tout le dossier** `famillyGallery/`
2. La base de données SQLite (`data/familygallery.db`) sera copiée avec
3. Les photos uploadées (`public/uploads/`) seront copiées avec
4. Relancer `npm install` si nécessaire
5. C'est tout ! Pas de configuration externe

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Créer un admin
node scripts/create-admin.js

# Voir la base de données
# Utilisez un outil comme SQLite Browser ou DBeaver
```

## 🐛 Dépannage

### La base de données n'existe pas
```bash
# Elle sera créée automatiquement au premier lancement
npm run dev
```

### Erreur "unable to open database file"
```bash
# Vérifier les permissions du dossier data/
mkdir data
chmod 755 data
```

### Réinitialiser la base de données
```bash
# ATTENTION: Supprime toutes les données!
rm data/familygallery.db
npm run dev  # Recrée la base vide
node scripts/create-admin.js  # Recrée un admin
```

## 📞 Support

Pour toute question, consultez les fichiers:
- `OPTIMIZATIONS.md` - Optimisations de performance
- `MODAL_IMPROVEMENTS.md` - Améliorations du visualisateur
- `FIREFOX_FIX.md` - Correctifs de compatibilité

## 🎨 Prochaines étapes

1. ✅ Base de données SQLite configurée
2. ✅ Authentification complète
3. ✅ Page de connexion
4. ✅ Middleware de protection
5. 🚧 Page d'accueil avec feed
6. 🚧 Upload et optimisation d'images
7. 🚧 Commentaires et réactions
8. 🚧 Gestion des albums
9. 🚧 Panneau d'administration

---

**Note**: Ce projet utilise SQLite pour la simplicité et la portabilité. Toutes les données sont stockées localement, ce qui facilite les sauvegardes et le déplacement du projet.
