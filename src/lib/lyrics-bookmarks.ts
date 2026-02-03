import { LyricsBookmark, ProcessResult } from './types';

const STORAGE_KEY = 'vocal-coach-lyrics-bookmarks';

/**
 * Get all lyrics bookmarks from localStorage
 */
export function getBookmarks(): LyricsBookmark[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as LyricsBookmark[];
  } catch (error) {
    console.error('Error reading lyrics bookmarks from localStorage:', error);
    return [];
  }
}

/**
 * Add a lyrics bookmark
 */
export function addBookmark(
  title: string,
  originalLyrics: string,
  processedResult: ProcessResult
): LyricsBookmark {
  const bookmarks = getBookmarks();

  // Check if already exists by comparing original lyrics
  const existing = bookmarks.find(b => b.originalLyrics === originalLyrics);
  if (existing) {
    return existing;
  }

  const newBookmark: LyricsBookmark = {
    id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title || generateTitle(originalLyrics),
    originalLyrics,
    processedResult,
    addedAt: Date.now(),
  };

  const updated = [newBookmark, ...bookmarks];
  saveBookmarks(updated);

  return newBookmark;
}

/**
 * Remove a bookmark by ID
 */
export function removeBookmark(id: string): void {
  const bookmarks = getBookmarks();
  const updated = bookmarks.filter(b => b.id !== id);
  saveBookmarks(updated);
}

/**
 * Update a bookmark
 */
export function updateBookmark(id: string, updates: Partial<Omit<LyricsBookmark, 'id'>>): void {
  const bookmarks = getBookmarks();
  const updated = bookmarks.map(b =>
    b.id === id ? { ...b, ...updates } : b
  );
  saveBookmarks(updated);
}

/**
 * Check if lyrics are already bookmarked
 */
export function isBookmarked(originalLyrics: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.originalLyrics === originalLyrics);
}

/**
 * Get a bookmark by ID
 */
export function getBookmarkById(id: string): LyricsBookmark | undefined {
  const bookmarks = getBookmarks();
  return bookmarks.find(b => b.id === id);
}

/**
 * Update last viewed timestamp
 */
export function updateLastViewed(id: string): void {
  updateBookmark(id, { lastViewedAt: Date.now() });
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarks(bookmarks: LyricsBookmark[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Error saving lyrics bookmarks to localStorage:', error);
  }
}

/**
 * Generate a title from the lyrics (first line or first few words)
 */
function generateTitle(lyrics: string): string {
  const firstLine = lyrics.split('\n').find(line => line.trim()) || '';
  const trimmed = firstLine.trim();
  if (trimmed.length <= 30) {
    return trimmed;
  }
  return trimmed.substring(0, 27) + '...';
}
