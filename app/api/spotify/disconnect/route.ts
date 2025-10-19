import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateConnectedService } from '@/lib/spotify-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spotifyData = {
      access_token: null,
      refresh_token: null,
      expires_in: null,
      connected: false,
    };

    const updateSuccess = await updateConnectedService(user.id, 'spotify', spotifyData);
    if (!updateSuccess) {
      throw new Error('Failed to disconnect Spotify');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Spotify disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect Spotify' }, { status: 500 });
  }
}
