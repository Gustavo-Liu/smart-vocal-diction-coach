'use client';

import { LyricLine } from '@/lib/types';

interface LyricsCardProps {
  lines: LyricLine[];
  onPlayLine?: (lineIndex: number, ipaText: string) => void;
  playingLineIndex?: number | null;
}

export default function LyricsCard({ lines, onPlayLine, playingLineIndex }: LyricsCardProps) {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {lines.map((line, index) => (
        <div
          key={index}
          className={`p-4 border rounded-lg transition-colors ${
            playingLineIndex === index
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }`}
        >
          <div className="space-y-2">
            {/* Original text */}
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {line.original}
            </div>

            {/* IPA Sung */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                IPA (歌唱):
              </span>
              <span className="text-base font-mono text-blue-700 dark:text-blue-300">
                {line.ipa_sung}
              </span>
              {onPlayLine && (
                <button
                  onClick={() => onPlayLine(index, line.ipa_sung)}
                  className="ml-auto px-3 py-2 text-xs sm:text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded transition-colors touch-manipulation min-h-[36px]"
                >
                  🔊 播放
                </button>
              )}
            </div>

            {/* IPA Spoken (对比用) */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                IPA (口语):
              </span>
              <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                {line.ipa_spoken}
              </span>
            </div>

            {/* Notes */}
            {line.notes && line.notes.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  说明:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {line.notes.map((note, noteIndex) => (
                    <li key={noteIndex} className="text-xs text-gray-600 dark:text-gray-400">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
