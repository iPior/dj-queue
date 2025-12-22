import { createClient } from '@/lib/supabase/server';
import { SoundCloudTokens } from '@/lib/types';
import { updateConnectedService } from '@/lib/user-utils';

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const SOUNDCLOUD_CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET;

async function refreshSoundCloudToken(refreshToken: string): Promise<SoundCloudTokens | null> {
  if (!SOUNDCLOUD_CLIENT_ID || !SOUNDCLOUD_CLIENT_SECRET) {
    console.error('SoundCloud client credentials not configured');
    return null;
  }

  try {
    const tokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: SOUNDCLOUD_CLIENT_ID,
        client_secret: SOUNDCLOUD_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to refresh SoundCloud token:', tokenResponse.status, tokenResponse.statusText);
      return null;
    }

    const tokens: SoundCloudTokens = await tokenResponse.json();
    
    return tokens;
  } catch (error) {
    console.error('Error refreshing SoundCloud token:', error);
    return null;
  }
}

async function updateSoundCloudTokens(userId: string, tokens: SoundCloudTokens, preserveRefreshToken: boolean = false): Promise<boolean> {
  try {
    // If we need to preserve the refresh token, get the current data first
    let currentSoundCloudData = null;
    if (preserveRefreshToken) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('connected_services')
        .eq('id', userId)
        .single();
      currentSoundCloudData = profile?.connected_services?.soundcloud;
    }
    
    // Store expires_in as timestamp (current time + expires_in seconds)
    const expiresAt = Date.now() + (tokens.expires_in * 1000);

    const soundcloudData = {
      access_token: tokens.access_token,
      refresh_token: preserveRefreshToken && currentSoundCloudData?.refresh_token 
        ? currentSoundCloudData.refresh_token 
        : tokens.refresh_token || null,
      expires_in: expiresAt,
      connected: true,
    };
    
    return await updateConnectedService(userId, 'soundcloud', soundcloudData);
  } catch (error) {
    console.error('Error updating SoundCloud tokens:', error);
    return false;
  }
}

export async function getValidSoundCloudAccessToken(userId: string): Promise<string | null> {
  const supabase = await createClient();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('connected_services')
    .eq('id', userId)
    .single();

  const soundcloudToken = profile?.connected_services?.soundcloud;

  if (!soundcloudToken || !soundcloudToken.access_token) {
    console.log('No SoundCloud token found for user');
    return null;
  }

  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  // Check if token is expired or expiring soon
  if (soundcloudToken.expires_in && Date.now() >= (soundcloudToken.expires_in - bufferTime)) {
    console.log('SoundCloud token expired or expiring soon, refreshing...');
    
    if (!soundcloudToken.refresh_token) {
      console.log('No refresh token available');
      return null;
    }

    const newTokens = await refreshSoundCloudToken(soundcloudToken.refresh_token);
    if (!newTokens) {
      console.log('Failed to refresh SoundCloud token');
      return null;
    }

    const updateSuccess = await updateSoundCloudTokens(userId, newTokens, true);
    if (!updateSuccess) {
      console.log('Failed to update SoundCloud tokens in database');
      return null;
    }

    return newTokens.access_token;
  }

  return soundcloudToken.access_token;
}

