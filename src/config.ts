const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const SOCKET_URL_EXPLICIT = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3000';
const NODE_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'test' | 'production';


export const config = {
  API_URL,
  SOCKET_URL: SOCKET_URL_EXPLICIT || new URL(API_URL).origin,
  NEXT_PUBLIC_API_URL: API_URL,
  NODE_ENV
} as const;

export type Config = typeof config;
