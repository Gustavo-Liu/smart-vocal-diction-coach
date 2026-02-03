import { VideoFavorite } from './types';

const STORAGE_KEY = 'vocal-coach-video-favorites';

/**
 * Get all video favorites from localStorage
 */
export function getFavorites(): VideoFavorite[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as VideoFavorite[];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

/**
 * Add a video to favorites
 */
export function addFavorite(video: Omit<VideoFavorite, 'id' | 'addedAt'>): VideoFavorite {
  const favorites = getFavorites();

  // Check if already exists
  const existing = favorites.find(f => f.videoId === video.videoId);
  if (existing) {
    return existing;
  }

  const newFavorite: VideoFavorite = {
    ...video,
    id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    addedAt: Date.now(),
  };

  const updated = [newFavorite, ...favorites];
  saveFavorites(updated);

  return newFavorite;
}

/**
 * Remove a video from favorites by ID
 */
export function removeFavorite(id: string): void {
  const favorites = getFavorites();
  const updated = favorites.filter(f => f.id !== id);
  saveFavorites(updated);
}

/**
 * Remove a video from favorites by video ID
 */
export function removeFavoriteByVideoId(videoId: string): void {
  const favorites = getFavorites();
  const updated = favorites.filter(f => f.videoId !== videoId);
  saveFavorites(updated);
}

/**
 * Check if a video is in favorites
 */
export function isFavorite(videoId: string): boolean {
  const favorites = getFavorites();
  return favorites.some(f => f.videoId === videoId);
}

/**
 * Update notes for a favorite
 */
export function updateFavoriteNotes(id: string, notes: string): void {
  const favorites = getFavorites();
  const updated = favorites.map(f =>
    f.id === id ? { ...f, notes } : f
  );
  saveFavorites(updated);
}

/**
 * Update title for a favorite
 */
export function updateFavoriteTitle(id: string, title: string): void {
  const favorites = getFavorites();
  const updated = favorites.map(f =>
    f.id === id ? { ...f, title } : f
  );
  saveFavorites(updated);
}

/**
 * Save favorites to localStorage
 */
function saveFavorites(favorites: VideoFavorite[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/  // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    maxres: 'maxresdefault'
  };
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
