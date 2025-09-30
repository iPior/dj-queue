'use client' 

import { useParams } from "next/navigation";
import QueueComponent from "@/components/queue";
import Search from "@/components/search";

export default function QueuePage() {
  const { slug } = useParams();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 py-20 w-3/5 mx-auto">
      <Search slug={slug as string} />
      <QueueComponent slug={slug as string} />
    </div>
  );
}