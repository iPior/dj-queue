import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SOUNDCLOUD_CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const SOUNDCLOUD_REDIRECT_URI = process.env.SOUNDCLOUD_REDIRECT_URI;

function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!SOUNDCLOUD_CLIENT_ID || !SOUNDCLOUD_REDIRECT_URI) {
      return NextResponse.json({ error: 'SoundCloud configuration missing' }, { status: 500 });
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const cookieStore = await cookies();
    cookieStore.set('soundcloud_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    });

    const authUrl = new URL('https://soundcloud.com/connect');
    authUrl.searchParams.set('client_id', SOUNDCLOUD_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', SOUNDCLOUD_REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('state', user.id);

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('SoundCloud auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

