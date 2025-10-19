'use client'

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Queue, Song, User } from "@/lib/types";
import { QueueTrackCard } from "@/components/queue-track-card";
import { useState, useEffect } from "react";

export default function QueueComponent({ 
  queue,
}: { queue: Queue }) {
  const supabase = createClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Fetch initial data and set up realtime subscription
  useEffect(() => {
    async function fetchData() {        
        // Get songs for this queue
        const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .eq("queue_id", queue.id)
        .order("created_at", { ascending: true });
        setSongs((songsData ?? []) as Song[]);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
      fetchData();

      // Set up realtime subscription for songs
      const channel = supabase
        .channel('songs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'songs',
            filter: `queue_id=eq.${queue.id}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setSongs(prev => [...prev, payload.new as Song].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              ));
            } else if (payload.eventType === 'UPDATE') {
              setSongs(prev => prev.map(song => 
                song.id === payload.new.id ? payload.new as Song : song
              ));
            } else if (payload.eventType === 'DELETE') {
              setSongs(prev => prev.filter(song => song.id !== payload.old.id));
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }, [queue.id]);
    
  const isDJ = Boolean(user && user.id === queue?.dj_id);

  // Accept/Reject handlers (for DJ)
  async function handleSongStatus(songId:string, status:string) {
    if (!queue) return; 
    const { error } = await supabase.from("songs").update({ status }).eq("id", songId);
    
    if (error) {
      console.error("Error updating song status:", error);
    }
    // No need to manually refresh - realtime subscription will handle the update
  }

  // Delete handler
  async function handleDeleteSong(songId: string) {
    if (!queue) return;
    const { error } = await supabase.from("songs").delete().eq("id", songId);
    
    if (error) {
      console.error("Error deleting song:", error);
    } else {
      setSongs(prev => prev.filter(song => song.id !== songId));
    }
  }

  // Categorize songs by status
  const pendingSongs = songs.filter(song => song.status === "pending");
  const acceptedSongs = songs.filter(song => song.status === "accepted");
  const rejectedSongs = songs.filter(song => song.status === "rejected");
  const playedSongs = songs.filter(song => song.status === "played");

  // Add a loading component
  if (!queue) return <div>Loading...</div>;

  return (
    <div className="w-full flex flex-col bg-card border rounded-lg p-4 gap-2">
      <div className="">
        <h1 className="text-2xl font-bold">{queue.name}</h1>
        <p className="text-muted-foreground">{queue.description}</p>
      </div>
      <hr className=""/>

      {/* Combined Queue - Played, Accepted, and Pending Songs */}
      {(playedSongs.length > 0 || acceptedSongs.length > 0 || pendingSongs.length > 0) && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Queue ({playedSongs.length + acceptedSongs.length + pendingSongs.length})
          </h2>
          <div className="space-y-2">
            {/* Played Songs */}
            {playedSongs.map((song, index) => (
              <QueueTrackCard
                key={song.id}
                song={song}
                isDJ={isDJ}
                onStatusChange={handleSongStatus}
                onDelete={handleDeleteSong}
              />
            ))}
            
            {/* Accepted Songs */}
            {acceptedSongs.map((song, index) => (
              <QueueTrackCard
                key={song.id}
                song={song}
                position={playedSongs.length + index + 1}
                isDJ={isDJ}
                onStatusChange={handleSongStatus}
                onDelete={handleDeleteSong}
              />
            ))}
            
            {/* Pending Songs */}
            {pendingSongs.map((song, index) => (
              <QueueTrackCard
                key={song.id}
                song={song}
                isDJ={isDJ}
                onStatusChange={handleSongStatus}
                onDelete={handleDeleteSong}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Songs */}
      {rejectedSongs.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 text-red-700">Rejected ({rejectedSongs.length})</h2>
          <div className="space-y-2">
            {rejectedSongs.map(song => (
              <QueueTrackCard
                key={song.id}
                song={song}
                isDJ={isDJ}
                onStatusChange={handleSongStatus}
                onDelete={handleDeleteSong}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
