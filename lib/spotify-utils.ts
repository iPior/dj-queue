import { createClient } from '@/lib/supabase/server';
import { SpotifyTokens } from '@/lib/types';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokens | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Spotify client credentials not configured');
    return null;
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to refresh Spotify token:', tokenResponse.status, tokenResponse.statusText);
      return null;
    }

    const tokens: SpotifyTokens = await tokenResponse.json();
    return tokens;
  } catch (error) {
    console.error('Error refreshing Spotify token:', error);
    return null;
  }
}

async function updateSpotifyTokens(userId: string, tokens: SpotifyTokens): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    
    const { error } = await supabase
      .from('profiles')
      .update({
        connected_services: {
          spotify: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
            connected: true,
          }
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Failed to update Spotify tokens:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating Spotify tokens:', error);
    return false;
  }
}

export async function getValidSpotifyAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('connected_services')
    .eq('id', userId)
    .single();
  const spotifyToken = profile?.connected_services?.spotify;

  if (!spotifyToken) return null;

  if (spotifyToken.expires_in && Date.now() >= spotifyToken.expires_in) {
    if (!spotifyToken.refresh_token) return null;

    const newTokens = await refreshSpotifyToken(spotifyToken.refresh_token);
    if (!newTokens) return null;

    const updateSuccess = await updateSpotifyTokens(userId, newTokens);
    if (!updateSuccess) return null;

    return newTokens.access_token;
  }

  return spotifyToken.access_token;
}
