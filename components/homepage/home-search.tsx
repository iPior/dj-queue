"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HomeSearch() {
  const [searchString, setSearchString] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // need to connect to supabase and check if such a dj id even exists
    try {
      router.push(`/queue/${searchString}`);
    }
    catch (error){
      console.error(error)
    }
  }

  return (
    <form onSubmit={handleQueueSubmit} className="">
      <div className="grid gap-2">
        <Label htmlFor="queue-id"></Label>
        <Input
          id="queue-id"
          type="text"
          placeholder="Queue ID"
          value={searchString}
          onChange={(e) => setSearchString(e.target.value)}
          className="h-12"
        />
        <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? "Searching for DJ Queue..." : "Find DJ Queue"}
        </Button>
      </div>
    </form>
  );
}
