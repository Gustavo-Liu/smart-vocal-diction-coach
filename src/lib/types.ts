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
