import { NextRequest, NextResponse } from 'next/server';
import { processFrenchLyrics } from '@/lib/openai-gpt';
import { ProcessRequest, RStyle } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: ProcessRequest = await request.json();
    const { lyrics, r_style = 'uvular' } = body;

    if (!lyrics || typeof lyrics !== 'string' || lyrics.trim().length === 0) {
      return NextResponse.json(
        { error: 'Lyrics are required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const result = await processFrenchLyrics(lyrics, r_style as RStyle);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/process:', error);
    return NextResponse.json(
      {
        error: 'Failed to process lyrics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
