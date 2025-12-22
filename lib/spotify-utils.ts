import { createClient } from '@/lib/supabase/server';
import { SpotifyTokens } from '@/lib/types';
import { updateConnectedService } from '@/lib/user-utils';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// In-memory cache for app-level access token
let appAccessTokenCache: { token: string; expiresAt: number } | null = null;

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
  console.log(profile);
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

/**
 * Gets an app-level Spotify access token using Client Credentials flow.
 * This token can be used for searching tracks without requiring user authentication.
 * The token is cached in memory to avoid unnecessary API calls.
 */
export async function getAppSpotifyAccessToken(): Promise<string | null> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    console.error('Spotify client credentials not configured');
    return null;
  }

  // Check if we have a valid cached token
  if (appAccessTokenCache && Date.now() < appAccessTokenCache.expiresAt) {
    return appAccessTokenCache.token;
  }

  try {
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to get app Spotify token:', tokenResponse.status, tokenResponse.statusText);
      return null;
    }

    const tokenData: { access_token: string; expires_in: number } = await tokenResponse.json();
    
    // Cache the token with a 5-minute buffer before expiration
    const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    appAccessTokenCache = {
      token: tokenData.access_token,
      expiresAt: Date.now() + (tokenData.expires_in * 1000) - bufferTime,
    };

    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting app Spotify token:', error);
    return null;
  }
}
