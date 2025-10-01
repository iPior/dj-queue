import { useState } from "react";
import { NewSong, Queue } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function Search({ queue }: { queue: Queue }) {
  const supabase = createClient();
  const [newSong, setNewSong] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

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
        streaming_service: "Spotify", // Will be populated by Spotify search later
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
    <div className="w-full">
      <form onSubmit={handleAddSong} className="flex items-center">
          <Label htmlFor="search"/>
          <Input
            id="search"
            value={newSong}
            onChange={e => setNewSong(e.target.value)}
            placeholder="Search a song"
            required
            className="mr-2 bg-white"
            disabled={isSubmitting}
            />
          <Button type="submit" disabled={isSubmitting || !newSong.trim()}>
            {isSubmitting ? "Adding..." : "Add Song"}
          </Button>
        </form>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
    </div>
  )
}