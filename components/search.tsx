import { useState } from "react";
import { NewSong } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function Search({ slug }: { slug: string }) {
  const supabase = createClient();
  const [newSong, setNewSong] = useState<NewSong>({ title: "", artist: "", streaming_service: "" });

  async function handleAddSong(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await supabase.from("songs").insert({
      queue_id: slug,
      title: newSong.title,
      artist: newSong.artist,
      streaming_service: newSong.streaming_service,
      status: "pending",
    });
    setNewSong({ title: "", artist: "", streaming_service: "" });
  }

  return (
    <div className="w-full">
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
  )
}