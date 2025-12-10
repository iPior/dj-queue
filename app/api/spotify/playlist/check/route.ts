import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidSpotifyAccessToken } from '@/lib/spotify-utils';

interface CheckPlaylistRequest {
  playlistId: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = await getValidSpotifyAccessToken(user.id);
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Spotify not connected' }, { status: 401 });
    }

    const body: CheckPlaylistRequest = await request.json();
    if (!body.playlistId) {
      return NextResponse.json({ 
        error: 'Playlist ID is required' 
      }, { status: 400 });
    }

    // Check if playlist exists by fetching it
    const playlistResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${body.playlistId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (playlistResponse.status === 404) {
      return NextResponse.json({ 
        exists: false,
        message: 'Playlist not found' 
      });
    }

    if (!playlistResponse.ok) {
      const errorText = await playlistResponse.text();
      console.error('Spotify API error:', errorText);
      return NextResponse.json({ 
        exists: false,
        message: 'Failed to check playlist' 
      }, { status: playlistResponse.status });
    }

    const playlistData = await playlistResponse.json();
    
    // Verify the playlist belongs to the user by checking if they can access it
    // The API will return 403 if the user doesn't have access
    return NextResponse.json({ 
      exists: true,
      playlist: {
        id: playlistData.id,
        name: playlistData.name,
      }
    });
    
  } catch (error) {
    console.error('Spotify playlist check error:', error);
    return NextResponse.json({ 
      exists: false,
      error: error instanceof Error ? error.message : 'Failed to check playlist' 
    }, { status: 500 });
  }
}

