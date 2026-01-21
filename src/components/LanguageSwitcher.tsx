'use client';

import { useLanguage } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      <button
        onClick={() => setLocale('zh')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          locale === 'zh'
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        中文
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          locale === 'en'
            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        EN
      </button>
    </div>
  );
}
