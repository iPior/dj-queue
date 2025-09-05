"use client";

import { useState } from "react";
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

interface QueueCreationDialogProps {
  onQueueCreated?: () => void;
}

export function QueueCreationDialog({ onQueueCreated }: QueueCreationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [queueName, setQueueName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Create queue in database
      const { data, error } = await supabase
        .from('queues')
        .insert({
          name: queueName,
          description: description || null,
          dj_id: user.id,
          status: 'active',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Reset form and close dialog
      setQueueName("");
      setDescription("");
      setIsOpen(false);
      
      // Notify parent component
      if (onQueueCreated) {
        onQueueCreated();
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          Create Queue
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
