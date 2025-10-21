"use client";

import { useState } from "react";
import { Queue, SpotifyTrack, Track } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrackCard } from "@/components/track-card";
import { Music } from "lucide-react";

interface SpotifySearchProps {
  queue: Queue;
  isSpotifyConnected: boolean;
}

export function SpotifySearch({ queue, isSpotifyConnected }: SpotifySearchProps) {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const convertSpotifyTrackToTrack = (track: SpotifyTrack): Track => ({
    id: track.id,
    title: track.name,
    artist: track.artists.map(a => a.name).join(", "),
    album: track.album.name,
    image_url: track.album.images[0]?.url || "",
    image_alt: track.album.name,
    created_at: new Date().toISOString(),
    streaming_service: "spotify",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !isSpotifyConnected) return;
    
    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=3`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data.tracks.items);
    } catch (err) {
      setError("Failed to search songs. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  };


  const handleAddSong = async (track: Track) => {
    setIsSubmitting(true);
    setError("");

    try {
      const { error: insertError } = await supabase.from("tracks").insert({
        queue_id: queue.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        image_url: track.image_url,
        image_alt: track.image_alt,
        created_at: track.created_at,
        streaming_service: "spotify",
        status: "pending",
      });
      
      if (insertError) {
        setError("Failed to add song. Please try again.");
        console.error("Error adding song:", insertError);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Unexpected error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isSpotifyConnected) {
    return (
      <div className="w-full">
        <Card className="p-4 text-center">
          <Music className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
          <h3 className="font-semibold mb-2">Connect Spotify to Search Songs</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Spotify account to search and add songs directly from Spotify's catalog.
          </p>
          <Button onClick={() => window.location.href = '/profile'}>
            Go to Profile to Connect
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">Search for Songs</h2>
        <p className="text-muted-foreground mb-4">
          Search for songs and add them to your queue.
        </p>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            id="spotify-search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search for songs, artists, or albums..."
            required
            className="h-12 bg-white flex-1"
            disabled={isSearching}
          />
          <Button type="submit" disabled={isSearching || !searchQuery.trim()} className="h-12 px-6">
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
        {error && (
          <p className="text-destructive text-sm">{error}</p>
        )}
      </div>
      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((track) => (
            <TrackCard
              key={track.id}
              track={convertSpotifyTrackToTrack(track)}
              onAdd={handleAddSong}
              isAdding={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}