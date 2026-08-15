import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  SESSION_SECRET: z.string().min(16).default("local-development-session-secret-change-me"),
  TOKEN_ENCRYPTION_KEY: z.string().optional(),
  CONTENT_STUDIO_PUBLISH_MODE: z.enum(["simulated", "live"]).default("simulated"),
  SEED_DEMO_DATA: z.enum(["true", "false"]).default("false"),
  AI_BASE_URL: z.string().url().optional().or(z.literal("")),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  N8N_INGESTION_TOKEN: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_REDIRECT_URI: z.string().url().default("http://localhost:3000/api/linkedin/callback"),
  LINKEDIN_API_VERSION: z.string().default("202508"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  APP_URL: process.env.APP_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  TOKEN_ENCRYPTION_KEY: process.env.TOKEN_ENCRYPTION_KEY,
  CONTENT_STUDIO_PUBLISH_MODE: process.env.CONTENT_STUDIO_PUBLISH_MODE,
  SEED_DEMO_DATA: process.env.SEED_DEMO_DATA,
  AI_BASE_URL: process.env.AI_BASE_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_MODEL: process.env.AI_MODEL,
  N8N_INGESTION_TOKEN: process.env.N8N_INGESTION_TOKEN,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_REDIRECT_URI: process.env.LINKEDIN_REDIRECT_URI,
  LINKEDIN_API_VERSION: process.env.LINKEDIN_API_VERSION,
});
