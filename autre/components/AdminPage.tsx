
import React from 'react';
import type { Photo, User } from '../types';

interface AdminPageProps {
    users: User[];
    photos: Photo[];
    onDeleteUser: (userId: string) => void;
    onDeletePhoto: (photoId: number) => void;
}

const StatCard: React.FC<{ title: string; value: number | string, icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-center space-x-4">
        <div className="bg-orange-100 dark:bg-slate-700 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export const AdminPage: React.FC<AdminPageProps> = ({ users, photos, onDeleteUser, onDeletePhoto }) => {
    
    const totalLikes = photos.reduce((acc, photo) => acc + photo.likes.length, 0);
    const totalComments = photos.reduce((acc, photo) => acc + photo.comments.length, 0);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 space-y-12">
            <header>
                <h1 className="text-4xl font-bold text-center">Panneau d'Administration</h1>
                <p className="text-center text-stone-600 dark:text-stone-400 mt-2">Gérez les utilisateurs et le contenu de la galerie.</p>
            </header>

            {/* Stats */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Statistiques</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard title="Utilisateurs" value={users.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <StatCard title="Photos" value={photos.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                    <StatCard title="J'aime" value={totalLikes} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>} />
                    <StatCard title="Commentaires" value={totalComments} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>} />
                </div>
            </section>

            {/* User Management */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Gérer les utilisateurs</h2>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-stone-200 dark:divide-slate-700">
                        {users.map(user => (
                            <li key={user.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-slate-700/50">
                                <div className="flex items-center space-x-4">
                                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-sm text-stone-500 dark:text-stone-400">{user.id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDeleteUser(user.id)}
                                    disabled={user.id === 'user1'}
                                    className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200 disabled:bg-stone-200 dark:disabled:bg-slate-600 disabled:text-stone-500 disabled:cursor-not-allowed dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Photo Management */}
            <section>
                <h2 className="text-2xl font-semibold mb-4">Gérer les photos</h2>
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                     <ul className="divide-y divide-stone-200 dark:divide-slate-700">
                        {photos.map(photo => (
                            <li key={photo.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50 dark:hover:bg-slate-700/50">
                               <div className="flex items-center space-x-4">
                                    <img src={photo.url} alt={photo.caption} className="w-16 h-16 object-cover rounded-md" />
                                    <div>
                                        <p className="font-semibold">{photo.caption}</p>
                                        <p className="text-sm text-stone-500 dark:text-stone-400">Par {users.find(u=>u.id === photo.ownerId)?.name || 'Inconnu'}</p>
                                    </div>
                                </div>
                                 <button
                                    onClick={() => onDeletePhoto(photo.id)}
                                    className="px-3 py-1 text-sm font-medium text-red-600 bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Supprimer
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
};
