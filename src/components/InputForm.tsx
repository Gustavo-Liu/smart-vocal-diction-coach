'use client';

import { useState } from 'react';
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

interface InputFormProps {
  onSubmit: (lyrics: string) => void;
  isLoading?: boolean;
  onOpenSearch?: () => void;
  lyrics?: string;
  onLyricsChange?: (lyrics: string) => void;
}

export default function InputForm({ onSubmit, isLoading = false, onOpenSearch, lyrics: externalLyrics, onLyricsChange }: InputFormProps) {
  const { t } = useLanguage();
  const [internalLyrics, setInternalLyrics] = useState('');

  const lyrics = externalLyrics !== undefined ? externalLyrics : internalLyrics;
  const setLyrics = (value: string) => {
    if (onLyricsChange) {
      onLyricsChange(value);
    } else {
      setInternalLyrics(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lyrics.trim()) {
      onSubmit(lyrics.trim());
    }
  };

  const handleLoadTestLyrics = () => {
    setLyrics(LYDIA_FAURE_LYRICS);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="lyrics" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t.inputLabel}
        </label>
        <div className="flex gap-2">
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              className="text-xs px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-md transition-colors"
            >
              {t.smartSearch}
            </button>
          )}
          <button
            type="button"
            onClick={handleLoadTestLyrics}
            className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
          >
            {t.loadTestLyrics}
          </button>
        </div>
      </div>

      <textarea
        id="lyrics"
        value={lyrics}
        onChange={(e) => setLyrics(e.target.value)}
        placeholder={t.inputPlaceholder}
        className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-y"
        disabled={isLoading}
      />

      <button
        type="submit"
        disabled={!lyrics.trim() || isLoading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors touch-manipulation min-h-[44px]"
      >
        {isLoading ? t.processing : t.generateIPA}
      </button>
    </form>
  );
}
