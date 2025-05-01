import { type MediaType, type TranscodeStatus } from "@workspace/types/db-types";
import { type MovieResult } from "moviedb-promise";

export interface BaseAPIResponse {
  status: number;
  error?: string;
}

/**
 * Media API
 */
export interface MoviesAPIData {
  movies: MovieAPIData[];
}
export interface MovieAPIData {
  id: number;
  transcodeStatus: TranscodeStatus;
  metadata: MovieResult;
}

export interface ShowsAPIData {
  shows: {
    id: number;
  }[];
}

export interface MediaAPIData {
  type: MediaType;
  transcodeStatus: TranscodeStatus;
  metadata: MovieResult; // Only supports movies for now
}

/**
 * Video API
 */
export interface TranscodeRequestAPIData {
  status: TranscodeStatus;
}
export interface TranscodePlaylistAPIData {
  playlistUrl?: string;
}

export type APINotification = NotificationTranscodeReady;
export interface NotificationTranscodeReady {
  type: "transcode:ready";
  data: {
    title: string;
  }
}