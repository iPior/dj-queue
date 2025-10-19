"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface TrackCardData {
  id: string;
  title: string;
  artist: string;
  album?: string;
  imageUrl?: string;
  imageAlt?: string;
}

interface TrackCardProps {
  track: TrackCardData;
  onAdd?: (track: TrackCardData) => void;
  isAdding?: boolean;
  addButtonText?: string;
  className?: string;
}

export function TrackCard({ 
  track, 
  onAdd, 
  isAdding = false, 
  addButtonText = "Add",
  className = ""
}: TrackCardProps) {
  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center gap-4">
        {track.imageUrl && (
          <img
            src={track.imageUrl}
            alt={track.imageAlt || track.album || track.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-lg truncate">{track.title}</h4>
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
