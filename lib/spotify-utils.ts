import { createClient } from '@/lib/supabase/server';
import { SpotifyTokens } from '@/lib/types';

// Helper function to elegantly update connected services
export async function updateConnectedService(userId: string, serviceName: string, serviceData: any): Promise<boolean> {
  const supabase = await createClient();
  
  try {
    // Get current connected_services
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('connected_services')
      .eq('id', userId)
      .single();

    // Merge with existing services
    const currentServices = currentProfile?.connected_services || {};
    const updatedServices = {
      ...currentServices,
      [serviceName]: serviceData,
    };

    // Update the database
    const { error } = await supabase
      .from('profiles')
      .update({
        connected_services: updatedServices,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error(`Failed to update ${serviceName} service:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error updating ${serviceName} service:`, error);
    return false;
  }
}

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

async function updateSpotifyTokens(userId: string, tokens: SpotifyTokens, preserveRefreshToken: boolean = false): Promise<boolean> {
  try {
    // If we need to preserve the refresh token, get the current data first
    let currentSpotifyData = null;
    if (preserveRefreshToken) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('connected_services')
        .eq('id', userId)
        .single();
      currentSpotifyData = profile?.connected_services?.spotify;
    }
    
    const spotifyData = {
      access_token: tokens.access_token,
      refresh_token: preserveRefreshToken && currentSpotifyData?.refresh_token 
        ? currentSpotifyData.refresh_token 
        : tokens.refresh_token,
      expires_in: tokens.expires_in,
      connected: true,
    };
    
    return await updateConnectedService(userId, 'spotify', spotifyData);
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

  if (!spotifyToken || !spotifyToken.access_token) {
    console.log('No Spotify token found for user');
    return null;
  }

  const bufferTime = 5 * 60 * 1000;
  
  if (spotifyToken.expires_in && Date.now() >= (spotifyToken.expires_in - bufferTime)) {
    console.log('Spotify token expired or expiring soon, refreshing...');
    
    if (!spotifyToken.refresh_token) {
      console.log('No refresh token available');
      return null;
    }

    const newTokens = await refreshSpotifyToken(spotifyToken.refresh_token);
    if (!newTokens) {
      console.log('Failed to refresh Spotify token');
      return null;
    }

    const updateSuccess = await updateSpotifyTokens(userId, newTokens, true);
    if (!updateSuccess) {
      console.log('Failed to update Spotify tokens in database');
      return null;
    }

    return newTokens.access_token;
  }

  return spotifyToken.access_token;
}
