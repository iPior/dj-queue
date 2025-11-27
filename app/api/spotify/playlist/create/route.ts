import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidSpotifyAccessToken } from '@/lib/spotify-utils';

interface CreatePlaylistRequest {
  name: string;
  description?: string;
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

    const body: CreatePlaylistRequest = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    // Get the user's Spotify profile to get their Spotify user ID
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to get Spotify user profile');
    }

    const profile = await profileResponse.json();
    const spotifyUserId = profile.id;

    // Create the playlist
    const createPlaylistResponse = await fetch(
      `https://api.spotify.com/v1/users/${spotifyUserId}/playlists`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: body.name,
          description: body.description || `DJ Queue: ${body.name}`,
          public: false,
        }),
      }
    );

    if (!createPlaylistResponse.ok) {
      const errorText = await createPlaylistResponse.text();
      console.error('Spotify API error:', errorText);
      throw new Error('Failed to create Spotify playlist');
    }

    const playlistData = await createPlaylistResponse.json();
    return NextResponse.json({ 
      id: playlistData.id,
      name: playlistData.name,
    });
    
  } catch (error) {
    console.error('Spotify playlist creation error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create playlist' 
    }, { status: 500 });
  }
}
