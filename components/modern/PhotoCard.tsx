import React from 'react';
import type { Photo } from '@/types/modern';
import { HeartIcon, ChatBubbleOvalLeftEllipsisIcon } from './icons';

interface PhotoCardProps {
  photo: Photo;
  onSelect: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onSelect }) => {
  return (
    <div
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer bg-stone-200 dark:bg-slate-800"
      onClick={() => onSelect(photo)}
    >
      <img
        src={photo.url}
        alt={photo.caption}
        className="w-full h-auto object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
        <div className="p-4 text-white">
          <p className="font-semibold text-sm md:text-base drop-shadow-md">{photo.caption}</p>
          <div className="flex items-center space-x-4 mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <div className="flex items-center space-x-1">
              <HeartIcon className="w-4 h-4" />
              <span>{photo.likes.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ChatBubbleOvalLeftEllipsisIcon className="w-4 h-4" />
              <span>{photo.comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
