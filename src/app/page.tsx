'use client';

import { useState } from 'react';
import InputForm from '@/components/InputForm';
import LyricsCard from '@/components/LyricsCard';
import SpeedControl from '@/components/SpeedControl';
import AudioPlayer from '@/components/AudioPlayer';
import ConfirmationModal from '@/components/ConfirmationModal';
import { ProcessResult, RStyle } from '@/lib/types';

export default function Home() {
  const [lyrics, setLyrics] = useState('');
  const [rStyle, setRStyle] = useState<RStyle>('uvular');
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingLyrics, setPendingLyrics] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [playingLineIndex, setPlayingLineIndex] = useState<number | null>(null);
  const [speed, setSpeed] = useState(0.3);

  const handleSubmit = async (submittedLyrics: string, submittedRStyle: RStyle) => {
    setPendingLyrics(submittedLyrics);
    setRStyle(submittedRStyle);
    setShowModal(true);
  };

  const handleConfirm = async (editedLyrics: string) => {
    setShowModal(false);
    setLyrics(editedLyrics);
    setIsLoading(true);
    setError(null);
    setResult(null);
    setCurrentAudioUrl(null);

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lyrics: editedLyrics,
          r_style: rStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '处理失败');
      }

      const data: ProcessResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '处理歌词时发生错误');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayLine = async (lineIndex: number, ipaText: string) => {
    setPlayingLineIndex(lineIndex);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ipa_text: ipaText,
          speed: speed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '生成音频失败');
      }

      const data = await response.json();
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      // Play audio
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        setPlayingLineIndex(null);
        setIsLoading(false);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成音频时发生错误');
      setPlayingLineIndex(null);
      setIsLoading(false);
    }
  };

  const handlePlayAll = async () => {
    if (!result || result.lines.length === 0) return;

    setIsLoading(true);
    setError(null);
    setPlayingLineIndex(null);

    try {
      // Play all lines sequentially
      for (let i = 0; i < result.lines.length; i++) {
        const line = result.lines[i];
        setPlayingLineIndex(i);

        const response = await fetch('/api/audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ipa_text: line.ipa_sung,
            speed: speed,
          }),
        });

        if (!response.ok) {
          throw new Error('生成音频失败');
        }

        const data = await response.json();
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        await new Promise<void>((resolve) => {
          const audio = new Audio(audioUrl);
          audio.play();
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
        });
      }

      setPlayingLineIndex(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '播放失败');
      setPlayingLineIndex(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            智能声乐正音助手
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            法语艺术歌曲发音指导工具
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !result && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">处理中...</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4 sm:space-y-6">
            {/* Speed Control */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <SpeedControl speed={speed} onSpeedChange={setSpeed} />
            </div>

            {/* Play All Button */}
            <div className="flex justify-center">
              <button
                onClick={handlePlayAll}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors touch-manipulation"
              >
                {isLoading ? '播放中...' : '🎵 播放全篇'}
              </button>
            </div>

            {/* Lyrics Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <LyricsCard
                lines={result.lines}
                onPlayLine={handlePlayLine}
                playingLineIndex={playingLineIndex}
              />
            </div>

            {/* Audio Player */}
            {currentAudioUrl && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
                <AudioPlayer
                  audioUrl={currentAudioUrl}
                  onPlayComplete={() => setPlayingLineIndex(null)}
                />
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          lyrics={pendingLyrics}
          isOpen={showModal}
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </main>
  );
}
