"use client";

import { TrackCard, TrackCardData } from "@/components/track-card";
import { Button } from "@/components/ui/button";
import { Song } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface QueueTrackCardProps {
  song: Song;
  position?: number;
  isDJ: boolean;
  onStatusChange?: (songId: string, status: string) => void;
  onDelete?: (songId: string) => void;
  className?: string;
}

export function QueueTrackCard({ 
  song, 
  position, 
  isDJ, 
  onStatusChange,
  onDelete,
  className = ""
}: QueueTrackCardProps) {
  // Convert Song to TrackCardData format
  const trackData: TrackCardData = {
    id: song.id,
    title: song.title,
    artist: song.artist || "Unknown Artist",
    album: song.streaming_service,
    imageUrl: undefined, // Songs in queue don't have album art
    imageAlt: song.title,
  };

  // Get status-specific styling and content
  const getStatusConfig = () => {
    switch (song.status) {
      case "played":
        return {
          bgColor: "bg-blue-100",
          borderColor: "border-blue-200",
          positionIcon: "✓",
          positionBg: "bg-blue-600",
          showActions: false,
        };
      case "accepted":
        return {
          bgColor: "bg-green-100",
          borderColor: "border-green-200",
          positionIcon: position?.toString() || "?",
          positionBg: "bg-green-600",
          showActions: isDJ,
          actionText: "Mark as Played",
          actionVariant: "outline" as const,
          actionStatus: "played",
        };
      case "pending":
        return {
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
          positionIcon: "?",
          positionBg: "bg-yellow-500",
          showActions: isDJ,
          actionText: "Accept",
          actionVariant: "default" as const,
          actionStatus: "accepted",
        };
      case "rejected":
        return {
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
          positionIcon: "✗",
          positionBg: "bg-red-600",
          showActions: isDJ,
          actionText: "Re-accept",
          actionVariant: "outline" as const,
          actionStatus: "accepted",
        };
      default:
        return {
          bgColor: "bg-gray-100",
          borderColor: "border-gray-200",
          positionIcon: "?",
          positionBg: "bg-gray-600",
          showActions: false,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-md p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`${statusConfig.positionBg} text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold`}>
            {statusConfig.positionIcon}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg truncate">{trackData.title}</h4>
            <p className="text-sm text-muted-foreground truncate">
              {trackData.artist}
            </p>
            {trackData.album && (
              <p className="text-xs text-muted-foreground truncate">
                {trackData.album}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {statusConfig.showActions && onStatusChange && (
            <>
              {song.status === "pending" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusChange(song.id, "rejected")}
                >
                  Reject
                </Button>
              )}
              <Button
                size="sm"
                variant={statusConfig.actionVariant}
                onClick={() => onStatusChange(song.id, statusConfig.actionStatus!)}
              >
                {statusConfig.actionText}
              </Button>
            </>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(song.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
