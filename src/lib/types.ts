export interface LyricLine {
  original: string;
  ipa_sung: string;      // 带连读标记的 IPA
}

export interface ProcessResult {
  lines: LyricLine[];
  metadata?: {
    composer?: string;
    title?: string;
  };
}

export interface ProcessRequest {
  lyrics: string;
}

export interface AudioRequest {
  ipa_text: string;      // 用于显示和缓存键
  original_text: string; // 原始法语文本，用于 Google TTS
  speed?: number;
}

export interface ApiCallRecord {
  id: string;
  timestamp: number;
  apiName: string;           // API 名称 (如 "GPT-4o", "Google TTS")
  duration: number;          // 处理时间（毫秒）
  prompt?: string;           // 发送的 prompt
  inputTokens?: number;      // 输入 token 数
  outputTokens?: number;     // 输出 token 数
  cost?: number;             // 花费（美元）
  status: 'success' | 'error';
  error?: string;
}

// Phoneme mapping for local audio files
export interface PhonemeMapping {
  ipa: string;           // IPA符号
  label: string;         // 显示标签
  audioFile: string;     // 音频文件名
  startTime?: number;    // 源视频起始时间（参考）
  endTime?: number;      // 源视频结束时间（参考）
}

// Video favorites for YouTube integration
export interface VideoFavorite {
  id: string;
  videoId: string;       // YouTube video ID
  title: string;
  thumbnailUrl?: string;
  addedAt: number;
  notes?: string;
}

// YouTube search result
export interface YouTubeVideoResult {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
}
