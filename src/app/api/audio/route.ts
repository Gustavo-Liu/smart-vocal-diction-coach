import { NextRequest, NextResponse } from 'next/server';
import { AudioRequest } from '@/lib/types';

export const runtime = 'nodejs';

// 简单内存缓存：同一句重复点播放时基本秒回
const audioCache = new Map<string, Buffer>();
const MAX_CACHE_ENTRIES = 200;

// 将 IPA 规范化：移除标记符号，保留音素
function normalizeIpaForTts(ipa: string): string {
  let result = ipa
    .replaceAll('‿', ' ')           // 移除连读标记
    .replace(/\(([^)]+)\)/g, '$1')  // 去括号 (ə) → ə
    .replaceAll('-', ' ');          // 音节分隔符变空格

  // 清理多余空格
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

// 使用 SSML phoneme 标签，直接用 IPA 控制发音
async function synthesizeMp3FromIpa(
  originalText: string,
  ipaSung: string,
  voiceName: string,
  apiKey: string
): Promise<Buffer> {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

  // 规范化 IPA
  const normalizedIpa = normalizeIpaForTts(ipaSung);

  // 使用 SSML phoneme 标签，ph 属性指定 IPA 发音
  // alphabet="ipa" 告诉 Google 使用 IPA 音标
  const ssml = `<speak><phoneme alphabet="ipa" ph="${normalizedIpa}">${originalText}</phoneme></speak>`;

  console.log('[Google TTS] 原文:', originalText);
  console.log('[Google TTS] IPA:', ipaSung);
  console.log('[Google TTS] 规范化 IPA:', normalizedIpa);
  console.log('[Google TTS] SSML:', ssml);

  const requestBody = {
    input: { ssml: ssml },
    voice: {
      languageCode: 'fr-FR',
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'MP3' as const,
      speakingRate: 1.0,
    },
  };

  console.log('[Google TTS] 请求体:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  return Buffer.from(data.audioContent, 'base64');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('[API /audio] 收到请求');
    const body: AudioRequest = await request.json();
    const { ipa_text, original_text, speed = 0.8 } = body;

    console.log(`[API /audio] 参数: speed=${speed}, original_text="${original_text}", ipa_text="${ipa_text}"`);

    if (!original_text || typeof original_text !== 'string' || original_text.trim().length === 0) {
      console.error('[API /audio] 验证失败: 原文为空或无效');
      return NextResponse.json(
        { error: 'Original text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const voiceName = process.env.GOOGLE_TTS_VOICE_NAME || 'fr-FR-Neural2-A';
    // OPTIMIZATION: 不再将 speed 包含在缓存键中，因为客户端使用 playbackRate 调整速度
    // 使用原文作为缓存键，因为我们用原文生成语音
    const cacheKey = `${voiceName}|${original_text.trim()}`;

    // 调试信息
    console.log('[API /audio] ========== 发送给 Google TTS 的信息 ==========');
    console.log('[API /audio] 原始法语文本:', original_text);
    console.log('[API /audio] IPA (仅供参考):', ipa_text);
    console.log('[API /audio] 语音:', voiceName);
    console.log('[API /audio] ====================================================');

    const cached = audioCache.get(cacheKey);
    if (cached) {
      const duration = Date.now() - startTime;
      console.log(`[API /audio] 缓存命中，返回音频：${cached.length} 字节，耗时 ${duration}ms`);

      return new NextResponse(new Uint8Array(cached), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-store',
          'X-Audio-Cache': 'HIT',
          'X-Debug-Original-Text': encodeURIComponent(original_text),
          'X-Debug-IPA': encodeURIComponent(ipa_text),
          'X-Debug-Voice': voiceName,
        },
      });
    }

    console.log('[API /audio] 开始用 Google TTS 生成音频（直接用法语文本）...');

    const ttsStart = Date.now();
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }

    const audioBuffer = await synthesizeMp3FromIpa(original_text.trim(), ipa_text, voiceName, apiKey);
    const ttsDuration = Date.now() - ttsStart;
    console.log(`[API /audio] Google TTS 完成：${audioBuffer.length} 字节，TTS耗时 ${ttsDuration}ms`);

    // 缓存（简单淘汰）
    if (audioCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = audioCache.keys().next().value;
      if (firstKey) audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, audioBuffer);

    const duration = Date.now() - startTime;
    console.log(`[API /audio] 处理完成，耗时 ${duration}ms（含TTS）`);

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
        'X-Audio-Cache': 'MISS',
        'X-Debug-Original-Text': encodeURIComponent(original_text),
        'X-Debug-IPA': encodeURIComponent(ipa_text),
        'X-Debug-Voice': voiceName,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API /audio] 错误 (耗时 ${duration}ms):`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API /audio] 错误详情:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: 'Failed to generate audio',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
