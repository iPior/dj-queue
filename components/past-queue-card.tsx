'use client'

import { useEffect } from "react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Queue } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "./ui/button";

export function PastQueueCard() {
  const supabase = createClient();
  const router = useRouter();
  const [queue, setQueue] = useState<Queue[]>();

  
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return

      const { data: queueData } = await supabase
        .from("queues")
        .select("*")
        .eq("dj_id", user.id);
      setQueue(queueData as Queue[]);
    }
    fetchData();
  },[])

  const handleViewButton = (queueCode: string) => {
    router.push(`/queue/${queueCode}`);
  }

  const handleDeactivateButton = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('queues')
        .update({ status: 'inactive' })
        .eq('id', queueId);

      if (error) {
        console.error('Error deactivating queue:', error);
        return;
      }

      // Refresh the queue list
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: queueData } = await supabase
        .from("queues")
        .select("*")
        .eq("dj_id", user.id);
      setQueue(queueData as Queue[]);
      toast.success('Queue deactivated');
    } catch (error) {
      console.error('Error deactivating queue:', error);
    }
  }

  const handleActivateButton = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('queues')
        .update({ status: 'active' })
        .eq('id', queueId);

      if (error) {
        console.error('Error activating queue:', error);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: queueData } = await supabase
        .from("queues")
        .select("*")
        .eq("dj_id", user.id);
      setQueue(queueData as Queue[]);
      toast.success('Queue activated');
    }
    catch (error) {
      console.error('Error activating queue:', error);
    }
  }

  const handleDeleteButton = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('queues')
        .delete()
        .eq('id', queueId);

      if (error) {
        console.error('Error deleting queue:', error);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: queueData } = await supabase
        .from("queues")
        .select("*")
        .eq("dj_id", user.id);
      setQueue(queueData as Queue[]);
      toast.success('Queue deleted');
    }
    catch (error) {
      console.error('Error deleting queue:', error);
    }
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {queue && queue.length > 0 ? (
        queue.map((q) => (
          <Card key={q.id} className="flex flex-col h-full">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex justify-between">
                <span className="mr-2 text-lg font-bold">{q.name}</span> 
                <span className={cn((q.status === "active" ? "text-primary" : "text-red-500"), "text-sm uppercase flex  items-center")}>{q.status}</span>
              </CardTitle>
              <CardDescription>{q.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <div className="flex gap-2">
                <Button onClick={() => handleViewButton(q.code)}>View</Button>
                {q.status === 'active' ?
                  <Button onClick={() => handleDeactivateButton(q.id)}>Deactivate</Button> : 
                  <Button onClick={() => handleActivateButton(q.id)}>Activate</Button>
                }
                <AlertDialog>
                  <AlertDialogTrigger>
                    Delete
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Queue</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{q.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteButton(q.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent>No past queues found.</CardContent>
        </Card>
      )}
    </div>
  )

}