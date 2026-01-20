import { NextRequest, NextResponse } from 'next/server';
import { processFrenchLyrics } from '@/lib/openai-gpt';
import { ProcessRequest, RStyle } from '@/lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('[API /process] 收到请求');
    const body: ProcessRequest = await request.json();
    const { lyrics, r_style = 'uvular' } = body;

    console.log(`[API /process] 参数: r_style=${r_style}, lyrics长度=${lyrics?.length || 0}`);

    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim().length === 0) {
      console.error('[API /process] 验证失败: 歌词为空或无效');
      return NextResponse.json(
        { error: 'Lyrics are required and must be a non-empty string' },
        { status: 400 }
      );
    }

    console.log('[API /process] 开始处理歌词...');
    const result = await processFrenchLyrics(lyrics, r_style as RStyle);
    
    const duration = Date.now() - startTime;
    console.log(`[API /process] 处理成功: 共 ${result.lines?.length || 0} 行，耗时 ${duration}ms`);

    return NextResponse.json(result);
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
