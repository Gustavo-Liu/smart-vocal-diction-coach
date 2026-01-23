export interface LyricLine {
  original: string;
  ipa_sung: string;      // 带连读标记的 IPA
  ipa_spoken: string;    // 口语 IPA（对比用）
  notes: string[];       // 连读说明
}

export interface ProcessResult {
  lines: LyricLine[];
  metadata?: {
    composer?: string;
    title?: string;
  };
}

export type RStyle = 'uvular' | 'rolled';

export interface ProcessRequest {
  lyrics: string;
  r_style?: RStyle;
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
