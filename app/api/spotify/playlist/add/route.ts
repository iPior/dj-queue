import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidSpotifyAccessToken } from '@/lib/spotify-utils';

interface AddTrackRequest {
  playlistId: string;
  trackUri: string;
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

    const body: AddTrackRequest = await request.json();
    if (!body.playlistId || !body.trackUri) {
      return NextResponse.json({ 
        error: 'Playlist ID and Track URI are required' 
      }, { status: 400 });
    }

    // Add track to playlist
    const addTrackResponse = await fetch(
      `https://api.spotify.com/v1/playlists/${body.playlistId}/tracks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [body.trackUri],
        }),
      }
    );

    if (!addTrackResponse.ok) {
      const errorText = await addTrackResponse.text();
      console.error('Spotify API error:', errorText);
      throw new Error('Failed to add track to Spotify playlist');
    }

    const result = await addTrackResponse.json();
    return NextResponse.json({ 
      success: true,
      snapshot_id: result.snapshot_id,
    });
    
  } catch (error) {
    console.error('Spotify add track error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to add track to playlist' 
    }, { status: 500 });
  }
}

