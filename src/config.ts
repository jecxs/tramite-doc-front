import env from 'env-var';

const API_URL = env.get('NEXT_PUBLIC_API_URL').default('http://localhost:3000/api').asUrlString();
const SOCKET_URL_EXPLICIT = env.get('NEXT_PUBLIC_SOCKET_URL').default('ws://localhost:3000').asUrlString();
const NODE_ENV = env.get('NODE_ENV').default('development').asEnum(['development', 'test', 'production']);

export const config = {
  API_URL: API_URL,
  SOCKET_URL: SOCKET_URL_EXPLICIT || new URL(API_URL).origin,
  NEXT_PUBLIC_API_URL: API_URL,
  NODE_ENV,
} as const;

export type Config = typeof config;
