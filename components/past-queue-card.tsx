'use client'

import { useEffect } from "react"
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Queue } from "@/lib/types";

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
      // console.log(queueData)
    }
    fetchData();
  },[])

  console.log(queue)

  return (
    <div className="flex gap-2">
      {queue && queue.length > 0 ? (
        queue.map((q) => (
          <Card key={q.id} className="w-full">
            <CardHeader>
              <CardTitle>{q.name}</CardTitle>
              <CardDescription>{q.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add more fields as needed */}
              <div>Status: {q.status}</div>
              <Button>
                View
              </Button>
              <Button>
                Deactivate
              </Button>
              <Button>
                Delete
              </Button>
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