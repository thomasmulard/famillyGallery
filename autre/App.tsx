
import React, { useState, useEffect, useRef } from 'react';
import { PhotoGallery } from './components/PhotoGallery';
import { Chatbot } from './components/Chatbot';
import { ChatIcon, CloseIcon, HeartIcon, SendIcon, SunIcon, MoonIcon, HomeIcon, PhotoIcon, ArrowUpTrayIconUser, UserCircleIcon, ArrowRightStartOnRectangleIcon, ShieldCheckIcon } from './components/icons';
import type { Photo, User, Comment, Like } from './types';
import { AdminPage } from './components/AdminPage';

// --- INITIAL DATA (with new fields: createdAt, taggedUserIds, updated likes/comments) ---
const now = Date.now();
const initialUsers: User[] = [
    { id: 'user1', name: 'Papa', avatar: 'https://i.pravatar.cc/40?u=papa' },
    { id: 'user2', name: 'Maman', avatar: 'https://i.pravatar.cc/40?u=maman' },
    { id: 'user3', name: 'Léa', avatar: 'https://i.pravatar.cc/40?u=lea' },
];

const initialPhotos: Photo[] = [
  { id: 1, url: 'https://picsum.photos/seed/family1/800/600', caption: 'Vacances à la plage, 2023', ownerId: 'user1', taggedUserIds: ['user1', 'user2', 'user3'], likes: [{userId: 'user2', createdAt: now - 86400000}, {userId: 'user3', createdAt: now - 3600000}], comments: [{id: 'c1', userId: 'user2', text: 'Superbe photo !', createdAt: now - 86400000}], createdAt: now - 604800000 * 2 },
  { id: 2, url: 'https://picsum.photos/seed/family2/600/800', caption: 'Anniversaire de Mamie', ownerId: 'user2', taggedUserIds: ['user2', 'user1'], likes: [{userId: 'user1', createdAt: now - 172800000}], comments: [], createdAt: now - 604800000 },
  { id: 3, url: 'https://picsum.photos/seed/family3/800/800', caption: 'Premier jour d\'école', ownerId: 'user3', taggedUserIds: ['user3'], likes: [{userId: 'user1', createdAt: now - 259200000}, {userId: 'user2', createdAt: now - 432000000}], comments: [], createdAt: now - 518400000 },
  { id: 4, url: 'https://picsum.photos/seed/family4/600/900', caption: 'Randonnée en montagne', ownerId: 'user1', taggedUserIds: ['user1', 'user2'], likes: [], comments: [], createdAt: now - 432000000 },
  { id: 5, url: 'https://picsum.photos/seed/family5/900/600', caption: 'Noël en famille', ownerId: 'user2', taggedUserIds: ['user1', 'user2', 'user3'], likes: [{userId: 'user1', createdAt: now - 600000}, {userId: 'user3', createdAt: now - 1200000}], comments: [{id: 'c2', userId: 'user1', text: 'Quelle belle ambiance.', createdAt: now - 500000}, {id: 'c3', userId: 'user3', text: 'J\'adore cette photo !', createdAt: now - 400000}], createdAt: now - 345600000 },
  { id: 6, url: 'https://picsum.photos/seed/family6/700/800', caption: 'Pique-nique au parc', ownerId: 'user3', taggedUserIds: ['user3', 'user2'], likes: [{userId: 'user2', createdAt: now - 1800000}], comments: [], createdAt: now - 259200000 },
  { id: 7, url: 'https://picsum.photos/seed/family7/800/700', caption: 'Le petit dernier', ownerId: 'user1', taggedUserIds: ['user1', 'user2', 'user3'], likes: [{userId: 'user1', createdAt: now-1}, {userId: 'user2', createdAt: now-2}, {userId: 'user3', createdAt: now-3}], comments: [], createdAt: now - 172800000 },
  { id: 8, url: 'https://picsum.photos/seed/family8/600/700', caption: 'Diplôme de fin d\'études', ownerId: 'user2', taggedUserIds: ['user2'], likes: [{userId: 'user1', createdAt: now - 900000}, {userId: 'user3', createdAt: now - 1800000}], comments: [], createdAt: now - 86400000 },
];

// --- TYPE DEFINITIONS for Activity Feed ---
type ActivityType = 'upload' | 'comment' | 'like';
interface Activity {
  type: ActivityType;
  timestamp: number;
  user: User;
  photo: Photo;
  commentText?: string;
}

// --- HELPER to find user by ID ---
const findUser = (id: string, users: User[]) => users.find(u => u.id === id) || users[0];

