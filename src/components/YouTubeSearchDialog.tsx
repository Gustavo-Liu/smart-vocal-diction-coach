'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { ApiCallRecord, YouTubeVideoResult } from '@/lib/types';
import { addFavorite, isFavorite, getYouTubeThumbnail } from '@/lib/video-favorites';

interface YouTubeSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayVideo: (videoId: string, title: string) => void;
  onApiLog?: (log: ApiCallRecord) => void;
  onFavoriteChange?: () => void;
}

export default function YouTubeSearchDialog({
  isOpen,
  onClose,
  onPlayVideo,
  onApiLog,
  onFavoriteChange,
}: YouTubeSearchDialogProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<YouTubeVideoResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (isLoadMore = false) => {
    if (!query.trim()) {
      setError(t.pleaseEnterQuery);
      return;
    }

    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsSearching(true);
      setSearchResults([]);
      setNextPageToken(null);
    }
    setError(null);

    const startTime = Date.now();

    try {
      const params = new URLSearchParams({ query: query.trim() });
      if (isLoadMore && nextPageToken) {
        params.set('pageToken', nextPageToken);
      }

      const response = await fetch(`/api/youtube-search?${params.toString()}`);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t.youtubeSearchFailed }));

        // Log failed API call
        if (onApiLog) {
          onApiLog({
            id: `api-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            apiName: response.headers.get('X-API-Name') || 'YouTube Data API',
            duration: parseInt(response.headers.get('X-Processing-Duration') || duration.toString()),
            status: 'error',
            error: errorData.error || errorData.message,
          });
        }

        throw new Error(errorData.error || t.youtubeSearchFailed);
      }

      const data = await response.json();

      if (isLoadMore) {
        setSearchResults((prev) => [...prev, ...(data.results || [])]);
      } else {
        setSearchResults(data.results || []);
      }
      setNextPageToken(data.nextPageToken || null);

      // Log successful API call
      if (onApiLog) {
        onApiLog({
          id: `api-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          apiName: response.headers.get('X-API-Name') || 'YouTube Data API',
          duration: parseInt(response.headers.get('X-Processing-Duration') || duration.toString()),
          status: 'success',
          prompt: `Query: "${query}" (${data.results?.length || 0} results)`,
        });
      }

      if (!data.results || data.results.length === 0) {
        setError(t.youtubeNoResults);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.youtubeSearchFailed);
    } finally {
      setIsSearching(false);
      setIsLoadingMore(false);
    }
  };

  const handlePlay = (video: YouTubeVideoResult) => {
    onPlayVideo(video.videoId, video.title);
    onClose();
    // Reset state
    setQuery('');
    setSearchResults([]);
    setNextPageToken(null);
    setError(null);
  };

  const handleAddFavorite = (video: YouTubeVideoResult) => {
    if (isFavorite(video.videoId)) {
      return; // Already favorited
    }

    addFavorite({
      videoId: video.videoId,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl || getYouTubeThumbnail(video.videoId),
    });

    onFavoriteChange?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t.youtubeSearchTitle}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(false)}
              placeholder={t.youtubeSearchPlaceholder}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isSearching}
            />
            <button
              onClick={() => handleSearch(false)}
              disabled={isSearching}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors"
            >
              {isSearching ? t.searching : t.search}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              {searchResults.map((video) => (
                <div
                  key={video.videoId}
                  className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-40 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {video.thumbnailUrl && (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {video.channelTitle} • {formatDate(video.publishedAt)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                      {video.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <button
                      onClick={() => handlePlay(video)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <span>▶️</span>
                      <span>{t.play}</span>
                    </button>
                    <button
                      onClick={() => handleAddFavorite(video)}
                      disabled={isFavorite(video.videoId)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                        isFavorite(video.videoId)
                          ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 cursor-default'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 hover:text-yellow-700 dark:hover:text-yellow-300'
                      }`}
                    >
                      <span>{isFavorite(video.videoId) ? '★' : '☆'}</span>
                      <span>{isFavorite(video.videoId) ? t.removeFavorite : t.addFavorite}</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {nextPageToken && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => handleSearch(true)}
                    disabled={isLoadingMore}
                    className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  >
                    {isLoadingMore ? t.searching : t.loadMore}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
