'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { VideoFavorite } from '@/lib/types';
import { getFavorites, removeFavorite, getYouTubeThumbnail } from '@/lib/video-favorites';

interface VideoFavoritesProps {
  onSelectVideo?: (videoId: string, title: string) => void;
  refreshTrigger?: number;
}

export default function VideoFavorites({ onSelectVideo, refreshTrigger }: VideoFavoritesProps) {
  const { t } = useLanguage();
  const [favorites, setFavorites] = useState<VideoFavorite[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load favorites from localStorage
  const loadFavorites = useCallback(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, refreshTrigger]);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeFavorite(id);
    loadFavorites();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (favorites.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
          {t.videoFavorites}
        </h3>
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          <span className="text-2xl block mb-2">☆</span>
          <p className="text-sm">{t.noFavorites}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-md font-semibold text-gray-900 dark:text-white">
          {t.videoFavorites}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({favorites.length})
          </span>
        </h3>
        <span className="text-gray-500 dark:text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Favorites list */}
      {isExpanded && (
        <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
          {favorites.map((video) => (
            <div
              key={video.id}
              onClick={() => onSelectVideo?.(video.videoId, video.title)}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors group"
            >
              {/* Thumbnail */}
              <div className="relative w-20 h-12 flex-shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-600">
                <img
                  src={video.thumbnailUrl || getYouTubeThumbnail(video.videoId)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getYouTubeThumbnail(video.videoId, 'default');
                  }}
                />
                {/* Play icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-lg">▶</span>
                </div>
              </div>

              {/* Video info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {video.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.addedOn} {formatDate(video.addedAt)}
                </p>
                {video.notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 truncate mt-0.5">
                    {video.notes}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                onClick={(e) => handleRemove(e, video.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title={t.removeFavorite}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