// --- MODAL COMPONENTS ---

const PhotoModal: React.FC<{
  photo: Photo;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onLike: (photoId: number) => void;
  onAddComment: (photoId: number, text: string) => void;
}> = ({ photo, users, currentUser, onClose, onLike, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const photoOwner = users.find(u => u.id === photo.ownerId);
    const hasLiked = photo.likes.some(like => like.userId === currentUser.id);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [photo.comments]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        onAddComment(photo.id, commentText);
        setCommentText('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="w-full md:w-2/3 bg-black flex items-center justify-center">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-contain" />
                </div>
                <div className="w-full md:w-1/3 flex flex-col text-stone-800 dark:text-stone-200">
                    <header className="p-4 border-b border-stone-200 dark:border-slate-700 flex items-center gap-3">
                        <img src={photoOwner?.avatar} alt={photoOwner?.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-bold">{photoOwner?.name}</p>
                            <p className="text-sm text-stone-600 dark:text-stone-400">{photo.caption}</p>
                        </div>
                        <button onClick={onClose} className="ml-auto text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </header>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {photo.comments.map(comment => {
                            const commentUser = users.find(u => u.id === comment.userId);
                            return (
                                <div key={comment.id} className="flex items-start gap-3">
                                    <img src={commentUser?.avatar} alt={commentUser?.name} className="w-8 h-8 rounded-full mt-1" />
                                    <div>
                                        <p className="text-sm"><span className="font-bold">{commentUser?.name}</span> {comment.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={commentsEndRef} />
                    </div>
                    <footer className="p-4 border-t border-stone-200 dark:border-slate-700 space-y-3 bg-stone-50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-4">
                            <button onClick={() => onLike(photo.id)} className="flex items-center gap-1.5 group">
                                <HeartIcon className={`w-7 h-7 transition-all ${hasLiked ? 'text-red-500 fill-current' : 'text-stone-700 dark:text-stone-300 group-hover:text-red-500'}`} />
                            </button>
                             <p className="text-sm font-semibold">{photo.likes.length} like{photo.likes.length !== 1 && 's'}</p>
                        </div>
                        <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full"/>
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Ajouter un commentaire..."
                                className="flex-1 w-full px-3 py-1.5 text-sm bg-stone-100 dark:bg-slate-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white dark:focus:bg-slate-600 transition"
                            />
                             <button type="submit" className="p-2 bg-orange-500 text-white rounded-full transition-colors hover:bg-orange-600 disabled:bg-stone-300 dark:disabled:bg-slate-600" disabled={!commentText.trim()}>
                                <SendIcon className="w-4 h-4" />
                            </button>
                        </form>
                    </footer>
                </div>
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

const HomePage: React.FC<{ photos: Photo[]; users: User[] }> = ({ photos, users }) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const allActivities: Activity[] = [];

    photos.forEach(photo => {
      // Upload activity
      allActivities.push({
        type: 'upload',
        timestamp: photo.createdAt,
        user: findUser(photo.ownerId, users),
        photo,
      });

      // Comment activities
      photo.comments.forEach(comment => {
        allActivities.push({
          type: 'comment',
          timestamp: comment.createdAt,
          user: findUser(comment.userId, users),
          photo,
          commentText: comment.text,
        });
      });
      
      // Like activities
      photo.likes.forEach(like => {
        allActivities.push({
            type: 'like',
            timestamp: like.createdAt,
            user: findUser(like.userId, users),
            photo,
        });
      });
    });

    allActivities.sort((a, b) => b.timestamp - a.timestamp);
    setActivities(allActivities);
  }, [photos, users]);
  
  const ActivityCard: React.FC<{ activity: Activity }> = ({ activity }) => {
    const timeAgo = new Intl.RelativeTimeFormat('fr', { style: 'short' }).format(Math.round((activity.timestamp - Date.now()) / (1000 * 60 * 60 * 24)), 'day');

    const renderText = () => {
        switch(activity.type) {
            case 'upload': return <>a partagé une nouvelle photo.</>;
            case 'like': return <>a aimé la photo de <strong>{findUser(activity.photo.ownerId, users).name}</strong>.</>;
            case 'comment': return <>a commenté la photo de <strong>{findUser(activity.photo.ownerId, users).name}</strong>: <em>"{activity.commentText}"</em></>;
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start">
            <img src={activity.user.avatar} alt={activity.user.name} className="w-10 h-10 rounded-full"/>
            <div className="flex-1">
                <p className="text-sm">
                    <strong>{activity.user.name}</strong> {renderText()}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{timeAgo}</p>
            </div>
            <img src={activity.photo.url} alt={activity.photo.caption} className="w-16 h-16 rounded-md object-cover"/>
        </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Fil d'actualité</h2>
        <div className="space-y-4">
            {activities.map((activity, index) => <ActivityCard key={index} activity={activity} />)}
        </div>
    </div>
  );
};


const GalleryPage: React.FC<{
    photos: Photo[];
    users: User[];
    currentUser: User;
    onSelectPhoto: (photo: Photo) => void;
}> = ({ photos, users, currentUser, onSelectPhoto }) => {
    return (
        <PhotoGallery 
            photos={photos} 
            users={users} 
            onSelectPhoto={onSelectPhoto} 
        />
    );
};


const UploadPage: React.FC<{
    onClose: () => void;
    onUpload: (caption: string, imageSrc: string, taggedUserIds: string[]) => void;
    users: User[];
    currentUser: User;
}> = ({ onClose, onUpload, users, currentUser }) => {
    const [caption, setCaption] = useState('');
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [taggedUserIds, setTaggedUserIds] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImageSrc(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleTagUser = (userId: string) => {
        setTaggedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSubmit = () => {
        if (caption && imageSrc) {
            onUpload(caption, imageSrc, taggedUserIds);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-center">Partager un souvenir</h2>
                {imageSrc ? (
                    <img src={imageSrc} alt="Preview" className="w-full h-auto max-h-96 object-contain rounded-lg bg-stone-100 dark:bg-slate-700" />
                ) : (
                    <div 
                        className="w-full h-64 border-2 border-dashed border-stone-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 cursor-pointer hover:border-orange-400 dark:hover:border-orange-400 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ArrowUpTrayIconUser className="w-12 h-12 mb-2"/>
                        Cliquer pour choisir une image
                    </div>
                )}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <div>
                    <label htmlFor="caption" className="block text-sm font-medium mb-1">Légende</label>
                    <input
                        id="caption"
                        type="text"
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder="Ex: Journée à la mer..."
                        className="w-full px-4 py-2 bg-stone-100 dark:bg-slate-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white dark:focus:bg-slate-600 transition"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Qui est sur la photo ?</label>
                    <div className="flex flex-wrap gap-3">
                        {users.map(user => (
                            <button key={user.id} onClick={() => handleTagUser(user.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${taggedUserIds.includes(user.id) ? 'bg-orange-500 text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-orange-500' : 'bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600'}`}>
                                <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full"/>
                                {user.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors">Annuler</button>
                    <button onClick={handleSubmit} disabled={!caption || !imageSrc} className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-stone-300 dark:disabled:bg-slate-600 transition-colors">Publier</button>
                </div>
            </div>
        </div>
    );
};

// --- HEADER COMPONENT ---
const Header: React.FC<{
    currentPage: string;
    onNavigate: (page: string) => void;
    theme: string;
    onThemeChange: (theme: string) => void;
    users: User[];
    currentUser: User;
    onUserChange: (user: User) => void;
}> = ({ currentPage, onNavigate, theme, onThemeChange, users, currentUser, onUserChange }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navLinkClasses = (page: string) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === page ? 'bg-orange-500 text-white' : 'text-stone-600 dark:text-stone-300 hover:bg-orange-100 dark:hover:bg-slate-700'}`;

    return (
        <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-stone-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">Souvenirs</h1>
                        <nav className="hidden md:flex items-center gap-2">
                           <button onClick={() => onNavigate('home')} className={navLinkClasses('home')}><HomeIcon className="w-5 h-5"/>Accueil</button>
                           <button onClick={() => onNavigate('gallery')} className={navLinkClasses('gallery')}><PhotoIcon className="w-5 h-5"/>Galerie</button>
                           <button onClick={() => onNavigate('upload')} className={navLinkClasses('upload')}><ArrowUpTrayIconUser className="w-5 h-5"/>Partager</button>
                           {currentUser.id === 'user1' && (
                              <button onClick={() => onNavigate('admin')} className={navLinkClasses('admin')}><ShieldCheckIcon className="w-5 h-5"/>Admin</button>
                           )}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                            {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
                        </button>
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(o => !o)}>
                                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-orange-400"/>
                            </button>
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-up-sm">
                                    <div className="p-2">
                                        <div className="px-2 py-2">
                                            <p className="text-sm">Connecté en tant que</p>
                                            <p className="text-sm font-medium text-stone-900 dark:text-white truncate">{currentUser.name}</p>
                                        </div>
                                        <div className="border-t border-stone-200 dark:border-slate-700 my-1"></div>
                                        <p className="px-2 pt-2 pb-1 text-xs text-stone-500">Changer de profil (démo)</p>
                                        {users.map(user => (
                                            <button key={user.id} onClick={() => { onUserChange(user); setIsProfileOpen(false); }} className="w-full text-left flex items-center gap-2 px-2 py-2 text-sm rounded-md text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-slate-700">
                                                <img src={user.avatar} className="w-6 h-6 rounded-full" />
                                                {user.name}
                                            </button>
                                        ))}
                                        <div className="border-t border-stone-200 dark:border-slate-700 my-1"></div>
                                        <button className="w-full text-left flex items-center gap-3 px-2 py-2 text-sm rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                                            Se déconnecter
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'gallery' | 'upload' | 'admin'>('home');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- HANDLERS ---
  const handleLike = (photoId: number) => {
    setPhotos(prevPhotos =>
      prevPhotos.map(p => {
        if (p.id === photoId) {
          const hasLiked = p.likes.some(like => like.userId === currentUser.id);
          const newLikes = hasLiked
            ? p.likes.filter(like => like.userId !== currentUser.id)
            : [...p.likes, { userId: currentUser.id, createdAt: Date.now() }];
          return { ...p, likes: newLikes };
        }
        return p;
      })
    );
  };
  
  const handleAddComment = (photoId: number, text: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      text: text,
      createdAt: Date.now(),
    };
    setPhotos(prevPhotos =>
      prevPhotos.map(p =>
        p.id === photoId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
  };

  const handleUpload = (caption: string, imageSrc: string, taggedUserIds: string[]) => {
      const newPhoto: Photo = {
        id: Date.now(),
        url: imageSrc,
        caption,
        ownerId: currentUser.id,
        likes: [],
        comments: [],
        taggedUserIds,
        createdAt: Date.now(),
      };
      setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
      setCurrentPage('gallery');
  };
  
  const handleDeletePhoto = (photoId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette photo ? Cette action est irréversible.")) {
      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photoId));
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'user1') {
      alert("L'administrateur ne peut pas être supprimé.");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses photos, commentaires et 'j'aime' seront également supprimés.")) {
      // Remove user
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      // Remove user's content
      setPhotos(prevPhotos => {
        // Filter out photos owned by the user
        const photosWithoutUserOwned = prevPhotos.filter(p => p.ownerId !== userId);
        // Filter out likes and comments from the user on other photos
        return photosWithoutUserOwned.map(p => ({
          ...p,
          likes: p.likes.filter(like => like.userId !== userId),
          comments: p.comments.filter(comment => comment.userId !== userId),
        }));
      });

      // If the deleted user is the current user, switch to the admin
      if(currentUser.id === userId) {
          setCurrentUser(users.find(u => u.id === 'user1') || users[0]);
      }
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
        case 'home':
            return <HomePage photos={photos} users={users} />;
        case 'gallery':
            return <GalleryPage photos={photos} users={users} currentUser={currentUser} onSelectPhoto={setSelectedPhoto}/>;
        case 'upload':
            return <UploadPage onClose={() => setCurrentPage('gallery')} onUpload={handleUpload} users={users} currentUser={currentUser} />;
        case 'admin':
            if (currentUser.id !== 'user1') {
                setCurrentPage('home'); // Redirect if not admin
                return <HomePage photos={photos} users={users} />;
            }
            return <AdminPage users={users} photos={photos} onDeleteUser={handleDeleteUser} onDeletePhoto={handleDeletePhoto} />;
        default:
            return <HomePage photos={photos} users={users} />;
    }
  }

  return (
    <div className="bg-orange-50 dark:bg-slate-900 min-h-screen font-sans text-stone-800 dark:text-stone-200">
      <Header 
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as any)}
        theme={theme}
        onThemeChange={setTheme}
        users={users}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
      <main className="pb-16">
        {renderCurrentPage()}
      </main>

      {/* Modal */}
      {selectedPhoto && <PhotoModal photo={selectedPhoto} users={users} currentUser={currentUser} onClose={() => setSelectedPhoto(null)} onLike={handleLike} onAddComment={handleAddComment} />}

      {/* Chatbot and FAB */}
      <div className="fixed bottom-6 right-6 md:bottom-8 md-right-8 z-50">
        <div className={`transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
           {isChatOpen && <Chatbot onClose={() => setIsChatOpen(false)} />}
        </div>
        
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`bg-orange-500 hover:bg-orange-600 text-white font-bold p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-orange-300 ${isChatOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
          aria-label="Open chat"
        >
          <ChatIcon className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
