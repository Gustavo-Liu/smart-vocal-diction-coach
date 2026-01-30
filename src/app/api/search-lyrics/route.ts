import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

interface SearchResult {
  title: string;
  snippet: string;
  lyrics: string;  // 直接包含歌词
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('[API /search-lyrics] 搜索查询:', query);

    // 使用 OpenAI API Key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // 直接让 GPT 从知识库中返回歌词和相关歌曲
    const searchPrompt = `You are a French art song (mélodie française) expert with extensive knowledge of the classical vocal repertoire.

User is searching for: "${query}"

Based on this search query, provide 3-5 French art songs that match or are related to the query. For EACH song, include:
1. The complete French lyrics
2. Composer name and song title
3. Brief context about the song

Return your response in this EXACT JSON format:
{
  "results": [
    {
      "title": "Song Title - Composer Name",
      "snippet": "Brief description (poet, year, context)",
      "lyrics": "Complete French lyrics with proper line breaks"
    }
  ]
}

IMPORTANT:
- Include the COMPLETE lyrics in French for each song
- Preserve original line breaks and verse structure
- If the query matches a specific song, put it first
- Include related songs if available
- Do NOT include English translations
- Make sure lyrics are accurate and complete

Example format for lyrics field:
"lyrics": "Lydia sur tes roses joues\\nEt sur ton col frais et si blanc\\n..."`;

    console.log('[API /search-lyrics] 调用 GPT-4o 搜索歌词...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a French art song expert. Provide complete, accurate French lyrics from your knowledge base.' },
        { role: 'user', content: searchPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const responseContent = completion.choices[0]?.message?.content?.trim() || '{"results":[]}';
    console.log('[API /search-lyrics] GPT 响应长度:', responseContent.length);

    let results: SearchResult[] = [];
    try {
      const parsed = JSON.parse(responseContent);
      if (parsed.results && Array.isArray(parsed.results)) {
        results = parsed.results;
      } else if (Array.isArray(parsed)) {
        results = parsed;
      } else {
        console.error('[API /search-lyrics] 无法解析 GPT 响应格式');
        results = [];
      }
    } catch (e) {
      console.error('[API /search-lyrics] JSON 解析失败:', e);
      results = [];
    }

    console.log('[API /search-lyrics] 找到', results.length, '首歌曲');

    const duration = Date.now() - startTime;
    const usage = completion.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;

    // GPT-4o 定价
    const inputCost = (inputTokens / 1_000_000) * 2.50;
    const outputCost = (outputTokens / 1_000_000) * 10.00;
    const totalCost = inputCost + outputCost;

    // 构建响应头
    const headers: Record<string, string> = {
      'X-Processing-Duration': duration.toString(),
      'X-API-Name': 'GPT-4o (Search)',
      'X-Input-Tokens': inputTokens.toString(),
      'X-Output-Tokens': outputTokens.toString(),
      'X-Cost': totalCost.toFixed(6),
      'X-Prompt': encodeURIComponent(searchPrompt.substring(0, 500)),
    };

    return NextResponse.json({ results }, { headers });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API /search-lyrics] 错误:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: '搜索失败', message: errorMessage },
      {
        status: 500,
        headers: {
          'X-Processing-Duration': duration.toString(),
          'X-API-Name': 'GPT-4o (Search)',
        }
      }
    );
  }
}
