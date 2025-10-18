import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SpotifySearchResponse } from '@/lib/types';
import { getValidSpotifyAccessToken } from '@/lib/spotify-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = searchParams.get('limit') || '5';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await getValidSpotifyAccessToken(user.id);
    if (!accessToken) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 401 });
    }

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

    const data: SpotifySearchResponse = await searchResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Spotify search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
