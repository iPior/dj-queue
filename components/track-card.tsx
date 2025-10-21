"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Plus, X } from "lucide-react";
import Image from "next/image";
import { SongStatus, StreamingService, Track } from "@/lib/types";
import { BrandLogo } from "./brand-logo";

export interface TrackCardProps {
  track: Track;
  // Search mode props
  onAdd?: (track: Track) => void;
  isAdding?: boolean;
  addButtonText?: string;
  // Queue mode props
  mode?: "search" | "queue";
  status?: SongStatus;
  position?: number;
  isDJ?: boolean;
  onStatusChange?: (songId: string, status: SongStatus) => void;
  onDelete?: (songId: string) => void;
  // Common props
  className?: string;
}

export function TrackCard({ 
  track, 
  onAdd, 
  isAdding = false, 
  addButtonText = "Add",
  mode = "search",
  status,
  isDJ = false,
  onStatusChange,
  onDelete,
  className = ""
}: TrackCardProps) {
  // Get status-specific styling and content for queue mode
  const getStatusConfig = () => {
    if (mode !== "queue" || !status) return null;
    
    switch (status) {
      case "played":
        return {
          showActions: false,
        };
      case "accepted":
        return {
          showActions: isDJ,
          actionText: "Mark as Played",
          actionVariant: "outline" as const,
          actionStatus: "played" as SongStatus,
        };
      case "pending":
        return {
          showActions: isDJ,
          actionText: "Accept",
          actionVariant: "default" as const,
          actionStatus: "accepted" as SongStatus,
        };
      case "rejected":
        return {
          showActions: isDJ,
          actionText: "Re-accept",
          actionVariant: "outline" as const,
          actionStatus: "accepted" as SongStatus,
        };
      default:
        return {
          showActions: false,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Render queue mode
  if (mode === "queue" && statusConfig) {
    return (
      <div className={` border rounded-md p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            {track.image_url ? (
              <Image 
                src={track.image_url}  
                alt={track.image_alt || track.title || ""} 
                width={60} 
                height={60}
                className="rounded-lg object-cover border"
              />
            ) : (
              <div className="w-15 h-15 bg-gray-200 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-lg truncate">{track.title}</h4>
                  {track.streaming_service && <BrandLogo brand={track.streaming_service} variant="primary" size="sm" />}
                  {/* {!track.streaming_service && <span className="text-xs text-muted-foreground uppercase truncate">Unknown</span>} */}
                </div>
                <div className="flex items-center gap-2">
                  {status && (
                    <span className="text-xs text-muted-foreground uppercase truncate">
                      {status}
                    </span>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(track.id)}
                      className="text-destructive hover:cursor-pointer p-0"
                      >
                      {/* <Trash2 className="w-4 h-4 hover:cursor-pointer" /> */}
                      <X className="w-3 h- hover:cursor-pointer" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-md text-muted-foreground truncate">
                    {track.artist}
                  </p>
                  {track.album && (
                    <p className="text-xs text-muted-foreground truncate">
                      {track.album}
                    </p>
                  )}
                </div>
                <div>
                  {statusConfig.showActions && onStatusChange && (
              <div className="flex items-center gap-2">
                {status === "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(track.id, "rejected")}
                  >
                    Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(track.id, statusConfig.actionStatus!)}
                  className="hover:cursor-pointer text-green-500"
                >
                  {statusConfig.actionText}
                </Button>
              </div>
            )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render search mode (default)
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
