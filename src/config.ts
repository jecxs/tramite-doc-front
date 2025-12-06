import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});

export const config = {
  SOCKET_URL: env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
} as const;

export type Config = typeof config;
