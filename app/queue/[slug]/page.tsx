'use client' 

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Song, NewSong, Queue, User } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QueuePage() {
  const { slug } = useParams();
  const supabase = createClient();

  const [queue, setQueue] = useState<Queue | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [newSong, setNewSong] = useState<NewSong>({ title: "", artist: "", streaming_service: "" });

  // Fetch queue, songs, and user
  useEffect(() => {
    async function fetchData() {
      // Get queue by code
      const { data: queueData } = await supabase
        .from("queues")
        .select("*")
        .eq("code", slug)
        .single();
      setQueue(queueData as Queue);

      // Get songs for this queue
      const { data: songsData } = await supabase
        .from("songs")
        .select("*")
        .eq("queue_id", queueData.id)
        .order("created_at", { ascending: true });
      setSongs((songsData ?? []) as Song[]);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchData();
  }, [slug]);

  // Add song handler
  async function handleAddSong(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!queue) return; // Guard against null
    await supabase.from("songs").insert({
      queue_id: queue.id,
      title: newSong.title,
      artist: newSong.artist,
      streaming_service: newSong.streaming_service,
    });
    setNewSong({ title: "", artist: "", streaming_service: "" });
    // Re-fetch songs
    const { data: songsData } = await supabase
      .from("songs")
      .select("*")
      .eq("queue_id", queue.id)
      .order("created_at", { ascending: true });
    setSongs((songsData ?? []) as Song[]);
  }

  // Accept/Reject handlers (for DJ)
  async function handleSongStatus(songId:string, status:string) {
    if (!queue) return; // Guard against null
    await supabase.from("songs").update({ status }).eq("id", songId);
    // Re-fetch songs
    const { data: songsData } = await supabase
      .from("songs")
      .select("*")
      .eq("queue_id", queue.id)
      .order("created_at", { ascending: true });
    setSongs((songsData ?? []) as Song[]);
  }

  // Add a loading component
  if (!queue) return <div>Loading...</div>; 

  const isDJ = user && user.id === queue.dj_id;

  return (
    <div className="flex flex-col gap-4 py-20 w-3/5 mx-auto">
      <div className="flex flex-col bg-card border rounded-lg p-4 gap-2">
        <h1 className="text-2xl font-bold">{queue.name}</h1>
        <p className="text-muted-foreground">{queue.description}</p>
        <hr className=""/>
        {/* songs list */}
        <div>
          <h2>Songs</h2>
          <ul>
            {songs.map(song => (
              <li key={song.id}>
                {song.title} by {song.artist} ({song.streaming_service}) - {song.status}
                {isDJ  && (
                  <>
                    <button onClick={() => handleSongStatus(song.id, "accepted")}>Accept</button>
                    <button onClick={() => handleSongStatus(song.id, "rejected")}>Reject</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        <hr/>
        {/* search bar */}
        <div>
          <form onSubmit={handleAddSong} className="flex items-center gap-2">
            <Label className="text-xl" htmlFor="search">Search: </Label>
            <Input
              value={newSong.title}
              onChange={e => setNewSong({ ...newSong, title: e.target.value })}
              placeholder="song request"
              required
              />
            <Button type="submit">Search</Button>
          </form>
        </div>
      </div>
    </div>
  );
}