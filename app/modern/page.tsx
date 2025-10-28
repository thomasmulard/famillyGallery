'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhotoGallery } from '@/components/modern/PhotoGallery';
// Note: Chatbot and AdminPage will be integrated in a future step.
// import { Chatbot } from '@/components/modern/Chatbot';
// import { AdminPage } from '@/components/modern/AdminPage';
import {
    ChatIcon, CloseIcon, HeartIcon, SendIcon, SunIcon, MoonIcon, HomeIcon, PhotoIcon,
    ArrowUpTrayIconUser, UserCircleIcon, ArrowRightStartOnRectangleIcon, ShieldCheckIcon
} from '@/components/modern/icons';
import { useRouter } from 'next/navigation';
import type { Photo, DbUser, Comment, Like, SessionUser } from '@/types/modern';

// --- HELPER to find user by ID ---
const findUser = (id: string, users: DbUser[]) => users.find(u => u.id === id);


// --- MODAL COMPONENTS ---

const PhotoModal: React.FC<{
  photo: Photo;
  users: DbUser[];
  currentUser: SessionUser;
  onClose: () => void;
  onLike: (photoId: number) => void;
  onAddComment: (photoId: number, text: string) => void;
}> = ({ photo, users, currentUser, onClose, onLike, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const photoOwner = findUser(photo.ownerId, users);
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
                        <img src={photoOwner?.avatar_url || '/default-avatar.png'} alt={photoOwner?.name || 'Utilisateur'} className="w-10 h-10 rounded-full" />
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
                            const commentUser = findUser(comment.userId, users);
                            return (
                                <div key={comment.id} className="flex items-start gap-3">
                                    <img src={commentUser?.avatar_url || '/default-avatar.png'} alt={commentUser?.name || 'Utilisateur'} className="w-8 h-8 rounded-full mt-1" />
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
                            <img src={currentUser.image || '/default-avatar.png'} alt={currentUser.name || 'Utilisateur'} className="w-8 h-8 rounded-full"/>
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

const HomePage: React.FC<{ photos: Photo[]; users: DbUser[] }> = ({ photos, users }) => {
  // This component will be fleshed out later to show an activity feed.
  // For now, it can be a placeholder or show a welcome message.
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 text-slate-800 dark:text-amber-100">Bienvenue dans votre Galerie Familiale</h2>
        <p className="text-lg text-slate-600 dark:text-slate-300">Partagez et revivez vos meilleurs souvenirs.</p>
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">Le fil d'actualité sera bientôt disponible ici.</p>
    </div>
  );
};


const GalleryPage: React.FC<{
    photos: Photo[];
    users: DbUser[];
    onSelectPhoto: (photo: Photo) => void;
}> = ({ photos, users, onSelectPhoto }) => {
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
    users: DbUser[];
}> = ({ onClose, onUpload, users }) => {
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
                                <img src={user.avatar_url || '/default-avatar.png'} alt={user.name || 'Utilisateur'} className="w-6 h-6 rounded-full"/>
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
    currentUser: SessionUser;
    currentPage: string;
    onNavigate: (page: 'home' | 'gallery' | 'upload' | 'admin') => void;
    onLogout: () => void;
    theme: 'light' | 'dark';
    onThemeChange: () => void;
}> = ({ currentUser, currentPage, onNavigate, onLogout, theme, onThemeChange }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const navLinkClasses = (page: string) => {
        const base = "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200";
        const active = currentPage === page
            ? 'bg-primary text-white shadow-md'
            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-slate-700';
        return `${base} ${active}`;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-slate-800">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                         <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-amber-100">
                            Famille<span className="text-primary">Galerie</span>
                        </h1>
                        <div className="hidden md:flex items-center space-x-2">
                            <button onClick={() => onNavigate('home')} className={navLinkClasses('home')}><HomeIcon className="w-5 h-5"/>Accueil</button>
                            <button onClick={() => onNavigate('gallery')} className={navLinkClasses('gallery')}><PhotoIcon className="w-5 h-5"/>Galerie</button>
                            <button onClick={() => onNavigate('upload')} className={navLinkClasses('upload')}><ArrowUpTrayIconUser className="w-5 h-5"/>Partager</button>
                            {currentUser.is_admin && (
                                <button onClick={() => onNavigate('admin')} className={navLinkClasses('admin')}><ShieldCheckIcon className="w-5 h-5"/>Admin</button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button onClick={onThemeChange} className="p-2 rounded-full text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors">
                            {theme === 'dark' ? <SunIcon className="w-6 h-6"/> : <MoonIcon className="w-6 h-6"/>}
                        </button>
                        <div className="relative" ref={profileRef}>
                            <button onClick={() => setIsProfileOpen(o => !o)} className="flex items-center">
                                <img className="h-9 w-9 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-primary" src={currentUser.image || '/default-avatar.png'} alt="" />
                            </button>
                            {isProfileOpen && (
                                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-up-sm">
                                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                                        <p className="font-semibold">{currentUser.name}</p>
                                        <p className="text-xs truncate text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-slate-700"></div>
                                    <a href="#" onClick={onLogout} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
                                        Se déconnecter
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};


// --- MAIN APP COMPONENT ---

export default function ModernPage() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [users, setUsers] = useState<DbUser[]>([]);
    const [currentPage, setCurrentPage] = useState<'home' | 'gallery' | 'upload' | 'admin'>('gallery');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [sessionRes, photosRes] = await Promise.all([
                fetch('/api/auth/session'),
                fetch('/api/photos')
            ]);

            if (!sessionRes.ok) throw new Error('Failed to fetch session');
            const session = await sessionRes.json();

            if (!session?.user) {
                router.push('/api/auth/signin');
                return;
            }
            setCurrentUser(session.user);

            if (!photosRes.ok) throw new Error('Failed to fetch photos');
            const photosData = await photosRes.json();

            // Process photos and extract all unique users
            const allUsers = new Map<string, DbUser>();
            const processedPhotos = photosData.photos.map((p: any) => {
                // Add photo owner
                if (p.user) allUsers.set(p.user.id, { id: p.user.id, name: p.user.name, avatar_url: p.user.avatar_url });

                // Add users from comments (if they exist)
                (p.comments || []).forEach((c: any) => {
                    if (c.user) allUsers.set(c.user.id, { id: c.user.id, name: c.user.name, avatar_url: c.user.avatar_url });
                });

                return {
                    id: p.id,
                    url: p.src, // The API provides 'src', not 'url' or 'path'
                    caption: p.title, // The API provides 'title'
                    ownerId: p.user.id, // The user object is nested
                    taggedUserIds: (p.tags || []).map((u: any) => u.id),
                    likes: (p.likes || []).map((l: any) => ({ userId: l.userId, createdAt: new Date(l.createdAt).getTime() })),
                    comments: (p.comments || []).map((c: any) => ({ id: c.id, userId: c.userId, text: c.text, createdAt: new Date(c.createdAt).getTime(), user: c.user })),
                    createdAt: new Date(p.date).getTime(), // The API provides 'date'
                    user: p.user,
                };
            });

            setPhotos(processedPhotos);
            setUsers(Array.from(allUsers.values()));

        } catch (e: any) {
            setError(e.message || 'An unknown error occurred.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);


    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeChange = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        await fetch('/api/auth/signout', { method: 'POST' });
        router.push('/api/auth/signin');
    };

    const handleLike = async (photoId: number) => {
        // Optimistic update
        setPhotos(prevPhotos => prevPhotos.map(p => {
            if (p.id === photoId && currentUser) {
                const hasLiked = p.likes.some(l => l.userId === currentUser.id);
                if (hasLiked) {
                    return { ...p, likes: p.likes.filter(l => l.userId !== currentUser.id) };
                } else {
                    return { ...p, likes: [...p.likes, { userId: currentUser.id, createdAt: Date.now() }] };
                }
            }
            return p;
        }));

        // API call
        await fetch(`/api/photos/${photoId}/like`, { method: 'POST' });
        // Optionally re-fetch or handle errors
    };

    const handleAddComment = async (photoId: number, text: string) => {
        if (!currentUser) return;

        const tempCommentId = `temp-${Date.now()}`;
        const newComment: Comment = {
            id: tempCommentId,
            userId: currentUser.id,
            text,
            createdAt: Date.now(),
            user: { id: currentUser.id, name: currentUser.name || 'You', avatar_url: currentUser.image || null }
        };

        // Optimistic update
        setPhotos(prevPhotos => prevPhotos.map(p => {
            if (p.id === photoId) {
                return { ...p, comments: [...p.comments, newComment] };
            }
            return p;
        }));
        setSelectedPhoto(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);


        // API call
        const response = await fetch(`/api/photos/${photoId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
        });

        if (response.ok) {
            const savedComment = await response.json();
            // Replace temp comment with real one from server
            setPhotos(prevPhotos => prevPhotos.map(p => ({
                ...p,
                comments: p.comments.map(c => c.id === tempCommentId ? { ...savedComment, createdAt: new Date(savedComment.createdAt).getTime(), user: c.user } : c)
            })));
             setSelectedPhoto(prev => prev ? {
                ...prev,
                comments: prev.comments.map(c => c.id === tempCommentId ? { ...savedComment, createdAt: new Date(savedComment.createdAt).getTime(), user: c.user } : c)
            } : null);
        } else {
            // Revert on error
            setPhotos(prevPhotos => prevPhotos.map(p => ({
                ...p,
                comments: p.comments.filter(c => c.id !== tempCommentId)
            })));
            setSelectedPhoto(prev => prev ? {
                ...prev,
                comments: prev.comments.filter(c => c.id !== tempCommentId)
            } : null);
        }
    };

    const handleUpload = async (caption: string, imageBase64: string, taggedUserIds: string[]) => {
        const response = await fetch('/api/photos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caption, imageBase64, taggedUserIds }),
        });
        if (response.ok) {
            await fetchData(); // Re-fetch all data to show the new photo
            setCurrentPage('gallery');
        } else {
            alert('Upload failed');
        }
    };


    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage photos={photos} users={users} />;
            case 'gallery':
                return <GalleryPage photos={photos} users={users} onSelectPhoto={setSelectedPhoto} />;
            case 'upload':
                return <UploadPage users={users} onClose={() => setCurrentPage('gallery')} onUpload={handleUpload} />;
            case 'admin':
                 // return <AdminPage />;
                 return <div className="p-8"><h2 className="text-2xl font-bold">Panneau d'administration (Bientôt disponible)</h2></div>;
            default:
                return <GalleryPage photos={photos} users={users} onSelectPhoto={setSelectedPhoto} />;
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Chargement de la galerie...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen bg-red-50 text-red-700">Erreur: {error}</div>;
    }

    if (!currentUser) {
        // This should be handled by the redirect, but as a fallback:
        return <div className="flex items-center justify-center h-screen">Redirection...</div>;
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200`}>
            <Header
                currentUser={currentUser}
                currentPage={currentPage}
                onNavigate={(page) => setCurrentPage(page)}
                onLogout={handleLogout}
                theme={theme}
                onThemeChange={handleThemeChange}
            />
            <main>
                {renderPage()}
            </main>

            {selectedPhoto && (
                <PhotoModal
                    photo={selectedPhoto}
                    users={users}
                    currentUser={currentUser}
                    onClose={() => setSelectedPhoto(null)}
                    onLike={handleLike}
                    onAddComment={handleAddComment}
                />
            )}

            {/* Chatbot icon can be added here */}
            {/* <div className="fixed bottom-6 right-6">
                <button className="bg-primary hover:bg-primary/90 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110">
                    <ChatIcon className="w-8 h-8" />
                </button>
            </div> */}
        </div>
    );
}
