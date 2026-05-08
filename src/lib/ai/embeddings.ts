import { embed, embedMany } from "ai";
import { gateway } from "./gateway";

const embeddingModel = gateway.textEmbeddingModel(
  "openai/text-embedding-3-small"
);

/**
 * Generate embedding for a single text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}

/**
 * Generate embeddings for multiple text strings in batch.
 */
export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  });
  return embeddings;
}
