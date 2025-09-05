"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [searchString, setSearchString] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  
  const handleQueueSumbit = async (e: React.FormEvent) => {
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
    <main className="p-16 flex flex-col items-center ">
      {/* <div className="flex-1 bg-blue-900 w-full flex flex-col items-center"> */}
        <div className="container">
          {/* turn this into a form */}
          <form onSubmit={handleQueueSumbit}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Join a Queue</h1>
              <p className="text-muted-foreground mt-2">
                Browse and join active DJ queues to request songs
              </p>
              <div className="grid gap-2">
                <Label htmlFor=""></Label>
                <Input
                  id=""
                  type="text"
                  placeholder="Queue ID"
                  value={searchString}
                  onChange={(e) => setSearchString(e.target.value)}
                />
              </div>
            </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Searching for DJ Queue..." : "Find DJ Queue"}
            </Button>
          </form>
        </div>
      {/* </div> */}
    </main>
  );
}


