
import React, { useState, useMemo } from 'react';
import { PhotoCard } from './PhotoCard';
import type { Photo, User } from '../types';
import { SearchIcon } from './icons';

interface PhotoGalleryProps {
  photos: Photo[];
  users: User[];
  onSelectPhoto: (photo: Photo) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, users, onSelectPhoto }) => {
  const [uploaderFilter, setUploaderFilter] = useState<string>('all');
  const [taggedFilter, setTaggedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      const uploaderMatch = uploaderFilter === 'all' || photo.ownerId === uploaderFilter;
      const taggedMatch = taggedFilter === 'all' || photo.taggedUserIds.includes(taggedFilter);
      const searchMatch = searchQuery === '' || photo.caption.toLowerCase().includes(searchQuery.toLowerCase());
      return uploaderMatch && taggedMatch && searchMatch;
    });
  }, [photos, uploaderFilter, taggedFilter, searchQuery]);

  const filterButtonClasses = (isActive: boolean) =>
    `px-3 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
      isActive
        ? 'bg-amber-500 text-white shadow'
        : 'bg-white/80 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-stone-200'
    }`;
    
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8 p-4 bg-amber-100/50 dark:bg-slate-800/50 rounded-xl space-y-4">
        <div className="relative">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par légende..."
                className="w-full pl-10 pr-4 py-2 text-stone-700 dark:text-stone-200 bg-white/80 dark:bg-slate-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-stone-400" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">Publiée par :</label>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setUploaderFilter('all')} className={filterButtonClasses(uploaderFilter === 'all')}>Tous</button>
                    {users.map(user => (
                    <button key={user.id} onClick={() => setUploaderFilter(user.id)} className={filterButtonClasses(uploaderFilter === user.id)}>
                        <div className="flex items-center gap-2"><img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" /><span>{user.name}</span></div>
                    </button>
                    ))}
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-2">Présent sur la photo :</label>
                 <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setTaggedFilter('all')} className={filterButtonClasses(taggedFilter === 'all')}>Tous</button>
                    {users.map(user => (
                    <button key={user.id} onClick={() => setTaggedFilter(user.id)} className={filterButtonClasses(taggedFilter === user.id)}>
                        <div className="flex items-center gap-2"><img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full" /><span>{user.name}</span></div>
                    </button>
                    ))}
                </div>
            </div>
        </div>
      </div>
      
      {filteredPhotos.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {filteredPhotos.map(photo => (
            <div key={photo.id} className="mb-4 break-inside-avoid">
                <PhotoCard photo={photo} onSelect={onSelectPhoto} />
            </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-16 text-stone-500 dark:text-stone-400">
            <p className="font-semibold">Aucune photo ne correspond à votre recherche.</p>
            <p className="text-sm mt-1">Essayez d'ajuster vos filtres.</p>
        </div>
      )}

    </div>
  );
};
