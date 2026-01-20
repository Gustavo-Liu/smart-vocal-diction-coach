import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate audio from IPA text using OpenAI TTS
 */
export async function generateAudio(
  ipaText: string,
  speed: number = 0.8
): Promise<Buffer> {
  if (speed < 0.1 || speed > 1.0) {
    throw new Error('Speed must be between 0.1 and 1.0');
  }

  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'alloy',
      input: ipaText,
      speed: speed,
    });

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('Error generating audio:', error);
    throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
