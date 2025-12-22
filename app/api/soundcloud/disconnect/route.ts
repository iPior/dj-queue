import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateConnectedService } from '@/lib/user-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const soundcloudData = {
      access_token: null,
      refresh_token: null,
      expires_in: null,
      connected: false,
    };

    const updateSuccess = await updateConnectedService(user.id, 'soundcloud', soundcloudData);
    if (!updateSuccess) {
      throw new Error('Failed to disconnect SoundCloud');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SoundCloud disconnect error:', error);
    return NextResponse.json({ error: 'Failed to disconnect SoundCloud' }, { status: 500 });
  }
}

