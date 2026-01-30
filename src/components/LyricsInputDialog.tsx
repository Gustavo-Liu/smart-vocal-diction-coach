'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';

const LYDIA_FAURE_LYRICS = `Lydia sur tes roses joues
Et sur ton col frais et si blanc
Roule étincelant
L'or fluide que tu dénoues;

Le jour qui luit est le meilleur
Oublions l'éternelle tombe
Laisse tes baisers de colombe
Chanter sur ta lèvre en fleur

Un lys caché répand sans cesse
Une odeur divine en ton sein;
Les délices comme un essaim
Sortent de toi, jeune déesse

Je t'aime et meurs, ô mes amours
Mon âme en baisers m'est ravie!
O Lydia, rends-moi la vie
Que je puisse mourir, mourir toujours!`;

interface LyricsInputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lyrics: string) => void;
  onOpenSearch: () => void;
  isLoading?: boolean;
  initialLyrics?: string;
}

export default function LyricsInputDialog({
  isOpen,
  onClose,
  onSubmit,
  onOpenSearch,
  isLoading = false,
  initialLyrics = '',
}: LyricsInputDialogProps) {
  const { t } = useLanguage();
  const [lyrics, setLyrics] = useState(initialLyrics);

  useEffect(() => {
    setLyrics(initialLyrics);
  }, [initialLyrics]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lyrics.trim()) {
      onSubmit(lyrics.trim());
      onClose();
    }
  };

  const handleLoadTestLyrics = () => {
    setLyrics(LYDIA_FAURE_LYRICS);
  };

  const handleOpenSearch = () => {
    onClose();
    onOpenSearch();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t.lyricsInputTitle}
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Action Buttons */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={handleOpenSearch}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors text-sm font-medium"
              >
                {t.smartSearch}
              </button>
              <button
                type="button"
                onClick={handleLoadTestLyrics}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors text-sm font-medium"
              >
                {t.loadTestLyrics}
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-y"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={!lyrics.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? t.processing : t.generateIPA}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
