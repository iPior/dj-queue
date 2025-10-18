"use client";

import { useState } from "react";
import { NewSong, Queue, SpotifyTrack } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music, Play, Plus } from "lucide-react";

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !isSpotifyConnected) return;
    
    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      
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

  const handleAddSong = async (track: SpotifyTrack) => {
    setIsSubmitting(true);
    setError("");

    try {
      const { error: insertError } = await supabase.from("songs").insert({
        queue_id: queue.id,
        title: track.name,
        artist: track.artists.map(a => a.name).join(", "),
        streaming_service: "Spotify",
        status: "pending",
      });
      
      if (insertError) {
        setError("Failed to add song. Please try again.");
        console.error("Error adding song:", insertError);
      } else {
        // Remove the added song from search results
        setSearchResults(prev => prev.filter(t => t.id !== track.id));
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
          <Music className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
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
      <form onSubmit={handleSearch} className="flex items-center mb-4">
        <Label htmlFor="spotify-search"/>
        <Input
          id="spotify-search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search songs on Spotify..."
          required
          className="mr-2 h-12 bg-white"
          disabled={isSearching}
        />
        <Button type="submit" disabled={isSearching || !searchQuery.trim()} className="h-12">
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mb-4">{error}</p>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold">Search Results</h3>
          {searchResults.map((track) => (
            <Card key={track.id} className="p-3">
              <div className="flex items-center gap-3">
                {track.album.images[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{track.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.artists.map(a => a.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.album.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {track.preview_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const audio = new Audio(track.preview_url);
                        audio.play();
                      }}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleAddSong(track)}
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}