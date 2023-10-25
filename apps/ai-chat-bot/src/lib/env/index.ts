import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  DATABASE_AUTH_TOKEN: z.string(),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
