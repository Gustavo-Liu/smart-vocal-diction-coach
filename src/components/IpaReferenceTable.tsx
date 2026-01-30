'use client';

import { useState, useRef, useEffect } from 'react';
import { frenchIpaReference, IpaSymbol, IpaCategory, getAudioFileName } from '@/lib/ipa-reference';
import { useLanguage } from '@/lib/i18n';

interface IpaReferenceTableProps {
  onClose?: () => void;
}

export default function IpaReferenceTable({ onClose }: IpaReferenceTableProps) {
  const { t, locale } = useLanguage();
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [audioStatus, setAudioStatus] = useState<Record<string, 'static' | 'tts' | 'unavailable'>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<Map<string, string>>(new Map());

  // 清理音频 URL
  useEffect(() => {
    return () => {
      audioCacheRef.current.forEach(url => {
        // 只清理 blob URL，不清理静态文件路径
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      audioCacheRef.current.clear();
    };
  }, []);

  // 检查静态音频文件是否存在
  const checkStaticAudioExists = async (filePath: string): Promise<boolean> => {
    try {
      const response = await fetch(filePath, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  };

  // 获取音频 URL（优先静态文件，回退 TTS）
  const getAudioUrl = async (
    cacheKey: string,
    symbol: string,
    type: 'phoneme' | 'example',
    ttsText: string
  ): Promise<string | null> => {
    // 检查缓存
    const cached = audioCacheRef.current.get(cacheKey);
    if (cached) return cached;

    // 尝试静态文件
    const fileName = getAudioFileName(symbol);
    const staticPath = `/audio/ipa/${fileName}-${type}.mp3`;
    const staticExists = await checkStaticAudioExists(staticPath);

    if (staticExists) {
      audioCacheRef.current.set(cacheKey, staticPath);
      setAudioStatus(prev => ({ ...prev, [cacheKey]: 'static' }));
      return staticPath;
    }

    // 回退到 TTS
    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipa_text: ttsText,
          original_text: ttsText,
          speed: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      audioCacheRef.current.set(cacheKey, audioUrl);
      setAudioStatus(prev => ({ ...prev, [cacheKey]: 'tts' }));
      return audioUrl;
    } catch (error) {
      console.error('Error getting audio:', error);
      setAudioStatus(prev => ({ ...prev, [cacheKey]: 'unavailable' }));
      return null;
    }
  };

  const playAudio = async (cacheKey: string, symbol: string, type: 'phoneme' | 'example', ttsText: string) => {
    // 停止当前播放
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setLoadingKey(cacheKey);

    try {
      const audioUrl = await getAudioUrl(cacheKey, symbol, type, ttsText);

      if (!audioUrl) {
        throw new Error('No audio available');
      }

      // 播放音频
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = 0.8;

      audioRef.current.onended = () => {
        setPlayingKey(null);
      };

      audioRef.current.onerror = () => {
        setPlayingKey(null);
        setLoadingKey(null);
      };

      setLoadingKey(null);
      setPlayingKey(cacheKey);
      await audioRef.current.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setLoadingKey(null);
      setPlayingKey(null);
    }
  };

  const renderCategory = (category: IpaCategory) => {
    const categoryName = locale === 'zh' ? category.category_zh : category.category_en;

    return (
      <div key={categoryName} className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
          {categoryName}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {category.symbols.map(ipa => renderIpaCard(ipa))}
        </div>
      </div>
    );
  };

  const renderIpaCard = (ipa: IpaSymbol) => {
    const phonemeKey = `phoneme:${ipa.symbol}`;
    const exampleKey = `example:${ipa.symbol}`;
    const isPlayingPhoneme = playingKey === phonemeKey;
    const isPlayingExample = playingKey === exampleKey;
    const isLoadingPhoneme = loadingKey === phonemeKey;
    const isLoadingExample = loadingKey === exampleKey;
    const description = locale === 'zh' ? ipa.description_zh : ipa.description_en;

    return (
      <div
        key={ipa.symbol}
        className="p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
      >
        <div className="flex items-start gap-3">
          {/* IPA Symbol */}
          <div className="text-4xl font-mono text-blue-600 dark:text-blue-400 w-14 text-center flex-shrink-0">
            {ipa.symbol}
          </div>

          {/* Info and buttons */}
          <div className="flex-1 min-w-0">
            {/* Description */}
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {description}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {/* Phoneme button */}
              <button
                onClick={() => playAudio(phonemeKey, ipa.symbol, 'phoneme', ipa.phoneme_audio_text)}
                disabled={isLoadingPhoneme || isLoadingExample}
                className={`
                  flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all
                  flex items-center justify-center gap-1
                  ${isPlayingPhoneme
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300'
                  }
                  ${isLoadingPhoneme ? 'opacity-70' : ''}
                `}
              >
                {isLoadingPhoneme ? (
                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                ) : isPlayingPhoneme ? (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                ) : (
                  <span>🔊</span>
                )}
                <span>{locale === 'zh' ? '读音' : 'Sound'}</span>
              </button>

              {/* Example button */}
              <button
                onClick={() => playAudio(exampleKey, ipa.symbol, 'example', ipa.example_audio_text)}
                disabled={isLoadingPhoneme || isLoadingExample}
                className={`
                  flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all
                  flex items-center justify-center gap-1
                  ${isPlayingExample
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-300'
                  }
                  ${isLoadingExample ? 'opacity-70' : ''}
                `}
              >
                {isLoadingExample ? (
                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                ) : isPlayingExample ? (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                ) : (
                  <span>📝</span>
                )}
                <span>{ipa.example}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t.ipaReferenceTitle}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t.ipaReferenceSubtitle}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl p-2"
            >
              &times;
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {frenchIpaReference.map(category => renderCategory(category))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {t.ipaReferenceNote}
          </p>
        </div>
      </div>
    </div>
  );
}
