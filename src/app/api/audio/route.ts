import { NextRequest, NextResponse } from 'next/server';
import { generateAudio } from '@/lib/openai-tts';
import { AudioRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AudioRequest = await request.json();
    const { ipa_text, speed = 0.3 } = body;

    if (!ipa_text || typeof ipa_text !== 'string' || ipa_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'IPA text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const audioBuffer = await generateAudio(ipa_text, speed);

    // Return audio as base64
    const base64Audio = audioBuffer.toString('base64');

    return NextResponse.json({
      audio: base64Audio,
      format: 'mp3',
    });
  } catch (error) {
    console.error('Error in /api/audio:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate audio',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
