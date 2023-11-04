import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),

  // Authentication
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // Database
  DATABASE_AUTH_TOKEN: z.string(),
  DATABASE_URL: z.string(),

  // AI
  OPENAI_API_KEY: z.string(),

  // Files
  APP_AWS_ACCESS_KEY: z.string(),
  APP_AWS_SECRET_KEY: z.string(),
  APP_AWS_BUCKET: z.string(),
  PUBLIC_APP_AWS_CLOUDFRONT_URL: z.string(),
});

export const env = envSchema.parse(process.env);
