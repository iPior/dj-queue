"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Plus, X } from "lucide-react";
import Image from "next/image";
import { SongStatus, StreamingService, Track } from "@/lib/types";
import { BrandLogo } from "./brand-logo";

export interface SearchTrackCardProps {
  track: Track;
  onAdd?: (track: Track) => void;
  isAdding?: boolean;
  addButtonText?: string;
  className?: string;
}

export function SearchTrackCard({ 
  track, 
  onAdd, 
  isAdding = false, 
  addButtonText = "Add",
  className = "",
}: SearchTrackCardProps) {

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center gap-4">
        {track.image_url ? (
          <Image
            src={track.image_url}
            alt={track.image_alt}
            width={64}
            height={64}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-gray-500" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2"> 
            <h4 className="font-semibold text-lg truncate">{track.title}</h4>
            {track.streaming_service && <BrandLogo brand={track.streaming_service} variant="primary" size="sm" />}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {track.artist}
          </p>
          {track.album && (
            <p className="text-xs text-muted-foreground truncate">
              {track.album}
            </p>
          )}
        </div>

        {onAdd && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onAdd(track)}
              disabled={isAdding}
              className="min-w-[80px]"
            >
              <Plus className="w-4 h-4 mr-1" />
              {addButtonText}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
