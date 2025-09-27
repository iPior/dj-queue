'use client' 

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Song, NewSong, Queue, User } from "@/lib/types";

import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { cn } from "@/lib/utils";

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

  // Categorize songs by status
  const pendingSongs = songs.filter(song => song.status === "pending");
  const acceptedSongs = songs.filter(song => song.status === "accepted");
  const rejectedSongs = songs.filter(song => song.status === "rejected");
  const playedSongs = songs.filter(song => song.status === "played");

  return (
    <div className="flex flex-col gap-4 py-20 w-3/5 mx-auto">
      {/* search bar */}
      <div className="">
        <form onSubmit={handleAddSong} className="flex items-center">
            <Label htmlFor="search"/>
            <Input
              value={newSong.title}
              onChange={e => setNewSong({ ...newSong, title: e.target.value })}
              placeholder="Search a song"
              required
              className="mr-2 bg-white"
              />
            <Button type="submit">Search</Button>
          </form>
      </div>
      {/* queue */}
      <div className="flex flex-col bg-card border rounded-lg p-4 gap-2">
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
            <ol className="space-y-2">
              {/* Played Songs */}
              {playedSongs.map((song, index) => (
                <li key={song.id} className="flex items-center justify-between bg-blue-100 py-2 px-3 rounded-md">
                  <span className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ✓
                    </span>
                    <span className="text-gray-600">
                      {song.title} by {song.artist} ({song.streaming_service})
                    </span>
                  </span>
                </li>
              ))}
              
              {/* Accepted Songs */}
              {acceptedSongs.map((song, index) => (
                <li key={song.id} className="flex items-center justify-between bg-green-100 py-2 px-3 rounded-md">
                  <span className="flex items-center gap-3">
                    <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {playedSongs.length + index + 1}
                    </span>
                    <span>
                      {song.title} by {song.artist} ({song.streaming_service})
                    </span>
                  </span>
                  {isDJ && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSongStatus(song.id, "played")}
                    >
                      Mark as Played
                    </Button>
                  )}
                </li>
              ))}
              
              {/* Pending Songs */}
              {pendingSongs.map((song, index) => (
                <li key={song.id} className="flex items-center justify-between bg-yellow-100 py-2 px-3 rounded-md">
                  <span className="flex items-center gap-3">
                    <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ?
                    </span>
                    <span>
                      {song.title} by {song.artist} ({song.streaming_service})
                    </span>
                  </span>
                  {isDJ && (
                    <div className="gap-2 flex">
                      <Button size="sm" onClick={() => handleSongStatus(song.id, "accepted")}>Accept</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleSongStatus(song.id, "rejected")}>Reject</Button>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        

        {/* Rejected Songs */}
        {rejectedSongs.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-red-700">Rejected ({rejectedSongs.length})</h2>
            <ul className="space-y-2">
              {rejectedSongs.map(song => (
                <li key={song.id} className="flex items-center justify-between bg-red-100 py-2 px-3 rounded-md">
                  <span>
                    {song.title} by {song.artist} ({song.streaming_service})
                  </span>
                  {isDJ && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleSongStatus(song.id, "accepted")}
                    >
                      Re-accept
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}