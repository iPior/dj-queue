import { NextRequest, NextResponse } from 'next/server';
import { SpotifySearchResponse } from '@/lib/types';
import { getAppSpotifyAccessToken } from '@/lib/spotify-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '5';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Get app-level Spotify access token using Client Credentials flow
    const accessToken = await getAppSpotifyAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'Spotify service unavailable' }, { status: 503 });
    }

    // Search Spotify using app token
    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Spotify API request failed');
    }

    const searchData: SpotifySearchResponse = await searchResponse.json();
    return NextResponse.json(searchData);
  } catch (error) {
    console.error('Spotify queue search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

