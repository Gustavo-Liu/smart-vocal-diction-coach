'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { ApiCallRecord } from '@/lib/types';

interface LyricsSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLyrics: (lyrics: string) => void;
  onApiLog?: (log: ApiCallRecord) => void;
}

interface SearchResult {
  title: string;
  snippet: string;
  lyrics: string;  // 歌词直接从 API 返回
}

export default function LyricsSearchDialog({ isOpen, onClose, onImportLyrics, onApiLog }: LyricsSearchDialogProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim()) {
      setError(t.pleaseEnterQuery);
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    setSelectedResult(null);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/search-lyrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t.searchFailed }));

        // 记录失败的 API 调用
        if (onApiLog) {
          onApiLog({
            id: `api-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            apiName: response.headers.get('X-API-Name') || 'GPT-4o (Search)',
            duration: parseInt(response.headers.get('X-Processing-Duration') || duration.toString()),
            status: 'error',
            error: errorData.error || errorData.message,
          });
        }

        throw new Error(errorData.error || t.searchFailed);
      }

      const data = await response.json();
      setSearchResults(data.results || []);

      // 记录成功的 API 调用
      if (onApiLog) {
        onApiLog({
          id: `api-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          apiName: response.headers.get('X-API-Name') || 'GPT-4o (Search)',
          duration: parseInt(response.headers.get('X-Processing-Duration') || duration.toString()),
          inputTokens: parseInt(response.headers.get('X-Input-Tokens') || '0'),
          outputTokens: parseInt(response.headers.get('X-Output-Tokens') || '0'),
          cost: parseFloat(response.headers.get('X-Cost') || '0'),
          prompt: response.headers.get('X-Prompt') ? decodeURIComponent(response.headers.get('X-Prompt')!) : undefined,
          status: 'success',
        });
      }

      if (!data.results || data.results.length === 0) {
        setError(t.noResultsFound);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.searchFailed);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    // 歌词已经在搜索结果中，直接显示
    setSelectedResult(result);
    setError(null);
  };

  const handleImport = () => {
    if (selectedResult?.lyrics) {
      onImportLyrics(selectedResult.lyrics);
      onClose();
      // 重置状态
      setQuery('');
      setSearchResults([]);
      setSelectedResult(null);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {t.smartSearchTitle}
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t.searchPlaceholder}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
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
          {searchResults.length > 0 && !selectedResult && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.searchResults}
              </h3>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectResult(result)}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {result.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Selected Lyrics */}
          {selectedResult?.lyrics && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedResult.title}
                </h3>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {t.backToResults}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-gray-900 dark:text-white">
                  {selectedResult.lyrics}
                </pre>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedResult(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleImport}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {t.importLyrics}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
