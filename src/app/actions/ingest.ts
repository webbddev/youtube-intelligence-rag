"use server";

import { db } from "@/lib/db";
import { sources, chunks } from "@/lib/db/schema";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import {
  extractVideoId,
  fetchTranscript,
  combineTranscript,
  fetchVideoMetadata,
  type TranscriptSegment,
} from "@/lib/transcript";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { eq } from "drizzle-orm";

export interface IngestResult {
  videoId: string;
  title: string;
  chunksCreated: number;
  status: "success" | "error" | "skipped";
  message: string;
}

interface ChunkWithTimestamp {
  text: string;
  startTime: number | null;
  endTime: number | null;
  index: number;
}

/**
 * Map text chunks back to approximate timestamps from original segments.
 */
function mapChunksToTimestamps(
  chunkTexts: string[],
  segments: TranscriptSegment[]
): ChunkWithTimestamp[] {
  const results: ChunkWithTimestamp[] = [];
  let segIdx = 0;
  let charCount = 0;

  // Build a cumulative character map from segments
  const segmentBoundaries: { start: number; end: number; offset: number; duration: number }[] = [];
  let cumLen = 0;
  for (const seg of segments) {
    const start = cumLen;
    cumLen += seg.text.length + 1; // +1 for the space joiner
    segmentBoundaries.push({
      start,
      end: cumLen,
      offset: seg.offset,
      duration: seg.duration,
    });
  }

  for (let i = 0; i < chunkTexts.length; i++) {
    const chunk = chunkTexts[i];
    // Find which segment this chunk starts in
    const chunkStart = charCount;
    const chunkEnd = charCount + chunk.length;

    let startSegment = segmentBoundaries.find(
      (b) => b.start <= chunkStart && b.end > chunkStart
    );
    let endSegment = segmentBoundaries.find(
      (b) => b.start < chunkEnd && b.end >= chunkEnd
    );

    // Fallback: use first/last segment if bounds aren't found
    if (!startSegment) startSegment = segmentBoundaries[0];
    if (!endSegment) endSegment = segmentBoundaries[segmentBoundaries.length - 1];

    results.push({
      text: chunk,
      startTime: startSegment ? Math.floor(startSegment.offset / 1000) : null,
      endTime: endSegment
        ? Math.floor((endSegment.offset + endSegment.duration) / 1000)
        : null,
      index: i,
    });

    charCount = chunkEnd;
  }

  return results;
}

/**
 * Ingest one or more YouTube URLs: fetch transcripts, chunk, embed, and store.
 */
export async function ingestVideos(
  urls: string[]
): Promise<IngestResult[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const results: IngestResult[] = [];

  for (const url of urls) {
    try {
      // Extract video ID
      const videoId = extractVideoId(url.trim());
      if (!videoId) {
        results.push({
          videoId: url,
          title: "Unknown",
          chunksCreated: 0,
          status: "error",
          message: "Invalid YouTube URL format.",
        });
        continue;
      }

      // Check if already ingested
      const existing = await db
        .select()
        .from(sources)
        .where(eq(sources.videoId, videoId))
        .limit(1);

      if (existing.length > 0) {
        results.push({
          videoId,
          title: existing[0].title,
          chunksCreated: 0,
          status: "skipped",
          message: "Video already ingested.",
        });
        continue;
      }

      // Fetch transcript
      const segments = await fetchTranscript(videoId);
      if (segments.length === 0) {
        results.push({
          videoId,
          title: "Unknown",
          chunksCreated: 0,
          status: "error",
          message: "No transcript available for this video.",
        });
        continue;
      }

      // Combine & chunk
      const fullText = combineTranscript(segments);
      const chunkTexts = await splitter.splitText(fullText);
      const chunksWithTimestamps = mapChunksToTimestamps(chunkTexts, segments);

      // Generate embeddings in batch
      const embeddings = await generateEmbeddings(
        chunksWithTimestamps.map((c) => c.text)
      );

      // Fetch metadata
      const { title: videoTitle } = await fetchVideoMetadata(videoId);
      
      // Create source record
      const [source] = await db
        .insert(sources)
        .values({
          videoId,
          title: videoTitle,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        })
        .returning();

      // Insert chunks with embeddings
      const chunkValues = chunksWithTimestamps.map((chunk, idx) => ({
        sourceId: source.id,
        content: chunk.text,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        chunkIndex: chunk.index,
        embedding: embeddings[idx],
      }));

      // Insert in batches of 50 to avoid payload limits
      const BATCH_SIZE = 50;
      for (let i = 0; i < chunkValues.length; i += BATCH_SIZE) {
        const batch = chunkValues.slice(i, i + BATCH_SIZE);
        await db.insert(chunks).values(batch);
      }

      results.push({
        videoId,
        title: videoTitle,
        chunksCreated: chunkValues.length,
        status: "success",
        message: `Ingested ${chunkValues.length} chunks.`,
      });
    } catch (error) {
      const videoId = extractVideoId(url.trim()) ?? url;
      results.push({
        videoId,
        title: "Unknown",
        chunksCreated: 0,
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unknown error occurred.",
      });
    }
  }

  return results;
}
