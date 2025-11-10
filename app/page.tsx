import Link from "next/link";
import { HomeSearch } from "../components/homepage/home-search";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center space-y-4">
      {/* join a queue */}
      <div className="w-1/3 space-y-4">
        {/* header */}
        <div className="mb-2">
          <h1 className="text-4xl font-bold">Join a party!</h1>
          {/* <p className="text-muted-foreground text-xl">
            Search and join active DJ queues to request songs
          </p> */}
        </div>
        
        <HomeSearch />

        {!session && <div className="flex flex-col gap-1">
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
        </div>}
      </div>
    </main>
  );
}


