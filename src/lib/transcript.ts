import { YoutubeTranscript } from "youtube-transcript";

export interface TranscriptSegment {
  text: string;
  offset: number; // milliseconds
  duration: number; // milliseconds
}

/**
 * Extract the video ID from various YouTube URL formats.
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Fetch transcript for a YouTube video.
 * @param videoId - YouTube video ID
 * @param lang - Language code (default: "en") — easy to extend later
 */
export async function fetchTranscript(
  videoId: string,
  lang: string = "en"
): Promise<TranscriptSegment[]> {
  const segments = await YoutubeTranscript.fetchTranscript(videoId, {
    lang,
  });

  return segments.map((seg) => ({
    text: seg.text,
    offset: seg.offset,
    duration: seg.duration,
  }));
}

/**
 * Combine transcript segments into full text, preserving timestamp markers.
 */
export function combineTranscript(segments: TranscriptSegment[]): string {
  return segments.map((seg) => seg.text).join(" ");
}

/**
 * Fetch metadata (title, author) for a YouTube video using oEmbed.
 */
export async function fetchVideoMetadata(videoId: string): Promise<{ title: string; author: string }> {
  try {
    const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await response.json();
    return {
      title: data.title || `YouTube Video: ${videoId}`,
      author: data.author_name || "Unknown",
    };
  } catch (error) {
    return {
      title: `YouTube Video: ${videoId}`,
      author: "Unknown",
    };
  }
}

/**
 * Convert milliseconds to MM:SS format for display.
 */
export function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
