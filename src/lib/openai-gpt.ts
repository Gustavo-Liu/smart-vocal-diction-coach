import OpenAI from 'openai';
import { ProcessResult, LyricLine } from './types';
import { buildFrenchPrompt } from './prompts/french-diction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-memory cache (for MVP)
const lyricsCache = new Map<string, ProcessResult>();

export interface ProcessResponse {
  result: ProcessResult;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cost: number;
  };
  prompt?: string;
}

/**
 * Process French lyrics and generate IPA JSON
 */
export async function processFrenchLyrics(
  lyrics: string,
  rStyle: 'uvular' | 'rolled' = 'uvular'
): Promise<ProcessResponse> {
  // Check cache
  const cacheKey = `${lyrics.trim()}_${rStyle}`;
  if (lyricsCache.has(cacheKey)) {
    return {
      result: lyricsCache.get(cacheKey)!,
      usage: undefined, // 缓存命中，无 API 调用
    };
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

    // 计算使用统计和成本
    const usage = response.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;

    // GPT-4o 定价 (2026年1月)
    // 输入: $2.50 / 1M tokens
    // 输出: $10.00 / 1M tokens
    const inputCost = (inputTokens / 1_000_000) * 2.50;
    const outputCost = (outputTokens / 1_000_000) * 10.00;
    const totalCost = inputCost + outputCost;

    // Cache result (limit cache size to prevent memory issues)
    if (lyricsCache.size > 50) {
      const firstKey = lyricsCache.keys().next().value;
      lyricsCache.delete(firstKey);
    }
    lyricsCache.set(cacheKey, parsed);

    return {
      result: parsed,
      usage: {
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        cost: totalCost,
      },
      prompt,
    };
  } catch (error) {
    console.error('Error processing French lyrics:', error);
    throw new Error(`Failed to process lyrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
