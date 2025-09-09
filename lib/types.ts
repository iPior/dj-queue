export type SongStatus = "pending" | "accepted" | "rejected" | "played";

export interface Queue {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  dj_id: string;
  status: string;
  created_at: string;
}

export interface User {
  id: string;
  // add other fields if needed
}

export interface Song {
  id: string;
  queue_id: string;
  title: string;
  artist?: string | null;
  streaming_service?: string | null;
  status: SongStatus;
  created_at: string;
}

export interface NewSong {
  title: string;
  artist?: string | null;
  streaming_service?: string | null;
}