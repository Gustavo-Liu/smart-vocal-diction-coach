export const translations = {
  zh: {
    // Header
    title: '智能声乐正音助手',
    subtitle: '法语艺术歌曲发音指导工具',
    disclaimer: '注意：Google TTS 使用现代法语发音，无法发出古典弹舌 R [r]（会用小舌音 [ʁ] 代替），部分词尾辅音也可能被省略。IPA 标注为准确的古典演唱发音，音频仅供参考，请以声乐教师示范为准。',
    disclaimerTitle: '注意事项',

    // InputForm
    inputLabel: '输入法语歌词',
    loadTestLyrics: '加载测试歌词 (Lydia, Fauré)',
    inputPlaceholder: '粘贴或输入法语歌词...',
    processing: '处理中...',
    generateIPA: '生成 IPA',

    // LyricsCard
    ipaSung: 'IPA:',
    play: '播放',

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

    // Smart Search
    smartSearch: '智能搜索',
    smartSearchTitle: '智能歌词搜索',
    searchPlaceholder: '输入曲目名称，例如：Fauré Après un rêve',
    searching: '搜索中...',
    search: '搜索',
    searchResults: '搜索结果：',
    noResultsFound: '未找到相关歌词，请尝试更具体的搜索词',
    pleaseEnterQuery: '请输入曲目名称',
    searchFailed: '搜索失败',
    backToResults: '返回搜索结果',
    importLyrics: '导入歌词',

    // API Logs
    apiLogs: 'API 日志',

    // IPA Reference
    ipaReference: 'IPA 音标表',
    ipaReferenceTitle: '法语 IPA 音标参考表',
    ipaReferenceSubtitle: '点击音标卡片播放对应发音',
    ipaReferenceNote: '注意：音频使用 Google TTS 生成，为现代法语发音。古典唱法中的弹舌 R [r] 会以小舌音 [ʁ] 播放。',

    // YouTube Section
    youtubeSection: 'YouTube 视频',
    youtubeUrlPlaceholder: '输入 YouTube 视频链接...',
    loadVideo: '加载',
    invalidYouTubeUrl: '无效的 YouTube 链接',
    videoTitlePlaceholder: '视频标题（用于收藏）',
    addFavorite: '收藏',
    removeFavorite: '取消收藏',
    youtubeEmptyState: '输入 YouTube 链接来播放视频',

    // Video Favorites
    videoFavorites: '视频收藏',
    noFavorites: '暂无收藏视频',
    addedOn: '添加于',

    // YouTube Search
    youtubeSearch: 'YouTube 搜索',
    youtubeSearchTitle: '搜索 YouTube 视频',
    youtubeSearchPlaceholder: '搜索法语艺术歌曲...',
    youtubeNoResults: '未找到相关视频',
    youtubeSearchFailed: '搜索失败',
    loadMore: '加载更多',

    // Layout
    lyricsSection: '歌词分析',
    editLyrics: '输入歌词',
    lyricsInputTitle: '输入法语歌词',

    // Video Favorites Button
    myFavorites: '我的收藏',

    // Onboarding / How to use
    howToUseTitle: '如何使用',
    howToUseStep1: '在左侧粘贴法语歌词，或使用「智能搜索」查找曲目、用「加载测试歌词」填入示例。',
    howToUseStep2: '点击「生成 IPA」，系统会为每行生成古典演唱风格的音标。',
    howToUseStep3: '生成后可调节语速，点击每行旁的播放键听单行，或点击「播放全篇」连续播放。',
    howToUseStep4: '右侧可输入 YouTube 链接观看范读或伴奏，搜索后可将喜欢的视频加入收藏。',
    howToUseHeaderTools: '顶部：IPA 音标表可查发音，API 日志查看调用记录，我的收藏可打开已保存视频。',
    howToUseVideoSection: '右侧：粘贴或搜索 YouTube 链接，播放参考视频并可收藏。',
    helpButtonLabel: '使用说明',
    helpModalNote: '您也可以随时折叠本页上的「如何使用」区块。',
  },

  en: {
    // Header
    title: 'Smart Vocal Diction Coach',
    subtitle: 'French Art Song Pronunciation Guide',
    disclaimer: 'Note: Google TTS uses modern French pronunciation - it cannot produce the classical rolled R [r] (uses uvular [ʁ] instead), and some word-final consonants may be omitted. The IPA notation shows correct classical singing pronunciation; audio is for reference only. Please follow your voice teacher\'s guidance.',
    disclaimerTitle: 'Important Notes',

    // InputForm
    inputLabel: 'Enter French Lyrics',
    loadTestLyrics: 'Load Test Lyrics (Lydia, Fauré)',
    inputPlaceholder: 'Paste or enter French lyrics...',
    processing: 'Processing...',
    generateIPA: 'Generate IPA',

    // LyricsCard
    ipaSung: 'IPA:',
    play: 'Play',

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

    // Smart Search
    smartSearch: 'Smart Search',
    smartSearchTitle: 'Smart Lyrics Search',
    searchPlaceholder: 'Enter song title, e.g.: Fauré Après un rêve',
    searching: 'Searching...',
    search: 'Search',
    searchResults: 'Search Results:',
    noResultsFound: 'No lyrics found, please try a more specific search term',
    pleaseEnterQuery: 'Please enter a song title',
    searchFailed: 'Search failed',
    backToResults: 'Back to results',
    importLyrics: 'Import Lyrics',

    // API Logs
    apiLogs: 'API Logs',

    // IPA Reference
    ipaReference: 'IPA Chart',
    ipaReferenceTitle: 'French IPA Reference Chart',
    ipaReferenceSubtitle: 'Click on a symbol to hear its pronunciation',
    ipaReferenceNote: 'Note: Audio is generated by Google TTS using modern French pronunciation. The classical rolled R [r] will be played as uvular [ʁ].',

    // YouTube Section
    youtubeSection: 'YouTube Video',
    youtubeUrlPlaceholder: 'Enter YouTube video URL...',
    loadVideo: 'Load',
    invalidYouTubeUrl: 'Invalid YouTube URL',
    videoTitlePlaceholder: 'Video title (for favorites)',
    addFavorite: 'Favorite',
    removeFavorite: 'Unfavorite',
    youtubeEmptyState: 'Enter a YouTube URL to play a video',

    // Video Favorites
    videoFavorites: 'Favorites',
    noFavorites: 'No favorite videos yet',
    addedOn: 'Added on',

    // YouTube Search
    youtubeSearch: 'YouTube Search',
    youtubeSearchTitle: 'Search YouTube Videos',
    youtubeSearchPlaceholder: 'Search French art songs...',
    youtubeNoResults: 'No videos found',
    youtubeSearchFailed: 'Search failed',
    loadMore: 'Load More',

    // Layout
    lyricsSection: 'Lyrics Analysis',
    editLyrics: 'Input Lyrics',
    lyricsInputTitle: 'Enter French Lyrics',

    // Video Favorites Button
    myFavorites: 'Favorites',

    // Onboarding / How to use
    howToUseTitle: 'How to use',
    howToUseStep1: 'Paste French lyrics on the left, or use Smart Search to find a song, or Load Test Lyrics for a sample.',
    howToUseStep2: 'Click « Generate IPA » to get classical singing-style IPA for each line.',
    howToUseStep3: 'Adjust speed, then play a single line or click « Play All » for continuous playback.',
    howToUseStep4: 'On the right, paste or search a YouTube link for reference performances; you can save favorites.',
    howToUseHeaderTools: 'Top: IPA Chart for pronunciation reference, API Logs for call history, Favorites for saved videos.',
    howToUseVideoSection: 'Right: Paste or search YouTube to play reference videos and save favorites.',
    helpButtonLabel: 'Help',
    helpModalNote: 'You can also collapse the « How to use » section on this page anytime.',
  },
};

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations.zh;
export type Translations = typeof translations.zh;
