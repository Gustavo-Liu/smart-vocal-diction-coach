'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { extractVideoId, addFavorite, isFavorite, removeFavoriteByVideoId, getYouTubeThumbnail } from '@/lib/video-favorites';

interface YouTubeSectionProps {
  onFavoriteChange?: () => void;
  selectedVideoId?: string | null;
  selectedVideoTitle?: string;
  onOpenSearch?: () => void;
}

export default function YouTubeSection({ onFavoriteChange, selectedVideoId, selectedVideoTitle, onOpenSearch }: YouTubeSectionProps) {
  const { t } = useLanguage();
  const [videoUrl, setVideoUrl] = useState('');
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [isCurrentFavorite, setIsCurrentFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle external video selection (from favorites)
  useEffect(() => {
    if (selectedVideoId && selectedVideoId !== currentVideoId) {
      setCurrentVideoId(selectedVideoId);
      setVideoTitle(selectedVideoTitle || '');
      setVideoUrl(`https://www.youtube.com/watch?v=${selectedVideoId}`);
      setIsCurrentFavorite(isFavorite(selectedVideoId));
      setError(null);
    }
  }, [selectedVideoId, selectedVideoTitle, currentVideoId]);

  const handleLoadVideo = useCallback(() => {
    setError(null);
    const videoId = extractVideoId(videoUrl.trim());

    if (!videoId) {
      setError(t.invalidYouTubeUrl);
      return;
    }

    setCurrentVideoId(videoId);
    setIsCurrentFavorite(isFavorite(videoId));
    // Clear title until user provides one
    setVideoTitle('');
  }, [videoUrl, t]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentVideoId) return;

    if (isCurrentFavorite) {
      removeFavoriteByVideoId(currentVideoId);
      setIsCurrentFavorite(false);
    } else {
      addFavorite({
        videoId: currentVideoId,
        title: videoTitle || `Video ${currentVideoId}`,
        thumbnailUrl: getYouTubeThumbnail(currentVideoId),
      });
      setIsCurrentFavorite(true);
    }

    onFavoriteChange?.();
  }, [currentVideoId, isCurrentFavorite, videoTitle, onFavoriteChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLoadVideo();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.youtubeSection}
        </h2>
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
            title={t.youtubeSearch}
          >
            <span>🔍</span>
            <span className="hidden sm:inline">{t.youtubeSearch}</span>
          </button>
        )}
      </div>

      {/* URL Input */}
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.youtubeUrlPlaceholder}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleLoadVideo}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {t.loadVideo}
          </button>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>

      {/* Video Player */}
      {currentVideoId ? (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Video iframe */}
          <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideoId}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>

          {/* Video title input and favorite button */}
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder={t.videoTitlePlaceholder}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleToggleFavorite}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                isCurrentFavorite
                  ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 hover:text-yellow-700 dark:hover:text-yellow-300'
              }`}
            >
              <span>{isCurrentFavorite ? '★' : '☆'}</span>
              <span className="hidden sm:inline">
                {isCurrentFavorite ? t.removeFavorite : t.addFavorite}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Placeholder when no video */
        <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-gray-600 dark:text-gray-400">
              {t.youtubeEmptyState}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Export the loadFromFavorite function for external use
export type { YouTubeSectionProps };
