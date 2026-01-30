import { NextRequest, NextResponse } from 'next/server';
import { processFrenchLyrics } from '@/lib/openai-gpt';
import { ProcessRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    console.log('[API /process] 收到请求');
    const body: ProcessRequest = await request.json();
    const { lyrics } = body;

    console.log(`[API /process] 参数: lyrics长度=${lyrics?.length || 0}`);

    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim().length === 0) {
      console.error('[API /process] 验证失败: 歌词为空或无效');
      return NextResponse.json(
        { error: 'Lyrics are required and must be a non-empty string' },
        { status: 400 }
      );
    }

    console.log('[API /process] 开始处理歌词 (古典演唱风格, 卷舌R)...');
    const response = await processFrenchLyrics(lyrics);

    const duration = Date.now() - startTime;
    console.log(`[API /process] 处理成功: 共 ${response.result.lines?.length || 0} 行，耗时 ${duration}ms`);

    // 构建响应，在响应头中包含统计信息
    const headers: Record<string, string> = {
      'X-Processing-Duration': duration.toString(),
      'X-API-Name': 'GPT-4o',
    };

    if (response.usage) {
      headers['X-Input-Tokens'] = response.usage.inputTokens.toString();
      headers['X-Output-Tokens'] = response.usage.outputTokens.toString();
      headers['X-Total-Tokens'] = response.usage.totalTokens.toString();
      headers['X-Cost'] = response.usage.cost.toFixed(6);
    }

    if (response.prompt) {
      headers['X-Prompt'] = encodeURIComponent(response.prompt.substring(0, 500)); // 限制长度
    }

    return NextResponse.json(response.result, { headers });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API /process] 错误 (耗时 ${duration}ms):`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API /process] 错误详情:`, {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      {
        error: 'Failed to process lyrics',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
