import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        connected_services: {
          spotify: {
            access_token: null,
            refresh_token: null,
            expires_in: null,
            connected: false,
          }
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Spotify disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect Spotify' }, { status: 500 });
  }
}
