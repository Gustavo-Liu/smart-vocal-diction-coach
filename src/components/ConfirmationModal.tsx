'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

interface ConfirmationModalProps {
  lyrics: string;
  isOpen: boolean;
  onConfirm: (editedLyrics: string) => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  lyrics,
  isOpen,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const { t } = useLanguage();
  const [editedLyrics, setEditedLyrics] = useState(lyrics);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(editedLyrics);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t.confirmLyrics}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t.confirmDescription}
          </p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <textarea
            value={editedLyrics}
            onChange={(e) => setEditedLyrics(e.target.value)}
            className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-y font-mono text-sm"
            placeholder={t.editPlaceholder}
          />
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation min-h-[44px]"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors touch-manipulation min-h-[44px]"
          >
            {t.confirmGenerate}
          </button>
        </div>
      </div>
    </div>
  );
}
