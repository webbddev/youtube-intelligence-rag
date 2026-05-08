import { streamText, tool, stepCountIs, UIMessage, convertToModelMessages } from "ai";
import { z } from "zod";
import { gateway } from "@/lib/ai/gateway";
import { searchKnowledgeBase } from "@/lib/search";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: gateway("openai/gpt-4o-mini"),
    system: `You are a knowledgeable assistant that answers questions based on YouTube video transcripts stored in a knowledge base.

RULES:
- Always search the knowledge base before answering questions about video content.
- When citing information, include the source video ID, timestamp range, and a brief quote.
- Format citations as [Source: videoId @ MM:SS - MM:SS] after relevant statements.
- If the knowledge base has no relevant results, say so honestly.
- Be concise but thorough in your answers.
- When multiple sources are relevant, synthesize information across them.`,
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools: {
      searchKnowledgeBase: tool({
        description:
          "Search the transcript knowledge base for relevant segments. Use this tool whenever the user asks about video content, topics, or wants specific information from the ingested transcripts.",
        inputSchema: z.object({
          query: z
            .string()
            .describe("The search query to find relevant transcript segments"),
        }),
        execute: async ({ query }: { query: string }) => {
          const results = await searchKnowledgeBase(query, 5);
          return results.map((r) => ({
            content: r.content,
            videoId: r.videoId,
            videoTitle: r.videoTitle,
            videoUrl: r.videoUrl,
            startTime: r.startTime,
            endTime: r.endTime,
            similarity: Math.round(r.similarity * 100) / 100,
          }));
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
