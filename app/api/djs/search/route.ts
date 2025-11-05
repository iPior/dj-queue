import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const searchTerm = `%${query.trim()}%`;

    // Search for profiles by display_name or username
    // Make two queries and combine results to avoid issues with .or() syntax
    const { data: displayNameResults, error: displayNameError } = await supabase
        .from('profiles')
        .select(`*`)
        .ilike('display_name', searchTerm)
        .limit(15)

    if (displayNameError) {
      console.error('Error searching profiles:', displayNameError);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    if (displayNameResults.length === 0) {
      return NextResponse.json({ djs: [] });
    }

    // Get active queue details for each DJ
    const djIds = displayNameResults.map((profile: UserProfile) => profile.id);

    const { data: queues, error: queueError } = await supabase
      .from('queues')
      .select('id, code, name, description, dj_id, status')
      .in('dj_id', djIds)
      .eq('status', 'active');

    if (queueError) {
      console.error('Error fetching queues:', queueError);
    }

    // Combine profiles with their active queues
    const djsWithQueues = displayNameResults.map(profile => {
      const activeQueue = queues?.find(q => q.dj_id === profile.id);
      return {
        id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        active_queue: activeQueue ? {
          code: activeQueue.code,
          name: activeQueue.name,
          description: activeQueue.description,
        } : null,
      };
    }).filter(dj => dj.active_queue !== null); // Only return DJs with active queues

    return NextResponse.json({ djs: djsWithQueues });

  } catch (error) {
    console.error('DJ search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

