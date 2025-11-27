"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateShortId } from '@/lib/utils';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface QueueCreationDialogProps {
  onQueueCreated?: () => void;
}

export function QueueCreationDialog({ onQueueCreated }: QueueCreationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queueName, setQueueName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [doesDJHaveActiveQueue, setDoesDJHaveActiveQueue] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);
      
      const { data, error: doesDJHaveActiveQueueError } = await supabase
        .from('profiles')
        .select('active_queue')
        .eq('id', user.id)
        .single();
      if (doesDJHaveActiveQueueError) throw doesDJHaveActiveQueueError;
      setDoesDJHaveActiveQueue(data.active_queue !== null ? true : false);
    }
    fetchData();
  }, []);

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

  try {

    if (!user) throw new Error("User not authenticated");

    // Generate a unique code for the queue
    let code: string;
    while (true) {
      code = generateShortId();
      const { data: existing } = await supabase
        .from('queues')
        .select('id')
        .eq('code', code)
        .single();
      if (!existing) break;
    }

    // Create Spotify playlist if user has Spotify connected
    let spotifyPlaylistId: string | null = null;
    try {
      const playlistResponse = await fetch('/api/spotify/playlist/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: queueName,
          description: description || `DJ Queue: ${queueName}`,
        }),
      });

      if (playlistResponse.ok) {
        const playlistData = await playlistResponse.json();
        spotifyPlaylistId = playlistData.id;
      } else {
        console.log('Could not create Spotify playlist (Spotify may not be connected)');
      }
    } catch (playlistError) {
      console.error('Error creating Spotify playlist:', playlistError);
    }

    // Create queue in database
    const { data, error } = await supabase
      .from('queues')
      .insert({
        code,
        name: queueName,
        description: description || null,
        dj_id: user.id,
        status: 'active',
        created_at: new Date().toISOString(),
        spotify_playlist_id: spotifyPlaylistId,
      })
      .select()
      .single();

    if (error) throw error;

    // Update user's profile to set this queue as their active queue
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ active_queue: code })
      .eq('id', user.id);

    if (updateError) throw updateError;
    if (data) router.push(`/queue/${data.code}`);

    // Reset form and close dialog
    setQueueName("");
    setDescription("");
    setIsOpen(false);

    // Notify parent component
    if (onQueueCreated) onQueueCreated();

  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : "An error occurred");
  } finally {
    setIsLoading(false);
  }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg" disabled={doesDJHaveActiveQueue}>
          {doesDJHaveActiveQueue ? "You already have an active queue" : "Create Queue"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleCreateQueue}>
          <DialogHeader>
            <DialogTitle>Create New Queue</DialogTitle>
            <DialogDescription>
              Create a new queue for your DJ session. You can manage song requests and control the playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="queueName">Queue Name</Label>
              <Input
                id="queueName"
                placeholder="My Awesome DJ Set"
                value={queueName}
                onChange={(e) => setQueueName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Describe your DJ session..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Queue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
