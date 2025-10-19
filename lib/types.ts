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
  artist?: string | "";
  streaming_service?: string | "";
  status: SongStatus;
  created_at: string;
}

export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
  preview_url?: string;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}