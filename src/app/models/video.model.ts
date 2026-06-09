/**
 * Typed models for the Pexels Videos API.
 * Shapes verified against a real API response — no `any` anywhere in the data path.
 * See: https://www.pexels.com/api/documentation/#videos
 */

export interface PexelsUser {
  id: number;
  name: string;
  url: string;
}

/** A single downloadable rendition of a video at one resolution. */
export interface VideoFile {
  id: number;
  /** Coarse quality bucket only ('sd' | 'hd' | 'uhd'); NOT a resolution. */
  quality: string;
  /** e.g. 'video/mp4'. */
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
  size: number;
}

export interface Video {
  id: number;
  width: number;
  height: number;
  /** Duration in whole seconds. */
  duration: number;
  url: string;
  /** Poster / thumbnail image URL. */
  image: string;
  user: PexelsUser;
  video_files: VideoFile[];
}

/** Shape of the /popular and /search list endpoints. */
export interface PexelsResponse {
  videos: Video[];
  total_results: number;
  page: number;
  per_page: number;
}
