"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

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
    <main className="min-h-screen flex flex-col items-center justify-center space-y-4">

      {/* join a queue */}
      <div className="w-1/3 space-y-4">
        {/* header */}

        {/* form */}
        <form onSubmit={handleQueueSumbit} className="">
          <div className="">
            <h1 className="text-3xl font-bold">Join a Queue</h1>
            <p className="text-muted-foreground text-lg">
              Browse and join active DJ queues to request songs
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor=""></Label>
            <Input
              id=""
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

        {/* login or sign up */}
        <div className="flex flex-col gap-1">
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Sign In
            </Link>
          </div>
          <div className="text-center text-sm">
            Are you a DJ?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}


