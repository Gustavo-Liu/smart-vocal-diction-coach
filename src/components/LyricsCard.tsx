'use client';

import { LyricLine } from '@/lib/types';

interface LyricsCardProps {
  lines: LyricLine[];
  onPlayLine?: (lineIndex: number, line: LyricLine) => void;
  playingLineIndex?: number | null;
}

export default function LyricsCard({ lines, onPlayLine, playingLineIndex }: LyricsCardProps) {
  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {lines.map((line, index) => (
        <div
          key={index}
          className={`group py-3 px-2 -mx-2 rounded transition-colors ${
            playingLineIndex === index
              ? 'bg-blue-50 dark:bg-blue-900/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          {/* Original text */}
          <div className="font-semibold text-gray-900 dark:text-white">
            {line.original}
          </div>
          {/* IPA + Play button */}
          <div className="flex items-center justify-between mt-1">
            <span className="font-mono text-blue-600 dark:text-blue-400">
              {line.ipa_sung}
            </span>
            {onPlayLine && (
              <button
                onClick={() => onPlayLine(index, line)}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 px-2 py-1 text-sm bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded transition-all touch-manipulation"
              >
                ▶️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
