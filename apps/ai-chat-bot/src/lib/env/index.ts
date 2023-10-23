import "dotenv/config"
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string()
});

export const env = envSchema.parse(process.env);

