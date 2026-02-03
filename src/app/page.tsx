'use client';

import { useState, useEffect, useRef } from 'react';
import LyricsCard from '@/components/LyricsCard';
import SpeedControl from '@/components/SpeedControl';
import AudioPlayer from '@/components/AudioPlayer';
import ProgressBar from '@/components/ProgressBar';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ApiLogsTab from '@/components/ApiLogsTab';
import LyricsSearchDialog from '@/components/LyricsSearchDialog';
import LyricsInputDialog from '@/components/LyricsInputDialog';
import IpaReferenceTable from '@/components/IpaReferenceTable';
import YouTubeSection from '@/components/YouTubeSection';
import VideoFavorites from '@/components/VideoFavorites';
import YouTubeSearchDialog from '@/components/YouTubeSearchDialog';
import LyricsBookmarksSidebar from '@/components/LyricsBookmarksSidebar';
import BookmarkTitleDialog from '@/components/BookmarkTitleDialog';
import { ProcessResult, LyricLine, ApiCallRecord, LyricsBookmark } from '@/lib/types';
import { addBookmark, isBookmarked } from '@/lib/lyrics-bookmarks';
import { useLanguage } from '@/lib/i18n';

export default function Home() {
  const { t } = useLanguage();
  const [lyrics, setLyrics] = useState('');
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
  const [showApiLogs, setShowApiLogs] = useState(false);
  const [apiLogs, setApiLogs] = useState<ApiCallRecord[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showIpaReference, setShowIpaReference] = useState(false);
  const [showYoutubeSearch, setShowYoutubeSearch] = useState(false);
  const [showLyricsInput, setShowLyricsInput] = useState(false);
  const [favoriteRefreshTrigger, setFavoriteRefreshTrigger] = useState(0);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [youtubeVideoTitle, setYoutubeVideoTitle] = useState('');
  const [disclaimerExpanded, setDisclaimerExpanded] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [howToUseExpanded, setHowToUseExpanded] = useState(true);
  const [showLyricsBookmarks, setShowLyricsBookmarks] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [lyricsBookmarkRefresh, setLyricsBookmarkRefresh] = useState(0);
  const [isCurrentLyricsBookmarked, setIsCurrentLyricsBookmarked] = useState(false);

  // 首次访问默认展开「如何使用」，之后若用户曾折叠则默认折叠
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' && localStorage.getItem('diction-coach-howto-collapsed');
      if (stored === 'true') setHowToUseExpanded(false);
    } catch {
      // ignore
    }
  }, []);

  const toggleHowToUse = () => {
    setHowToUseExpanded(prev => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') localStorage.setItem('diction-coach-howto-collapsed', next ? 'false' : 'true');
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Check if current lyrics are bookmarked
  useEffect(() => {
    if (lyrics.trim() && result) {
      setIsCurrentLyricsBookmarked(isBookmarked(lyrics.trim()));
    } else {
      setIsCurrentLyricsBookmarked(false);
    }
  }, [lyrics, result, lyricsBookmarkRefresh]);

  // Handle loading a bookmark
  const handleLoadBookmark = (bookmark: LyricsBookmark) => {
    setLyrics(bookmark.originalLyrics);
    setResult(bookmark.processedResult);
    setError(null);
    setDebugInfo(null);
    setIsCurrentLyricsBookmarked(true);
  };

  // Handle adding a bookmark
  const handleAddBookmark = (title: string) => {
    if (!result || !lyrics.trim()) return;
    addBookmark(title, lyrics.trim(), result);
    setShowBookmarkDialog(false);
    setLyricsBookmarkRefresh(prev => prev + 1);
    setIsCurrentLyricsBookmarked(true);
  };

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

  const handleSubmit = async (submittedLyrics: string) => {
    // 直接处理，跳过确认模态框
    setLyrics(submittedLyrics);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    setResult(null);
    setCurrentAudioUrl(null);
    setProgress(0);
    setProgressLabel(t.preparingLyrics);

    const startTime = Date.now();

    try {
      setDebugInfo(`[DEBUG] 开始处理歌词 (古典演唱风格, 卷舌R)`);
      setProgress(10);
      setProgressLabel(t.sendingRequest);

      const requestBody = {
        lyrics: submittedLyrics,
      };

      setDebugInfo(`[DEBUG] 请求体: 歌词长度 ${submittedLyrics.length} 字符`);

      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;

      setProgress(30);
      setProgressLabel(t.waitingResponse);
      setDebugInfo(`[DEBUG] 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t.unknownError }));
        setDebugInfo(`[DEBUG] 错误响应: ${JSON.stringify(errorData)}`);

        // 记录失败的 API 调用
        const errorLog: ApiCallRecord = {
          id: `api-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          apiName: 'GPT-4o',
          duration,
          status: 'error',
          error: errorData.message || errorData.error || t.processingFailed,
        };
        setApiLogs(prev => [errorLog, ...prev]);

        throw new Error(errorData.message || errorData.error || t.processingFailed);
      }

      setProgress(60);
      setProgressLabel(t.parsingResponse);

      const data: ProcessResult = await response.json();

      setDebugInfo(`[DEBUG] 成功获取结果，共 ${data.lines?.length || 0} 行`);
      setProgress(90);
      setProgressLabel(t.processingComplete);

      // 从响应头中提取 API 统计信息
      const apiLog: ApiCallRecord = {
        id: `api-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        apiName: response.headers.get('X-API-Name') || 'GPT-4o',
        duration: parseInt(response.headers.get('X-Processing-Duration') || duration.toString()),
        inputTokens: parseInt(response.headers.get('X-Input-Tokens') || '0'),
        outputTokens: parseInt(response.headers.get('X-Output-Tokens') || '0'),
        cost: parseFloat(response.headers.get('X-Cost') || '0'),
        prompt: response.headers.get('X-Prompt') ? decodeURIComponent(response.headers.get('X-Prompt')!) : undefined,
        status: 'success',
      };
      setApiLogs(prev => [apiLog, ...prev]);

      setResult(data);
      setProgress(100);
      setProgressLabel(t.complete);

      // 清除进度信息
      setTimeout(() => {
        setProgress(0);
        setProgressLabel('');
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.lyricsProcessingError;
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
    setProgressLabel(t.generatingAudio);

    const audioStartTime = Date.now();

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

      const audioDuration = Date.now() - audioStartTime;

      setProgress(50);
      setProgressLabel(t.processingAudio);
      setDebugInfo(`[DEBUG] 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t.unknownError }));
        setDebugInfo(`[DEBUG] 错误响应: ${JSON.stringify(errorData)}`);

        // 记录失败的 TTS API 调用
        const errorLog: ApiCallRecord = {
          id: `api-${Date.now()}-${Math.random()}`,
          timestamp: Date.now(),
          apiName: 'Google TTS',
          duration: audioDuration,
          status: 'error',
          error: errorData.message || errorData.error || t.audioGenerationFailed,
        };
        setApiLogs(prev => [errorLog, ...prev]);

        throw new Error(errorData.message || errorData.error || t.audioGenerationFailed);
      }

      // 记录成功的 TTS API 调用
      const cacheStatus = response.headers.get('X-Audio-Cache') || 'UNKNOWN';
      const ttsLog: ApiCallRecord = {
        id: `api-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        apiName: response.headers.get('X-API-Name') || 'Google TTS',
        duration: parseInt(response.headers.get('X-Processing-Duration') || audioDuration.toString()),
        cost: parseFloat(response.headers.get('X-Cost') || '0'),
        status: 'success',
        prompt: `Text: "${line.original}" (${cacheStatus})`,
      };
      setApiLogs(prev => [ttsLog, ...prev]);

      // 提取调试信息从响应头
      const originalIpa = decodeURIComponent(response.headers.get('X-Debug-Original-IPA') || '');
      const normalizedIpa = decodeURIComponent(response.headers.get('X-Debug-Normalized-IPA') || '');
      const ssml = decodeURIComponent(response.headers.get('X-Debug-SSML') || '');
      const voice = response.headers.get('X-Debug-Voice') || '';

      setDebugInfo(`[DEBUG] 发送给 Google TTS 的信息:
原始 IPA: ${originalIpa}
规范化 IPA: ${normalizedIpa}
生成的 SSML: ${ssml}
语音: ${voice}
速度: ${speed}
缓存: ${cacheStatus}`);

      setProgress(70);
      setProgressLabel(t.downloadingAudio);

      const tBlobStart = performance.now();
      const audioBlob = await response.blob();
      const blobMs = Math.round(performance.now() - tBlobStart);
      setDebugInfo((prev) => `${prev}\n[DEBUG] 收到音频二进制：${audioBlob.type || 'unknown'}, ${audioBlob.size} bytes（下载+转blob ${blobMs}ms）`);

      setProgress(85);
      setProgressLabel(t.preparingPlayback);

      const audioUrl = URL.createObjectURL(audioBlob);
      setCurrentAudioUrl(audioUrl);

      setProgress(95);
      setProgressLabel(t.playing);

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
        setError(t.audioPlaybackError);
      };

      // OPTIMIZATION: 使用浏览器端 playbackRate 调整速度，而不是每次速度变化都重新生成音频
      // 这大幅提升缓存效率 (从"voiceName|speed|ipa"变为"voiceName|ipa")
      audio.playbackRate = speed;

      const tPlayStart = performance.now();
      await audio.play();
      setDebugInfo((prev) => `${prev ?? ''} | [DEBUG] audio.play() 启动耗时 ${Math.round(performance.now() - tPlayStart)}ms (playbackRate=${speed})`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.audioGenerationFailed;
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
    setProgressLabel(t.preparingPlayAll);

    try {
      const totalLines = result.lines.length;
      setDebugInfo(`[DEBUG] 开始播放全篇，共 ${totalLines} 行`);

      // OPTIMIZATION: 并行预生成前 3 行音频，后续边播放边生成
      setProgress(5);
      setProgressLabel(t.prefetchingAudio);
      const PREFETCH_COUNT = Math.min(3, totalLines);

      const prefetchStartTime = Date.now();
      const prefetchPromises = result.lines.slice(0, PREFETCH_COUNT).map((line, idx) =>
        fetch('/api/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ipa_text: line.ipa_sung, original_text: line.original, speed }),
        }).then(async res => {
          if (!res.ok) throw new Error(t.linePrefetchFailed(idx + 1));
          const cacheStatus = res.headers.get('X-Audio-Cache') || 'UNKNOWN';
          const cost = parseFloat(res.headers.get('X-Cost') || '0');
          return { index: idx, blob: await res.blob(), url: '', cacheStatus, cost, text: line.original };
        })
      );

      const prefetchedAudios = await Promise.all(prefetchPromises);
      const prefetchDuration = Date.now() - prefetchStartTime;

      // 记录预生成的 TTS API 调用（批量）
      const prefetchLog: ApiCallRecord = {
        id: `api-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        apiName: 'Google TTS (Batch Prefetch)',
        duration: prefetchDuration,
        cost: prefetchedAudios.reduce((sum, a) => sum + a.cost, 0),
        status: 'success',
        prompt: `Prefetched ${PREFETCH_COUNT} lines`,
      };
      setApiLogs(prev => [prefetchLog, ...prev]);

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
        setProgressLabel(t.playingLine(i + 1, totalLines));

        let audioUrl: string;

        // 检查是否已预生成
        const prefetched = prefetchedAudios.find(a => a.index === i);
        if (prefetched) {
          audioUrl = prefetched.url;
          setDebugInfo(`[DEBUG] 使用预生成音频第 ${i + 1} 行 (${prefetched.blob.size} bytes)`);
        } else {
          // 需要即时生成
          setDebugInfo(`[DEBUG] 即时生成第 ${i + 1} 行音频: ${line.original.substring(0, 30)}...`);

          const lineStartTime = Date.now();
          const response = await fetch('/api/audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ipa_text: line.ipa_sung, original_text: line.original, speed }),
          });

          const lineDuration = Date.now() - lineStartTime;

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: t.unknownError }));

            // 记录失败的 TTS API 调用
            const errorLog: ApiCallRecord = {
              id: `api-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              apiName: 'Google TTS',
              duration: lineDuration,
              status: 'error',
              error: t.lineAudioFailed(i + 1, errorData.message || errorData.error || t.unknownError),
            };
            setApiLogs(prev => [errorLog, ...prev]);

            throw new Error(t.lineAudioFailed(i + 1, errorData.message || errorData.error || t.unknownError));
          }

          const cacheStatus = response.headers.get('X-Audio-Cache') || 'UNKNOWN';
          const cost = parseFloat(response.headers.get('X-Cost') || '0');

          // 记录成功的 TTS API 调用
          const ttsLog: ApiCallRecord = {
            id: `api-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            apiName: response.headers.get('X-API-Name') || 'Google TTS',
            duration: parseInt(response.headers.get('X-Processing-Duration') || lineDuration.toString()),
            cost: cost,
            status: 'success',
            prompt: `Line ${i + 1}: "${line.original.substring(0, 30)}..." (${cacheStatus})`,
          };
          setApiLogs(prev => [ttsLog, ...prev]);

          const audioBlob = await response.blob();
          audioUrl = URL.createObjectURL(audioBlob);
          setDebugInfo(`[DEBUG] 第 ${i + 1} 行音频生成成功，大小: ${audioBlob.size} bytes`);
        }

        setProgress(progressPercent + (40 / totalLines));
        setProgressLabel(t.playingLine(i + 1, totalLines));

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
            reject(new Error(t.linePlaybackError(i + 1)));
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
      setProgressLabel(t.playbackComplete);
      setDebugInfo(`[DEBUG] 全篇播放完成，共 ${totalLines} 行`);

      setTimeout(() => {
        setProgress(0);
        setProgressLabel('');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t.playbackFailed;
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
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center relative">
          <div className="absolute right-0 top-0 flex gap-2">
            <button
              onClick={() => setShowIpaReference(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              title={t.ipaReference}
            >
              <span>📖</span>
              <span className="hidden sm:inline">{t.ipaReference}</span>
            </button>
            <button
              onClick={() => setShowLyricsBookmarks(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              title={t.lyricsBookmarks}
            >
              <span>📄</span>
              <span className="hidden sm:inline">{t.lyricsBookmarks}</span>
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              title={t.myFavorites}
            >
              <span>⭐</span>
              <span className="hidden sm:inline">{t.myFavorites}</span>
            </button>
            <LanguageSwitcher />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t.subtitle}
          </p>
          {/* Collapsible Disclaimer */}
          <div className="mt-4 mx-auto max-w-4xl">
            <button
              onClick={() => setDisclaimerExpanded(!disclaimerExpanded)}
              className="w-full flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-2 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <span>⚠️</span>
              <span className="text-sm font-medium">{t.disclaimerTitle}</span>
              <span className={`transition-transform duration-200 ${disclaimerExpanded ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {disclaimerExpanded && (
              <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg px-4 py-3">
                <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                  {t.disclaimer}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How to use - Collapsible section */}
        <div className="mx-auto max-w-4xl">
          <button
            onClick={toggleHowToUse}
            className="w-full flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="text-sm font-medium">{t.howToUseTitle}</span>
            <span className={`transition-transform duration-200 ${howToUseExpanded ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {howToUseExpanded && (
            <div className="mt-2 bg-white dark:bg-gray-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md px-4 py-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>{t.howToUseStep1}</li>
                <li>{t.howToUseStep2}</li>
                <li>{t.howToUseStep3}</li>
                <li>{t.howToUseStep4}</li>
              </ol>
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                {t.howToUseHeaderTools}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {t.howToUseVideoSection}
              </p>
            </div>
          )}
        </div>

        {/* Main Content - Left/Right Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Lyrics Input & Analysis */}
          <div className="space-y-4">
            {/* Lyrics Input Card - Always Visible */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.lyricsInputTitle}
              </h2>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setShowSearch(true)}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors text-sm font-medium"
                >
                  🔍 {t.smartSearch}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const testLyrics = `Lydia sur tes roses joues
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
                    setLyrics(testLyrics);
                  }}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors text-sm font-medium"
                >
                  📋 {t.loadTestLyrics}
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-y text-sm"
                disabled={isLoading}
              />

              {/* Generate Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => lyrics.trim() && handleSubmit(lyrics.trim())}
                  disabled={!lyrics.trim() || isLoading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {isLoading ? t.processing : t.generateIPA}
                </button>
              </div>
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
                  label={progressLabel || (isLoading ? t.processing : '')}
                />
              </div>
            )}

            {/* Loading State (fallback) */}
            {isLoading && !result && progress === 0 && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{t.processing}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-4">
                {/* Control Bar - Speed + Bookmark + Play All */}
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <SpeedControl speed={speed} onSpeedChange={setSpeed} />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBookmarkDialog(true)}
                      disabled={isCurrentLyricsBookmarked}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors touch-manipulation flex items-center gap-1.5 ${
                        isCurrentLyricsBookmarked
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 cursor-default'
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                      title={isCurrentLyricsBookmarked ? t.alreadyBookmarked : t.bookmarkLyrics}
                    >
                      <span>{isCurrentLyricsBookmarked ? '⭐' : '☆'}</span>
                      <span className="hidden sm:inline">
                        {isCurrentLyricsBookmarked ? t.alreadyBookmarked : t.bookmarkLyrics}
                      </span>
                    </button>
                    <button
                      onClick={handlePlayAll}
                      disabled={isLoading}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors touch-manipulation"
                    >
                      {isLoading ? t.playingAll : t.playAll}
                    </button>
                  </div>
                </div>

                {/* Lyrics - Scrollable Container */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 max-h-[50vh] overflow-y-auto">
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

          {/* Right Column - YouTube Section */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <YouTubeSection
              onFavoriteChange={() => setFavoriteRefreshTrigger(prev => prev + 1)}
              selectedVideoId={youtubeVideoId}
              selectedVideoTitle={youtubeVideoTitle}
              onOpenSearch={() => setShowYoutubeSearch(true)}
            />
          </div>
        </div>
      </div>

      {/* API Logs Dialog */}
      {showApiLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.apiLogs}
              </h2>
              <button
                onClick={() => setShowApiLogs(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Dialog Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <ApiLogsTab
                logs={apiLogs}
                onClearLogs={() => setApiLogs([])}
              />
            </div>
          </div>
        </div>
      )}

      {/* Help / How to use Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t.howToUseTitle}
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>{t.howToUseStep1}</li>
                <li>{t.howToUseStep2}</li>
                <li>{t.howToUseStep3}</li>
                <li>{t.howToUseStep4}</li>
              </ol>
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                {t.howToUseHeaderTools}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {t.howToUseVideoSection}
              </p>
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-500 italic">
                {t.helpModalNote}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Input Dialog */}
      <LyricsInputDialog
        isOpen={showLyricsInput}
        onClose={() => setShowLyricsInput(false)}
        onSubmit={handleSubmit}
        onOpenSearch={() => {
          setShowLyricsInput(false);
          setShowSearch(true);
        }}
        isLoading={isLoading}
        initialLyrics={lyrics}
      />

      {/* Lyrics Search Dialog */}
      <LyricsSearchDialog
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onImportLyrics={(importedLyrics) => {
          setLyrics(importedLyrics);
          setShowSearch(false);
          setShowLyricsInput(true);
        }}
        onApiLog={(log) => setApiLogs(prev => [log, ...prev])}
      />

      {/* IPA Reference Table */}
      {showIpaReference && (
        <IpaReferenceTable onClose={() => setShowIpaReference(false)} />
      )}

      {/* YouTube Search Dialog */}
      <YouTubeSearchDialog
        isOpen={showYoutubeSearch}
        onClose={() => setShowYoutubeSearch(false)}
        onPlayVideo={(videoId, title) => {
          setYoutubeVideoId(videoId);
          setYoutubeVideoTitle(title);
          setShowYoutubeSearch(false);
        }}
        onApiLog={(log) => setApiLogs(prev => [log, ...prev])}
        onFavoriteChange={() => setFavoriteRefreshTrigger(prev => prev + 1)}
      />

      {/* Video Favorites Dialog */}
      {showFavorites && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>⭐</span>
                {t.myFavorites}
              </h2>
              <button
                onClick={() => setShowFavorites(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Dialog Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <VideoFavorites
                refreshTrigger={favoriteRefreshTrigger}
                onSelectVideo={(videoId, title) => {
                  setYoutubeVideoId(videoId);
                  setYoutubeVideoTitle(title);
                  setShowFavorites(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Bookmarks Sidebar */}
      <LyricsBookmarksSidebar
        isOpen={showLyricsBookmarks}
        onClose={() => setShowLyricsBookmarks(false)}
        onLoadBookmark={handleLoadBookmark}
        refreshTrigger={lyricsBookmarkRefresh}
      />

      {/* Bookmark Title Dialog */}
      <BookmarkTitleDialog
        isOpen={showBookmarkDialog}
        onClose={() => setShowBookmarkDialog(false)}
        onConfirm={handleAddBookmark}
        lyricsPreview={lyrics}
      />
    </main>
  );
}
