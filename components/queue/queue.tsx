'use client'

import { createClient } from "@/lib/supabase/client";
import { Queue, SongStatus, Track } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { TrackCard } from "@/components/track-card";
import { useState, useEffect } from "react";

export default function QueueComponent({ 
  queue,
}: { queue: Queue }) {
  const supabase = createClient();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchData() {        
        const { data: tracksData } = await supabase
        .from("tracks")
        .select("*")
        .eq("queue_id", queue.id)
        .order("created_at", { ascending: true });
        setTracks((tracksData ?? []) as Track[]);
        
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
      fetchData();

      const channel = supabase
        .channel('songs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tracks',
            filter: `queue_id=eq.${queue.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTracks(prev => [...prev, payload.new as Track].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              ));
            } else if (payload.eventType === 'UPDATE') {
              setTracks(prev => prev.map(track => 
                track.id === payload.new.id ? payload.new as Track : track
              ));
            } else if (payload.eventType === 'DELETE') {
              setTracks(prev => prev.filter(track => track.id !== payload.old.id));
            }
          }
        ) 
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }, [queue.id]);
    
  const isDJ = Boolean(user && user.id === queue?.dj_id);

  async function handleTrackStatus(trackId:string, status:SongStatus) {
    if (!queue) return; 
    const { error } = await supabase.from("tracks").update({ status }).eq("id", trackId);
    
    if (error) {
      console.error("Error updating track status:", error);
    }
  }

  async function handleDeleteTrack(trackId: string) {
    if (!queue) return;
    const { error } = await supabase.from("tracks").delete().eq("id", trackId);
    
    if (error) {
      console.error("Error deleting track:", error);
    } else {
      setTracks(prev => prev.filter(track => track.id !== trackId));
    }
  }

  // Add a loading component
  if (!queue) return <div>Loading...</div>;

  return (
    <div className="w-full flex flex-col bg-card border rounded-lg p-4 gap-2">
      <div className="">
        <h1 className="text-2xl font-bold">
          {queue.name}
          <span className="text-sm text-muted-foreground"> ({tracks.length} tracks in queue)</span>
          </h1>
        <p className="text-muted-foreground">{queue.description}</p>
      </div>

      {(tracks.length > 0) ? (
        <div className="mb-4">
          {/* <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Queue ({tracks.length})
          </h2> */}
          <div className="space-y-2">
            {tracks.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                mode="queue"
                status={track.status}
                isDJ={isDJ}
                onStatusChange={handleTrackStatus}
                onDelete={handleDeleteTrack}
              />  
            ))} 
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground">No tracks in queue</div>
      )}
    </div>
  );
}
