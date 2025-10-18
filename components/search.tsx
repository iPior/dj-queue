import { useState } from "react";
import { NewSong, Queue } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SpotifySearch } from "@/components/spotify-search";

export default function Search({ queue }: { queue: Queue }) {
  const supabase = createClient();
  const [newSong, setNewSong] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean>(false);

  // Check if user has Spotify connected
  // useState(() => {
  //   const checkSpotifyConnection = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (user) {
  //       const { data: profile } = await supabase
  //         .from('profiles')
  //         .select('connected_services.spotify.connected')
  //         .eq('id', user.id)
  //         .single();
        
  //       setIsSpotifyConnected(profile?.connected_services.spotify.connected || false);
  //     }
  //   };
  //   checkSpotifyConnection();
  // }),;

  // Add spotify connection check here

  async function handleAddSong(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newSong.trim()) return;
    setIsSubmitting(true);
    setError("");

    
    try {
      const { error: insertError } = await supabase.from("songs").insert({
        queue_id: queue.id,
        title: newSong.trim(),
        artist: "", // Will be populated by Spotify search later
        streaming_service: "Manual", // Manual entry
        status: "pending",
      });
      
      if (insertError) {
        setError("Failed to add song. Please try again.");
        console.error("Error adding song:", insertError);
      } else {
        setNewSong("");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Unexpected error:", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Spotify Search (if connected) */}
      {isSpotifyConnected && (
        <SpotifySearch queue={queue} isSpotifyConnected={isSpotifyConnected} />
      )}

      {/* Manual Entry */}
      <div className="w-full">
        <h3 className="font-semibold mb-2">
          {isSpotifyConnected ? "Or add manually:" : "Add a song:"}
        </h3>
        <form onSubmit={handleAddSong} className="flex items-center">
            <Label htmlFor="search"/>
            <Input
              id="search"
              value={newSong}
              onChange={e => setNewSong(e.target.value)}
              placeholder="Enter song title manually"
              required
              className="mr-2 h-12 bg-white"
              disabled={isSubmitting}
              />
            <Button type="submit" disabled={isSubmitting || !newSong.trim()} className="h-12" >
              {isSubmitting ? "Searching..." : "Search"}
            </Button>
          </form>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
      </div>
    </div>
  )
}