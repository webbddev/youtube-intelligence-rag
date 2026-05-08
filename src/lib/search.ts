import { sql, desc } from "drizzle-orm";
import { db } from "./db";
import { chunks, sources } from "./db/schema";
import { generateEmbedding } from "./ai/embeddings";

export interface SearchResult {
  id: number;
  content: string;
  startTime: number | null;
  endTime: number | null;
  similarity: number;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
}

/**
 * Perform cosine similarity search against stored transcript chunks.
 * Returns the top K most relevant segments for a given query.
 */
export async function searchKnowledgeBase(
  query: string,
  topK: number = 5
): Promise<SearchResult[]> {
  // Generate embedding for the search query
  const queryEmbedding = await generateEmbedding(query);
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  // Cosine distance: pgvector uses <=> operator
  // similarity = 1 - cosineDistance
  const results = await db
    .select({
      id: chunks.id,
      content: chunks.content,
      startTime: chunks.startTime,
      endTime: chunks.endTime,
      similarity: sql<number>`1 - (${chunks.embedding} <=> ${embeddingStr}::vector)`.as(
        "similarity"
      ),
      videoId: sources.videoId,
      videoTitle: sources.title,
      videoUrl: sources.url,
    })
    .from(chunks)
    .innerJoin(sources, sql`${chunks.sourceId} = ${sources.id}`)
    .orderBy(desc(sql`1 - (${chunks.embedding} <=> ${embeddingStr}::vector)`))
    .limit(topK);

  return results;
}
