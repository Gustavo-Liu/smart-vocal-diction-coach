'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { LyricsBookmark } from '@/lib/types';
import { getBookmarks, removeBookmark, updateLastViewed } from '@/lib/lyrics-bookmarks';

interface LyricsBookmarksSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadBookmark: (bookmark: LyricsBookmark) => void;
  refreshTrigger?: number;
}

export default function LyricsBookmarksSidebar({
  isOpen,
  onClose,
  onLoadBookmark,
  refreshTrigger,
}: LyricsBookmarksSidebarProps) {
  const { t } = useLanguage();
  const [bookmarks, setBookmarks] = useState<LyricsBookmark[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Load bookmarks from localStorage
  const loadBookmarks = useCallback(() => {
    setBookmarks(getBookmarks());
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks, refreshTrigger]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectBookmark = (bookmark: LyricsBookmark) => {
    updateLastViewed(bookmark.id);
    onLoadBookmark(bookmark);
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      removeBookmark(id);
      loadBookmarks();
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Get preview text (first few lines)
  const getPreview = (lyrics: string) => {
    const lines = lyrics.split('\n').filter(l => l.trim());
    const preview = lines.slice(0, 2).join(' ');
    return preview.length > 50 ? preview.substring(0, 47) + '...' : preview;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 sm:w-96 max-w-[85vw]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📄</span>
            {t.lyricsBookmarks}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-64px)]">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-3">📄</span>
              <p className="text-sm">{t.noLyricsBookmarks}</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  onClick={() => handleSelectBookmark(bookmark)}
                  className="group p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-500"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-lg">📄</span>
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {bookmark.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, bookmark.id)}
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        confirmDeleteId === bookmark.id
                          ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                          : 'text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100'
                      }`}
                      title={confirmDeleteId === bookmark.id ? t.confirmBookmark : t.removeBookmark}
                    >
                      {confirmDeleteId === bookmark.id ? (
                        <span className="text-xs font-medium px-1">?</span>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Date */}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t.addedOn} {formatDate(bookmark.addedAt)}
                  </p>

                  {/* Preview */}
                  <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 italic">
                    {getPreview(bookmark.originalLyrics)}
                  </p>

                  {/* Line count badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {bookmark.processedResult.lines.length} lines
                    </span>
                    {bookmark.lastViewedAt && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Last viewed: {formatDate(bookmark.lastViewedAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
