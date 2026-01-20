'use client';

import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
  audioUrl: string | null;
  onPlayComplete?: () => void;
}

export default function AudioPlayer({ audioUrl, onPlayComplete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
      onPlayComplete?.();
    };

    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onPlayComplete]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioUrl) {
      audio.load();
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  if (!audioUrl) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <audio ref={audioRef} src={audioUrl} />
      <button
        onClick={handlePlayPause}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors touch-manipulation min-h-[44px]"
      >
        {isPlaying ? '⏸️ 暂停' : '▶️ 播放'}
      </button>
      <button
        onClick={handleStop}
        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors touch-manipulation min-h-[44px]"
      >
        ⏹️ 停止
      </button>
    </div>
  );
}
