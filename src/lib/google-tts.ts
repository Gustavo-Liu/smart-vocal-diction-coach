export type GoogleTtsSynthesizeOptions = {
  ipaText: string;
  /**
   * 前端速度滑块：0.1 - 1.0（0.8 为默认）。
   * 我们会把它映射到 Google 的 speakingRate（0.25 - 4.0）。
   */
  speed?: number;
  languageCode?: string; // default: fr-FR
  voiceName?: string; // optional, e.g. fr-FR-Neural2-A
  apiKey?: string; // Google API Key
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function escapeXmlAttr(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function escapeXmlText(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * 将我们项目里用于"展示/标注"的 IPA 规范化成更适合 TTS phoneme 的形式。
 * 关键点：
 * - 去掉连读标记 `‿`
 * - 把可选音 `(ə)` 变为 `ə`（去括号）
 * - 把音节连字符 `-` 变为空格（避免被当作符号/断词）
 * - Google TTS 兼容性转换：将不支持的音素转换为支持的音素
 *   - [œ̃] → [ɛ̃] (Google TTS 不支持 [œ̃]，转换为 [ɛ̃])
 *   - [r] → [ʁ] (Google TTS 只支持 [ʁ]，不支持 rolled [r])
 *   - [ɑ] → [a] (Google TTS 只支持 [a]，不支持后 [ɑ])
 *   - [ɲ] → [nj] (Google TTS 不支持 palatal nasal)
 * - 压缩多余空白
 */
export function normalizeIpaForTts(raw: string): string {
  const s = (raw ?? '').trim();
  if (!s) return '';

  return (
    s
      // Google TTS 兼容性转换 - 按优先级顺序处理
      // 1. 鼻元音：[œ̃] → [ɛ̃] (必须先处理，避免后续 œ 转换影响)
      .replaceAll('œ̃', 'ɛ̃')
      // 注：[œ] 在 Google 支持列表中，所以不需要转换
      // 2. R 辅音：[r] → [ʁ] (rolled R 转为 uvular R)
      .replaceAll('r', 'ʁ')
      // 3. 后元音 A：[ɑ] → [a] (Google 只支持 [a])
      .replaceAll('ɑ', 'a')
      // 4. 颚化鼻音：[ɲ] → [nj]
      .replaceAll('ɲ', 'nj')
      // liaison marker
      .replaceAll('‿', ' ')
      // optional phones like (ə) -> ə
      .replace(/\(([^)]+)\)/g, '$1')
      // syllable separators like li-dja -> li dja
      .replaceAll('-', ' ')
      // collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Google TTS 的 phoneme tag 用于发音控制：
 * <phoneme alphabet="ipa" ph="...">text</phoneme>
 *
 * 策略：
 * 1. 将整个 IPA 序列作为一个 phoneme（更可靠，避免分段问题）
 * 2. 移除空格 - Google TTS 的 IPA 解析器不需要空格分隔符
 * 3. 内容文本应该是一个简单的占位符，发音完全由 ph 属性控制
 */
export function buildSsmlFromIpaTokens(normalizedIpa: string): string {
  // 移除所有空格 - Google TTS IPA 不需要空格分隔
  // 每个 IPA 符号应该直接连接
  const ipaNoSpaces = normalizedIpa.replace(/\s+/g, '');
  const ph = escapeXmlAttr(ipaNoSpaces);

  // 使用一个简单的占位文本
  // Google TTS 应该完全按照 ph 属性发音，忽略内容文本
  return `<speak><phoneme alphabet="ipa" ph="${ph}">.</phoneme></speak>`;
}

export function mapUiSpeedToGoogleSpeakingRate(uiSpeed: number): number {
  // 约定：UI 默认 0.8 对应 Google 默认 1.0
  const safe = clamp(Number(uiSpeed) || 0.8, 0.1, 1.0);
  return clamp(safe / 0.8, 0.25, 4.0);
}

export async function synthesizeMp3FromIpa(options: GoogleTtsSynthesizeOptions): Promise<Buffer> {
  const languageCode = options.languageCode ?? 'fr-FR';
  const voiceName = options.voiceName ?? 'fr-FR-Neural2-A'; // 默认法语语音
  const apiKey = options.apiKey || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('Google API Key is required. Set GOOGLE_API_KEY environment variable or pass apiKey option.');
  }

  // 记录原始 IPA
  console.log('[Google TTS] 原始 IPA 文本:', options.ipaText);

  const normalizedIpa = normalizeIpaForTts(options.ipaText);
  if (!normalizedIpa) {
    throw new Error('IPA text is empty after normalization');
  }

  // 记录规范化后的 IPA
  console.log('[Google TTS] 规范化后的 IPA:', normalizedIpa);

  const speakingRate = mapUiSpeedToGoogleSpeakingRate(options.speed ?? 0.8);

  // CRITICAL FIX: Google TTS phoneme标签只能用于单个词，不能用于整句
  // 我们改用 SSML <prosody> 标签来控制语速，让 Google 按 IPA 文本自然发音
  // 由于我们的 IPA 已经规范化为 Google 支持的音素，直接作为文本输入即可
  const ssml = `<speak><prosody rate="${speakingRate}">${escapeXmlText(normalizedIpa)}</prosody></speak>`;

  // 记录生成的 SSML
  console.log('[Google TTS] 生成的 SSML:', ssml);
  console.log('[Google TTS] SSML 长度:', ssml.length);
  console.log('[Google TTS] SSML 字符详情:', JSON.stringify(ssml));

  // 使用 REST API 和 API Key
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  const requestBody = {
    input: { ssml },
    voice: {
      languageCode,
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate: 1.0, // 使用 SSML prosody 控制速度
    },
  };
  
  // 记录完整请求体（隐藏 API Key）
  console.log('[Google TTS] ========== 发送给 Google 的完整请求 ==========');
  console.log('[Google TTS] 完整请求体:', JSON.stringify(requestBody, null, 2));
  console.log('[Google TTS] API URL:', `https://texttospeech.googleapis.com/v1/text:synthesize?key=***`);
  console.log('[Google TTS] 规范化 IPA (保留空格):', normalizedIpa);
  console.log('[Google TTS] 规范化 IPA (无空格):', normalizedIpa.replace(/\s+/g, ''));
  console.log('[Google TTS] ==============================================');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(`Google TTS API error: ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.audioContent) {
    throw new Error('No audioContent returned from Google TTS');
  }

  // audioContent 是 base64 编码的字符串，需要解码
  return Buffer.from(data.audioContent, 'base64');
}


