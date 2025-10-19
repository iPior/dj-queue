import { useState, useEffect } from "react";
import { Queue } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { SpotifySearch } from "@/components/spotify-search";

export default function Search({ queue }: { queue: Queue }) {
  const supabase = createClient();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean>(false);

  // Check if user has Spotify connected
  useEffect(() => {
    const checkSpotifyConnection = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('connected_services')
          .eq('id', user.id)
          .single();
        
        setIsSpotifyConnected(profile?.connected_services?.spotify?.connected || false);
      }
    };
    checkSpotifyConnection();
  }, [supabase]);

  return (
    <div className="w-full">
      <SpotifySearch queue={queue} isSpotifyConnected={isSpotifyConnected} />
    </div>
  )
}