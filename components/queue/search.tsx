import { Queue } from "@/lib/types";
import { SpotifySearch } from "@/components/queue/spotify-search";

export default function Search({ queue }: { queue: Queue }) {
  return (
    <div className="w-full">
      <SpotifySearch queue={queue} />
    </div>
  )
}