"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface DJSearchResult {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  active_queue: {
    code: string;
    name: string;
    description: string | null;
  } | null;
}

export function HomeSearch() {
  const [searchString, setSearchString] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<DJSearchResult[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search for DJ names
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchString.trim().length === 0) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search by 300ms
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/djs/search?q=${encodeURIComponent(searchString)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.djs || []);
          setShowResults(data.djs && data.djs.length > 0);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchString]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResults(false);

    // If there are search results and the input matches one exactly, use that
    // Otherwise, treat it as a queue ID
    try {
      router.push(`/queue/${searchString}`);
    }
    catch (error){
      console.error(error)
    } finally {
      setIsLoading(false);
    }
  }

  const handleDJSelect = (dj: DJSearchResult) => {
    if (dj.active_queue) {
      setSearchString("");
      setShowResults(false);
      router.push(`/queue/${dj.active_queue.code}`);
    }
  }

  return (
    <form onSubmit={handleQueueSubmit} className="">
      <div className="grid gap-2 relative" ref={containerRef}>
        <Label htmlFor="queue-id">Search by Queue ID or DJ Name</Label>
        <div className="relative">
          <Input
            id="queue-id"
            type="text"
            placeholder="DJ Pior"
            value={searchString}
            onChange={(e) => {
              setSearchString(e.target.value);
              if (e.target.value.trim().length > 0) {
                // Keep results visible while typing
              } else {
                setShowResults(false);
              }
            }}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            className="h-12"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              Searching...
            </div>
          )}
        </div>
        
        {/* Dropdown with search results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-1 w-full z-50 bg-popover border rounded-md shadow-lg max-h-96 overflow-y-auto">
            {searchResults.map((dj) => (
              <div
                key={dj.id}
                onClick={() => handleDJSelect(dj)}
                className="p-3 hover:bg-primary cursor-pointer border-b last:border-b-0 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {dj.avatar_url && (
                    <img
                      src={dj.avatar_url}
                      alt={dj.display_name || ""}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {dj.display_name}
                    </div>
                    {dj.active_queue && (
                      <div className="text-sm text-muted-foreground">
                        <div className="truncate">Queue: {dj.active_queue.name}</div>
                        {dj.active_queue.description && (
                          <div className="truncate text-xs">{dj.active_queue.description}</div>
                        )}
                        <div className="text-xs mt-1">Code: {dj.active_queue.code}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* <Button type="submit" className="w-full h-12" disabled={isLoading}>
          {isLoading ? "Searching for DJ Queue..." : "Find DJ Queue"}
        </Button> */}
      </div>
    </form>
  );
}
