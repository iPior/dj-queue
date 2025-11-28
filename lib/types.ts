export type SongStatus = "pending" | "accepted" | "rejected" | "played";
export type StreamingService = "spotify" | "apple-music" | "soundcloud";

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  image_url: string | "";
  image_alt: string | "";
  status?: SongStatus;
  queue_id?: string;
  streaming_service?: StreamingService;
  created_at: string;
  spotify_track_uri: string;
}

export interface Queue {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  dj_id: string;
  status: string;
  created_at: string;
  spotify_playlist_id: string | null;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  email: string;
  avatar_url: string | null;
  streaming_services: string[] | null;
  onboarded: boolean;
  active_queue: string | null;
  created_at: string;
  updated_at: string;
  connected_services: {
    [key: string]: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      connected: boolean;
    } | null;
  };
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
  uri: string;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
  };
}