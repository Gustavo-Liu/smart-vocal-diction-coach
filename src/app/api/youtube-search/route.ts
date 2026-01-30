import { NextRequest, NextResponse } from 'next/server';
import { YouTubeVideoResult } from '@/lib/types';

export const runtime = 'nodejs';

interface YouTubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      medium?: {
        url: string;
      };
      default?: {
        url: string;
      };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  nextPageToken?: string;
  pageInfo?: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const pageToken = searchParams.get('pageToken');

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log('[API /youtube-search] 搜索查询:', query, 'pageToken:', pageToken);

    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    // Build YouTube Data API v3 search URL
    const youtubeApiUrl = new URL('https://www.googleapis.com/youtube/v3/search');
    youtubeApiUrl.searchParams.set('part', 'snippet');
    youtubeApiUrl.searchParams.set('q', query);
    youtubeApiUrl.searchParams.set('type', 'video');
    youtubeApiUrl.searchParams.set('maxResults', '10');
    youtubeApiUrl.searchParams.set('key', googleApiKey);

    if (pageToken) {
      youtubeApiUrl.searchParams.set('pageToken', pageToken);
    }

    console.log('[API /youtube-search] 调用 YouTube Data API...');

    const response = await fetch(youtubeApiUrl.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      console.error('[API /youtube-search] YouTube API 错误:', errorData);
      throw new Error(errorData.error?.message || `YouTube API error: ${response.status}`);
    }

    const data: YouTubeSearchResponse = await response.json();

    console.log('[API /youtube-search] 找到', data.items?.length || 0, '个视频');

    // Transform to our format
    const results: YouTubeVideoResult[] = (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url || '',
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    const duration = Date.now() - startTime;

    // Build response headers
    const headers: Record<string, string> = {
      'X-Processing-Duration': duration.toString(),
      'X-API-Name': 'YouTube Data API',
      'X-Results-Count': results.length.toString(),
    };

    return NextResponse.json(
      {
        results,
        nextPageToken: data.nextPageToken || null,
        totalResults: data.pageInfo?.totalResults || 0,
      },
      { headers }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API /youtube-search] 错误:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      { error: '搜索失败', message: errorMessage },
      {
        status: 500,
        headers: {
          'X-Processing-Duration': duration.toString(),
          'X-API-Name': 'YouTube Data API',
        }
      }
    );
  }
}
