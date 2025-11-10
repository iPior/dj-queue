'use client' 

import { useParams } from "next/navigation";
import QueueComponent from "@/components/queue/queue";
import Search from "@/components/queue/search";
import { Queue } from "@/lib/types";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function QueuePage() {
  const { slug } = useParams(); 
  const supabase = createClient();
  const [queue, setQueue] = useState<Queue>();

  useEffect(() => {
    async function fetchData() {
      const { data: queueData, error } = await supabase
      .from("queues")
      .select("*")
        .eq("code", slug)
        .single();
      if (error) throw error;
      if (!queueData) throw new Error("Queue not found");
      setQueue(queueData as Queue);
      console.log(queueData);
      }
      fetchData();
      
    }, [slug]);

    // maybe make this a redirection to a page that says the queue does not exist
  if (!queue) return <div>Queue does not exist</div>; 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20 w-3/5 mx-auto xl:w-full xl:flex-row">
      <div className="w-full xl:w-1/3">
        <Search queue={queue} />
      </div>
      <div className="w-full xl:w-1/2">
        <QueueComponent queue={queue} />
      </div>
    </div>
  );
}