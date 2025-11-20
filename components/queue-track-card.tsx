"use client";

import { Button } from "@/components/ui/button";
import { Check, Music, Trash2, X } from "lucide-react";
import Image from "next/image";
import { SongStatus, Track } from "@/lib/types";
import { BrandLogo } from "./brand-logo";

export interface QueueTrackCardProps {
  track: Track;
  status?: SongStatus;
  position?: number;
  isDJ?: boolean;
  onStatusChange?: (songId: string, status: SongStatus) => void;
  onDelete?: (songId: string) => void;
  className?: string;
}

export function QueueTrackCard({ 
  track, 
  status,
  isDJ = false,
  onStatusChange,
  onDelete,
  className = "",
  position = 1,
}: QueueTrackCardProps) {

  const getStatusConfig = () => {
    if (!status) return null;
    
    switch (status) {
      case "accepted":
        return {
          actionText: "Mark as Played",
          actionStatus: "played" as SongStatus,
        };
      case "pending":
        return {
          actionText: "Accept",
          actionStatus: "accepted" as SongStatus,
        };
      case "rejected":
        return {
          actionText: "Re-accept",
          actionStatus: "accepted" as SongStatus,
        };
      default:
        return {
        };
    }
  };

  const statusConfig = getStatusConfig();
  if (!statusConfig) return null;

  if (status === "played") {
    return (
      <div className={` border rounded-md px-3 py-1 ${className} h-full bg-primary/40`}>
        <div className="flex items-center justify-between h-full">
          {/* <div className="text-sm font-bold text-muted-foreground mr-2 h-full flex items-start">{position}. </div> */}
          {/* card */}
          <div className="flex items-center w-full gap-2">
            {/* image */}
            {/* {track.image_url ? (
              <Image 
                src={track.image_url}  
                alt={track.image_alt || track.title || ""} 
                width={24} 
                height={24}
                className="rounded-lg object-cover border"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-500" />
              </div>
            )} */}

            {/* content */}
            <div className="flex-1 min-w-0">

              {/* top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {track.streaming_service && <BrandLogo brand={track.streaming_service} variant="primary" size="sm" />}
                  <h4 className="font-semibold text-lg truncate">{track.title}</h4>
                  <p className="text-md text-muted-foreground truncate">
                    {track.artist}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground font-bold uppercase truncate">
                  <Check className="w-5 h-5 text-muted-foreground font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else if (status === "rejected") {
    return (
      <div className={` border rounded-md px-3 py-1 ${className} h-full bg-destructive/40`}>
        <div className="flex items-center justify-between h-full">
          {/* <div className="text-sm font-bold text-muted-foreground mr-2 h-full flex items-start">{position}. </div> */}
          {/* card */}
          <div className="flex items-center w-full gap-2">
            {/* image */}
            {/* {track.image_url ? (
              <Image 
                src={track.image_url}  
                alt={track.image_alt || track.title || ""} 
                width={24} 
                height={24}
                className="rounded-lg object-cover border"
              />
            ) : (
              <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-500" />
              </div>
            )} */}

            {/* content */}
            <div className="flex-1 min-w-0">

              {/* top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {track.streaming_service && <BrandLogo brand={track.streaming_service} variant="primary" size="sm" />}
                  <h4 className="font-semibold text-lg truncate">{track.title}</h4>
                  <p className="text-md text-muted-foreground truncate">
                    {track.artist}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground font-bold uppercase truncate">
                  <X className="w-5 h-5 text-muted-foreground font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className={` border rounded-md p-3 ${className} h-full`}>
        <div className="flex items-center justify-between h-full">
          <div className="text-sm font-bold text-muted-foreground mr-2 h-15 flex items-start">{position}. </div>
          {/* card */}
          <div className="flex items-center gap-3 w-full">
            {/* image */}
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

            {/* content */}
            <div className="flex-1 min-w-0">
              {/* top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-lg truncate">{track.title}</h4>
                  {track.streaming_service && <BrandLogo brand={track.streaming_service} variant="primary" size="sm" />}
                </div>
                <div className="flex items-center gap-2">
                  {status && (
                    <span className="text-xs text-muted-foreground uppercase truncate">
                      {status}
                    </span>
                  )}
                  {isDJ && onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(track.id)}
                      className="text-destructive hover:cursor-pointer p-0"
                      >
                      <Trash2 className="w-3 h-3 hover:cursor-pointer" />
                      {/* <X className="w-3 h-3 hover:cursor-pointer" /> */}
                    </Button>
                  )}
                </div>
              </div>

              {/* bottom row */} 
              <div className="flex items-center justify-between">
                {/* artist and album */}
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
                
                {/* status actions */}
                <div>
                  {isDJ && onStatusChange && (<div className="flex items-center gap-2">
                    {status === "pending" && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onStatusChange(track.id, "rejected")}
                      >
                        Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onStatusChange(track.id, statusConfig.actionStatus!)}
                      className="hover:cursor-pointer"
                    >
                      {statusConfig.actionText}
                    </Button>
                  </div>)}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }
}
