import OpenAI from 'openai';
import { ProcessResult, LyricLine } from './types';
import { buildFrenchPrompt } from './prompts/french-diction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache (for MVP)
const lyricsCache = new Map<string, ProcessResult>();

/**
 * Process French lyrics and generate IPA JSON
 */
export async function processFrenchLyrics(
  lyrics: string,
  rStyle: 'uvular' | 'rolled' = 'uvular'
): Promise<ProcessResult> {
  // Check cache
  const cacheKey = `${lyrics.trim()}_${rStyle}`;
  if (lyricsCache.has(cacheKey)) {
    return lyricsCache.get(cacheKey)!;
  }

  const prompt = buildFrenchPrompt(lyrics, rStyle);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a French Lyric Diction expert. Always respond with valid JSON only, no markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent IPA output
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let parsed: ProcessResult;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error(`Failed to parse JSON: ${parseError}`);
      }
    }

    // Validate structure
    if (!parsed.lines || !Array.isArray(parsed.lines)) {
      throw new Error('Invalid response structure: missing lines array');
    }

    // Validate each line
    parsed.lines.forEach((line: LyricLine, index: number) => {
      if (!line.original || !line.ipa_sung || !line.ipa_spoken) {
        throw new Error(`Invalid line structure at index ${index}`);
      }
      if (!Array.isArray(line.notes)) {
        line.notes = [];
      }
    });

    // Cache result (limit cache size to prevent memory issues)
    if (lyricsCache.size > 50) {
      const firstKey = lyricsCache.keys().next().value;
      lyricsCache.delete(firstKey);
    }
    lyricsCache.set(cacheKey, parsed);

    return parsed;
  } catch (error) {
    console.error('Error processing French lyrics:', error);
    throw new Error(`Failed to process lyrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
