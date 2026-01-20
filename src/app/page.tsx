'use client';

import { useState, useEffect, useRef } from 'react';
import InputForm from '@/components/InputForm';
import LyricsCard from '@/components/LyricsCard';
import SpeedControl from '@/components/SpeedControl';
import AudioPlayer from '@/components/AudioPlayer';
import ProgressBar from '@/components/ProgressBar';
import { ProcessResult, RStyle } from '@/lib/types';

export default function Home() {
  const [lyrics, setLyrics] = useState('');
  const [rStyle, setRStyle] = useState<RStyle>('uvular');
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [playingLineIndex, setPlayingLineIndex] = useState<number | null>(null);
  const [speed, setSpeed] = useState(0.8);
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);

  // 清理 audio URL 以防止内存泄漏
  useEffect(() => {
    return () => {
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [currentAudioUrl]);

  // 复用一个 audio 元素，减少重复创建/解码开销
  useEffect(() => {
    if (sharedAudioRef.current) return;
    sharedAudioRef.current = new Audio();
  }, []);

  const handleSubmit = async (submittedLyrics: string, submittedRStyle: RStyle) => {
    // 直接处理，跳过确认模态框
    setLyrics(submittedLyrics);
    setRStyle(submittedRStyle);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setResult(null);
    setCurrentAudioUrl(null);
    setProgress(0);
    setProgressLabel('准备处理歌词...');

    try {
      setDebugInfo(`[DEBUG] 开始处理歌词，R音风格: ${submittedRStyle}`);
      setProgress(10);
      setProgressLabel('发送请求到服务器...');

      const requestBody = {
        lyrics: submittedLyrics,
        r_style: submittedRStyle,
      };
      
      setDebugInfo(`[DEBUG] 请求体: ${JSON.stringify({ ...requestBody, lyrics: `${submittedLyrics.length} 字符` })}`);
      
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      setProgress(30);
      setProgressLabel('等待服务器响应...');
      setDebugInfo(`[DEBUG] 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '未知错误' }));
        setDebugInfo(`[DEBUG] 错误响应: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.message || errorData.error || '处理失败');
      }

      setProgress(60);
      setProgressLabel('解析响应数据...');
      
      const data: ProcessResult = await response.json();
      
      setDebugInfo(`[DEBUG] 成功获取结果，共 ${data.lines?.length || 0} 行`);
      setProgress(90);
      setProgressLabel('完成处理...');
      
      setResult(data);
      setProgress(100);
      setProgressLabel('完成！');
      
      // 清除进度信息
      setTimeout(() => {
        setProgress(0);
        setProgressLabel('');
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '处理歌词时发生错误';
      setDebugInfo(`[DEBUG] 错误: ${errorMessage}`);
      setError(errorMessage);
      setProgress(0);
      setProgressLabel('');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayLine = async (lineIndex: number, line: LyricLine) => {
    // 清理旧的 audio URL
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }

    setPlayingLineIndex(lineIndex);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setProgress(0);
    setProgressLabel('生成音频...');

    try {
      setDebugInfo(`[DEBUG] 开始生成音频，行 ${lineIndex + 1}，原文: ${line.original.substring(0, 50)}...`);
      setProgress(20);

      const requestBody = {
        ipa_text: line.ipa_sung,      // 用于缓存键和显示
        original_text: line.original,  // 用于 Google TTS 生成语音
        speed: speed,
      };

      setDebugInfo(`[DEBUG] 请求参数: 速度=${speed}, 原文="${line.original}", IPA长度=${line.ipa_sung.length}`);
      
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      setProgress(50);
      setProgressLabel('处理音频数据...');
      setDebugInfo(`[DEBUG] 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '未知错误' }));
        setDebugInfo(`[DEBUG] 错误响应: ${JSON.stringify(errorData)}`);
        throw new Error(errorData.message || errorData.error || '生成音频失败');
      }

      // 提取调试信息从响应头
      const originalIpa = decodeURIComponent(response.headers.get('X-Debug-Original-IPA') || '');
      const normalizedIpa = decodeURIComponent(response.headers.get('X-Debug-Normalized-IPA') || '');
      const ssml = decodeURIComponent(response.headers.get('X-Debug-SSML') || '');
      const voice = response.headers.get('X-Debug-Voice') || '';
      const cacheStatus = response.headers.get('X-Audio-Cache') || 'UNKNOWN';
      
      setDebugInfo(`[DEBUG] 发送给 Google TTS 的信息:
原始 IPA: ${originalIpa}
规范化 IPA: ${normalizedIpa}
生成的 SSML: ${ssml}
语音: ${voice}
速度: ${speed}
缓存: ${cacheStatus}`);

      setProgress(70);
      setProgressLabel('下载音频...');

      const tBlobStart = performance.now();
      const audioBlob = await response.blob();
      const blobMs = Math.round(performance.now() - tBlobStart);
      setDebugInfo((prev) => `${prev}\n[DEBUG] 收到音频二进制：${audioBlob.type || 'unknown'}, ${audioBlob.size} bytes（下载+转blob ${blobMs}ms）`);

      setProgress(85);
      setProgressLabel('准备播放...');

      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      setProgress(95);
      setProgressLabel('播放中...');
      
      // Play audio
      const audio = sharedAudioRef.current ?? new Audio();
      sharedAudioRef.current = audio;
      audio.pause();
      audio.src = audioUrl;

      audio.onended = () => {
        setPlayingLineIndex(null);
        setIsLoading(false);
        setProgress(0);
        setProgressLabel('');
        setDebugInfo(null);
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        setCurrentAudioUrl(null);
        setPlayingLineIndex(null);
        setIsLoading(false);
        setProgress(0);
        setProgressLabel('');
        setDebugInfo(`[DEBUG] 音频播放错误: ${e}`);
        setError('播放音频时发生错误');
      };

      // OPTIMIZATION: 使用浏览器端 playbackRate 调整速度，而不是每次速度变化都重新生成音频
      // 这大幅提升缓存效率 (从"voiceName|speed|ipa"变为"voiceName|ipa")
      audio.playbackRate = speed;

      const tPlayStart = performance.now();
      await audio.play();
      setDebugInfo((prev) => `${prev ?? ''} | [DEBUG] audio.play() 启动耗时 ${Math.round(performance.now() - tPlayStart)}ms (playbackRate=${speed})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成音频时发生错误';
      setDebugInfo(`[DEBUG] 错误: ${errorMessage}`);
      setError(errorMessage);
      setPlayingLineIndex(null);
      setIsLoading(false);
      setProgress(0);
      setProgressLabel('');
    }
  };

  const handlePlayAll = async () => {
    if (!result || result.lines.length === 0) return;

    // 清理旧的 audio URL
    if (currentAudioUrl) {
      URL.revokeObjectURL(currentAudioUrl);
      setCurrentAudioUrl(null);
    }

    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setPlayingLineIndex(null);
    setProgress(0);
    setProgressLabel('准备播放全篇...');

    try {
      const totalLines = result.lines.length;
      setDebugInfo(`[DEBUG] 开始播放全篇，共 ${totalLines} 行`);

      // OPTIMIZATION: 并行预生成前 3 行音频，后续边播放边生成
      setProgress(5);
      setProgressLabel('并行预生成音频...');
      const PREFETCH_COUNT = Math.min(3, totalLines);

      const prefetchPromises = result.lines.slice(0, PREFETCH_COUNT).map((line, idx) =>
        fetch('/api/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ipa_text: line.ipa_sung, original_text: line.original, speed }),
        }).then(async res => {
          if (!res.ok) throw new Error(`第 ${idx + 1} 行预生成失败`);
          return { index: idx, blob: await res.blob(), url: '' };
        })
      );

      const prefetchedAudios = await Promise.all(prefetchPromises);
      setProgress(20);
      setDebugInfo(`[DEBUG] 已预生成前 ${PREFETCH_COUNT} 行音频`);

      // 为预生成的音频创建 URL
      prefetchedAudios.forEach(audio => {
        audio.url = URL.createObjectURL(audio.blob);
      });

      // Play all lines sequentially (从预生成的缓存开始)
      for (let i = 0; i < totalLines; i++) {
        const line = result.lines[i];
        setPlayingLineIndex(i);
        const progressPercent = 20 + (i / totalLines) * 80;
        setProgress(progressPercent);
        setProgressLabel(`播放第 ${i + 1}/${totalLines} 行...`);

        let audioUrl: string;

        // 检查是否已预生成
        const prefetched = prefetchedAudios.find(a => a.index === i);
        if (prefetched) {
          audioUrl = prefetched.url;
          setDebugInfo(`[DEBUG] 使用预生成音频第 ${i + 1} 行 (${prefetched.blob.size} bytes)`);
        } else {
          // 需要即时生成
          setDebugInfo(`[DEBUG] 即时生成第 ${i + 1} 行音频: ${line.original.substring(0, 30)}...`);

          const response = await fetch('/api/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ipa_text: line.ipa_sung, original_text: line.original, speed }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: '未知错误' }));
            throw new Error(`第 ${i + 1} 行生成音频失败: ${errorData.message || errorData.error || '未知错误'}`);
          }

          const audioBlob = await response.blob();
          audioUrl = URL.createObjectURL(audioBlob);
          setDebugInfo(`[DEBUG] 第 ${i + 1} 行音频生成成功，大小: ${audioBlob.size} bytes`);
        }

        setProgress(progressPercent + (40 / totalLines));
        setProgressLabel(`播放第 ${i + 1}/${totalLines} 行...`);

        await new Promise<void>((resolve, reject) => {
          const audio = sharedAudioRef.current ?? new Audio();
          sharedAudioRef.current = audio;
          audio.pause();
          audio.src = audioUrl;
          audio.playbackRate = speed; // 使用浏览器端速度调整
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            setDebugInfo(`[DEBUG] 第 ${i + 1} 行播放完成 (playbackRate=${speed})`);
            resolve();
          };
          audio.onerror = (e) => {
            URL.revokeObjectURL(audioUrl);
            setDebugInfo(`[DEBUG] 第 ${i + 1} 行播放错误: ${e}`);
            reject(new Error(`第 ${i + 1} 行播放音频时发生错误`));
          };
          audio.play().catch((err) => {
            URL.revokeObjectURL(audioUrl);
            setDebugInfo(`[DEBUG] 第 ${i + 1} 行播放失败: ${err.message}`);
            reject(err);
          });
        });
      }

      setPlayingLineIndex(null);
      setProgress(100);
      setProgressLabel('播放完成！');
      setDebugInfo(`[DEBUG] 全篇播放完成，共 ${totalLines} 行`);
      
      setTimeout(() => {
        setProgress(0);
        setProgressLabel('');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '播放失败';
      setDebugInfo(`[DEBUG] 播放错误: ${errorMessage}`);
      setError(errorMessage);
      setPlayingLineIndex(null);
      setProgress(0);
      setProgressLabel('');
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
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">DEBUG:</span>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 flex-1 break-all">
                {debugInfo}
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {(isLoading || progress > 0) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <ProgressBar 
              progress={progress} 
              label={progressLabel || (isLoading ? '处理中...' : '')}
            />
          </div>
        )}

        {/* Loading State (fallback) */}
        {isLoading && !result && progress === 0 && (
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

      </div>
    </main>
  );
}
