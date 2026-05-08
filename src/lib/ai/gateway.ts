import { createGateway } from "@ai-sdk/gateway";

// Single gateway instance for all AI calls (chat + embeddings)
// Routes through Vercel AI Gateway — no separate OPENAI_API_KEY needed
export const gateway = createGateway({
  apiKey: process.env.AI_GATEWAY_API_KEY,
});
