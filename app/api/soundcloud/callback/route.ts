import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SoundCloudTokens } from '@/lib/types';
import { updateConnectedService } from '@/lib/user-utils';
import { cookies } from 'next/headers';

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const SOUNDCLOUD_CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET;
const SOUNDCLOUD_REDIRECT_URI = process.env.SOUNDCLOUD_REDIRECT_URI;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=soundcloud_auth_failed`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=invalid_callback`);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== state) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=unauthorized`);
    }

    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('soundcloud_code_verifier')?.value;

    if (!codeVerifier) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=missing_code_verifier`);
    }

    const tokenResponse = await fetch('https://api.soundcloud.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: SOUNDCLOUD_CLIENT_ID || '',
        client_secret: SOUNDCLOUD_CLIENT_SECRET || '',
        code,
        redirect_uri: SOUNDCLOUD_REDIRECT_URI || '',
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('SoundCloud token exchange failed:', errorText);
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens: SoundCloudTokens = await tokenResponse.json();

    // Clear the code verifier cookie
    cookieStore.delete('soundcloud_code_verifier');

    const soundcloudData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expires_in: tokens.expires_in,
      connected: true,
    };

    const updateSuccess = await updateConnectedService(user.id, 'soundcloud', soundcloudData);
    if (!updateSuccess) {
      throw new Error('Failed to update SoundCloud connection');
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?success=soundcloud_connected`);
  } catch (error) {
    console.error('SoundCloud callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=soundcloud_callback_failed`);
  }
}

