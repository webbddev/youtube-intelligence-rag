import { defineConfig } from "drizzle-kit";

// Load .env.local for local development (Node 20+)
process.loadEnvFile(".env.local");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/lib/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
