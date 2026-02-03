'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/lib/i18n';

interface BookmarkTitleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  lyricsPreview: string;
}

export default function BookmarkTitleDialog({
  isOpen,
  onClose,
  onConfirm,
  lyricsPreview,
}: BookmarkTitleDialogProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(title.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Get first few lines for preview
  const previewLines = lyricsPreview
    .split('\n')
    .filter(line => line.trim())
    .slice(0, 3)
    .join('\n');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <span>⭐</span>
            {t.bookmarkLyrics}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title input */}
          <div>
            <label
              htmlFor="bookmark-title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t.bookmarkTitle}
            </label>
            <input
              ref={inputRef}
              id="bookmark-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.bookmarkTitlePlaceholder}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          {/* Lyrics preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.lyricsPreview}
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-600 dark:text-gray-400 font-mono whitespace-pre-wrap max-h-24 overflow-hidden">
              {previewLines}
              {lyricsPreview.split('\n').filter(l => l.trim()).length > 3 && (
                <span className="text-gray-400 dark:text-gray-500">...</span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {t.confirmBookmark}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
