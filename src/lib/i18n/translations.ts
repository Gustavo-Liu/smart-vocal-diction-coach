export const translations = {
  zh: {
    // Header
    title: '智能声乐正音助手',
    subtitle: '法语艺术歌曲发音指导工具',

    // InputForm
    inputLabel: '输入法语歌词',
    loadTestLyrics: '加载测试歌词 (Lydia, Fauré)',
    inputPlaceholder: '粘贴或输入法语歌词...',
    rStyleLabel: 'R 音风格:',
    rStyleUvular: 'Uvular [ʁ] (现代 Mélodie)',
    rStyleRolled: 'Rolled [r] (歌剧/古典风格)',
    processing: '处理中...',
    generateIPA: '生成 IPA',

    // LyricsCard
    ipaSung: 'IPA (歌唱):',
    ipaSpoken: 'IPA (口语):',
    notes: '说明:',
    play: '🔊 播放',

    // SpeedControl
    playbackSpeed: '播放速度',
    slowest: '0.1x (最慢)',
    normal: '1.0x (正常)',

    // AudioPlayer
    pause: '⏸️ 暂停',
    playBtn: '▶️ 播放',
    stop: '⏹️ 停止',

    // ConfirmationModal
    confirmLyrics: '确认歌词',
    confirmDescription: '请检查并编辑歌词（如有需要），然后点击确认生成 IPA',
    editPlaceholder: '输入或编辑歌词...',
    cancel: '取消',
    confirmGenerate: '确认生成',

    // Progress labels
    preparingLyrics: '准备处理歌词...',
    sendingRequest: '发送请求到服务器...',
    waitingResponse: '等待服务器响应...',
    parsingResponse: '解析响应数据...',
    processingComplete: '完成处理...',
    complete: '完成！',
    generatingAudio: '生成音频...',
    processingAudio: '处理音频数据...',
    downloadingAudio: '下载音频...',
    preparingPlayback: '准备播放...',
    playing: '播放中...',
    preparingPlayAll: '准备播放全篇...',
    prefetchingAudio: '并行预生成音频...',
    playingLine: (current: number, total: number) => `播放第 ${current}/${total} 行...`,
    playbackComplete: '播放完成！',

    // Play All Button
    playingAll: '播放中...',
    playAll: '🎵 播放全篇',

    // Errors
    unknownError: '未知错误',
    processingFailed: '处理失败',
    lyricsProcessingError: '处理歌词时发生错误',
    audioGenerationFailed: '生成音频失败',
    audioPlaybackError: '播放音频时发生错误',
    linePrefetchFailed: (line: number) => `第 ${line} 行预生成失败`,
    lineAudioFailed: (line: number, msg: string) => `第 ${line} 行生成音频失败: ${msg}`,
    linePlaybackError: (line: number) => `第 ${line} 行播放音频时发生错误`,
    playbackFailed: '播放失败',
  },

  en: {
    // Header
    title: 'Smart Vocal Diction Coach',
    subtitle: 'French Art Song Pronunciation Guide',

    // InputForm
    inputLabel: 'Enter French Lyrics',
    loadTestLyrics: 'Load Test Lyrics (Lydia, Fauré)',
    inputPlaceholder: 'Paste or enter French lyrics...',
    rStyleLabel: 'R Sound Style:',
    rStyleUvular: 'Uvular [ʁ] (Modern Mélodie)',
    rStyleRolled: 'Rolled [r] (Opera/Classical)',
    processing: 'Processing...',
    generateIPA: 'Generate IPA',

    // LyricsCard
    ipaSung: 'IPA (Sung):',
    ipaSpoken: 'IPA (Spoken):',
    notes: 'Notes:',
    play: '🔊 Play',

    // SpeedControl
    playbackSpeed: 'Playback Speed',
    slowest: '0.1x (Slowest)',
    normal: '1.0x (Normal)',

    // AudioPlayer
    pause: '⏸️ Pause',
    playBtn: '▶️ Play',
    stop: '⏹️ Stop',

    // ConfirmationModal
    confirmLyrics: 'Confirm Lyrics',
    confirmDescription: 'Please review and edit the lyrics if needed, then click confirm to generate IPA',
    editPlaceholder: 'Enter or edit lyrics...',
    cancel: 'Cancel',
    confirmGenerate: 'Confirm',

    // Progress labels
    preparingLyrics: 'Preparing lyrics...',
    sendingRequest: 'Sending request...',
    waitingResponse: 'Waiting for response...',
    parsingResponse: 'Parsing response...',
    processingComplete: 'Processing complete...',
    complete: 'Done!',
    generatingAudio: 'Generating audio...',
    processingAudio: 'Processing audio...',
    downloadingAudio: 'Downloading audio...',
    preparingPlayback: 'Preparing playback...',
    playing: 'Playing...',
    preparingPlayAll: 'Preparing full playback...',
    prefetchingAudio: 'Prefetching audio...',
    playingLine: (current: number, total: number) => `Playing line ${current}/${total}...`,
    playbackComplete: 'Playback complete!',

    // Play All Button
    playingAll: 'Playing...',
    playAll: '🎵 Play All',

    // Errors
    unknownError: 'Unknown error',
    processingFailed: 'Processing failed',
    lyricsProcessingError: 'Error processing lyrics',
    audioGenerationFailed: 'Audio generation failed',
    audioPlaybackError: 'Error playing audio',
    linePrefetchFailed: (line: number) => `Failed to prefetch line ${line}`,
    lineAudioFailed: (line: number, msg: string) => `Line ${line} audio generation failed: ${msg}`,
    linePlaybackError: (line: number) => `Error playing line ${line}`,
    playbackFailed: 'Playback failed',
  },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.zh;
